import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

// GET /api/boletos/[id] — obtener boleto validando auth y permisos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const userEmail = session?.user?.email
    
    if (!session || !userEmail) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    
    // Obtener usuario actual con su rol
    const usuarioActual = await prisma.usuario.findUnique({
      where: { email: userEmail },
      include: { rol: true }
    })

    if (!usuarioActual) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 401 })
    }

    const esAdminOficinista = ['ADMIN', 'OFICINISTA'].includes(usuarioActual.rol.nombre)

    // Buscar boleto y sus relaciones requeridas
    const boleto = await prisma.boleto.findUnique({
      where: { id },
      include: {
        ruta: {
          include: {
            frecuencia: true,
            bus: true
          }
        },
        asiento: {
          include: {
            categoria: true
          }
        }
      }
    })

    if (!boleto) {
      return NextResponse.json({ error: 'Boleto no encontrado' }, { status: 404 })
    }

    // Verificar ownership
    const esDuenio = boleto.usuarioId === usuarioActual.id

    if (!esDuenio && !esAdminOficinista) {
      return NextResponse.json({ error: 'Acceso denegado. Este boleto no te pertenece.' }, { status: 403 })
    }

    return NextResponse.json(boleto)
  } catch (error: any) {
    console.error('Error al obtener boleto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
