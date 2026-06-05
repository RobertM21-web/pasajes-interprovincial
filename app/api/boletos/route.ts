import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST /api/boletos — crear boleto con validación de concurrencia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await getServerSession(authOptions)
    const usuarioId = session?.user?.id

    // CASO 1: Múltiples boletos en un lote transaccional
    if (Array.isArray(body)) {
      const boletosCreados = await prisma.$transaction(async (tx) => {
        const result = [];
        for (const item of body) {
          const {
            rutaId,
            asientoId,
            usuarioId: itemUsuarioId,
            vendidoPorId,
            pasajeroNombre,
            pasajeroCedula,
            tipoPasajero,
            origenTramo,
            destinoTramo,
            metodoPago,
            canalVenta,
            emailEnvio
          } = item;

          if (!rutaId || !asientoId || !pasajeroNombre || !pasajeroCedula || !origenTramo || !destinoTramo) {
            throw new Error('Faltan campos requeridos en la información de uno de los pasajeros');
          }

          // Verificar si el asiento existe
          const asiento = await tx.asiento.findUnique({
            where: { id: asientoId },
            include: { categoria: true }
          });

          if (!asiento) {
            throw new Error(`El asiento seleccionado no existe`);
          }

          // Calcular precio
          const precioBase = Number(asiento.categoria.precioBase);
          let descuento = 0;
          if (tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACIDAD') {
            descuento = 0.5;
          } else if (tipoPasajero === 'MENOR_EDAD') {
            descuento = 0.25;
          }

          const precioFinal = precioBase * (1 - descuento);
          const finalUsuarioId = itemUsuarioId || usuarioId;

          // Crear boleto
          const boleto = await tx.boleto.create({
            data: {
              rutaId,
              asientoId,
              usuarioId: finalUsuarioId,
              vendidoPorId,
              pasajeroNombre,
              pasajeroCedula,
              tipoPasajero: tipoPasajero || 'NORMAL',
              precioBase,
              descuento,
              precioFinal,
              metodoPago: metodoPago || 'TRANSFERENCIA',
              canalVenta: canalVenta || 'ONLINE',
              origenTramo,
              destinoTramo,
              emailEnvio: emailEnvio?.trim()?.toLowerCase() || null,
              estado: canalVenta === 'OFICINA' ? 'PAGADO' : 'PENDIENTE'
            },
            include: {
              asiento: { include: { categoria: true } },
              ruta: { include: { frecuencia: true } }
            }
          });

          result.push(boleto);
        }
        return result;
      });

      return NextResponse.json(boletosCreados, { status: 201 });
    }

    // CASO 2: Un solo boleto (retrocompatibilidad)
    const {
      rutaId,
      asientoId,
      usuarioId: bodyUsuarioId,
      vendidoPorId,
      pasajeroNombre,
      pasajeroCedula,
      tipoPasajero,
      origenTramo,
      destinoTramo,
      metodoPago,
      canalVenta,
      emailEnvio
    } = body
    const finalUsuarioId = bodyUsuarioId || usuarioId

    if (!rutaId || !asientoId || !pasajeroNombre || !pasajeroCedula || !origenTramo || !destinoTramo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const asiento = await prisma.asiento.findUnique({
      where: { id: asientoId },
      include: { categoria: true }
    })

    if (!asiento) {
      return NextResponse.json(
        { error: 'Asiento no encontrado' },
        { status: 404 }
      )
    }

    const precioBase = Number(asiento.categoria.precioBase)
    let descuento = 0
    if (tipoPasajero === 'TERCERA_EDAD' || tipoPasajero === 'DISCAPACIDAD') {
      descuento = 0.5
    } else if (tipoPasajero === 'MENOR_EDAD') {
      descuento = 0.25
    }

    const precioFinal = precioBase * (1 - descuento)

    const boleto = await prisma.boleto.create({
      data: {
        rutaId,
        asientoId,
        usuarioId: finalUsuarioId,
        vendidoPorId,
        pasajeroNombre,
        pasajeroCedula,
        tipoPasajero: tipoPasajero || 'NORMAL',
        precioBase,
        descuento,
        precioFinal,
        metodoPago: metodoPago || 'TRANSFERENCIA',
        canalVenta: canalVenta || 'ONLINE',
        origenTramo,
        destinoTramo,
        emailEnvio: emailEnvio?.trim()?.toLowerCase() || null,
        estado: canalVenta === 'OFICINA' ? 'PAGADO' : 'PENDIENTE'
      },
      include: {
        asiento: { include: { categoria: true } },
        ruta: { include: { frecuencia: true } }
      }
    })

    return NextResponse.json(boleto, { status: 201 })

  } catch (error: any) {
    console.error('Error en POST /api/boletos:', error)
    if (
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') ||
      error?.message?.includes('Unique constraint') ||
      error?.message?.includes('asiento ya fue tomado')
    ) {
      return NextResponse.json(
        { error: 'El asiento ya fue tomado por otro usuario' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: error?.message || 'Error al crear el boleto' },
      { status: 500 }
    )
  }
}

