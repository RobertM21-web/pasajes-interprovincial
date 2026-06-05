import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateBoletoQR } from '@/lib/qr'

// PATCH /api/pagos/[id]/validar — oficinista valida o rechaza un comprobante
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { aprobado, motivoRechazo } = body
    const session = await getServerSession(authOptions)
    const vendidoPorId = session?.user?.id

    if (aprobado === undefined) {
      return NextResponse.json(
        { error: 'aprobado es requerido' },
        { status: 400 }
      )
    }

    if (!vendidoPorId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    if (!aprobado && !motivoRechazo) {
      return NextResponse.json(
        { error: 'motivoRechazo es requerido al rechazar' },
        { status: 400 }
      )
    }

    const boleto = await prisma.boleto.findUnique({
      where: { id },
      include: {
        asiento: true,
        ruta: { include: { frecuencia: true } }
      }
    })

    if (!boleto) {
      return NextResponse.json(
        { error: 'Boleto no encontrado' },
        { status: 404 }
      )
    }

    if (boleto.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'Solo se pueden validar boletos en estado PENDIENTE' },
        { status: 400 }
      )
    }

    // Si aprueba, generar QR automáticamente
    if (aprobado) {
      await generateBoletoQR(boleto.id)
    }

    const boletoActualizado = await prisma.boleto.update({
      where: { id },
      data: {
        estado: aprobado ? 'PAGADO' : 'CANCELADO',
        vendidoPorId,
        ...(motivoRechazo && { motivoRechazo }),
      },
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } },
        vendidoPor: { select: { id: true, nombre: true } },
        usuario: { select: { id: true, nombre: true, email: true } }
      }
    })

    let emailMessage: string | null = null
    let emailError: string | null = null

    if (aprobado) {
      const emailDestino = boletoActualizado.emailEnvio || boletoActualizado.usuario?.email
      if (emailDestino) {
        try {
          const emailResponse = await fetch(new URL(`/api/email/reenviar/${boletoActualizado.id}`, request.url), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({ emailDestino }),
          })
          const emailPayload = await emailResponse.json().catch(() => null)
          if (!emailResponse.ok) {
            emailError = emailPayload?.error || "No se pudo enviar el boleto por correo."
          } else {
            emailMessage = emailPayload?.message || `Boletos enviados a ${emailDestino}. Revisa tu bandeja de entrada.`
          }
        } catch (error) {
          emailError = error instanceof Error ? error.message : "No se pudo enviar el boleto por correo."
        }
      }
    }

    return NextResponse.json({ ...boletoActualizado, emailMessage, emailError })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al validar el comprobante' },
      { status: 500 }
    )
  }
}
