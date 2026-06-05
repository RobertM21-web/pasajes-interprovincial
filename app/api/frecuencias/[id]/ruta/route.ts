import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper to get today's date in UTC (date only)
function getTodayUTC() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

// GET /api/frecuencias/[id]/ruta
// Obtiene la ruta y el bus asignado para el día de hoy
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: frecuenciaId } = await params;
    const today = getTodayUTC();

    const ruta = await prisma.ruta.findFirst({
      where: {
        frecuenciaId,
        fecha: today,
      },
      include: {
        bus: {
          include: {
            categorias: {
              include: {
                asientos: true,
              },
            },
          },
        },
        boletos: {
          where: {
            estado: { not: "CANCELADO" },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!ruta) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      ...ruta,
      boletosVendidos: ruta.boletos.length,
    });
  } catch (error) {
    console.error("Error al obtener la ruta de hoy:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/frecuencias/[id]/ruta
// Asigna un bus a la frecuencia creando una ruta para hoy
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!session || !userEmail) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: userEmail },
      include: { rol: true },
    });

    if (!usuario || (usuario.rol.nombre !== "ADMIN" && usuario.rol.nombre !== "OFICINISTA")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id: frecuenciaId } = await params;
    const body = await request.json();
    const { busId } = body;

    if (!busId) {
      return NextResponse.json({ error: "El busId es requerido" }, { status: 400 });
    }

    const today = getTodayUTC();

    // 1. Verificar frecuencia
    const frecuencia = await prisma.frecuencia.findUnique({
      where: { id: frecuenciaId },
    });
    if (!frecuencia) {
      return NextResponse.json({ error: "Frecuencia no encontrada" }, { status: 404 });
    }
    if (!frecuencia.activa) {
      return NextResponse.json({ error: "La frecuencia está inactiva" }, { status: 400 });
    }

    // 2. Verificar bus
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
    });
    if (!bus) {
      return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
    }
    if (!bus.activo || !bus.enTerminal) {
      return NextResponse.json({ error: "El bus no está activo o no se encuentra en terminal" }, { status: 400 });
    }

    // 3. Validación de horario (el mismo bus no puede estar asignado a otra ruta a la misma hora hoy)
    const conflicto = await prisma.ruta.findFirst({
      where: {
        busId,
        fecha: today,
        frecuencia: {
          hora: frecuencia.hora,
        },
      },
      include: {
        frecuencia: true,
      },
    });

    if (conflicto) {
      return NextResponse.json(
        {
          error: `Conflicto de horario: El bus ya está asignado a la frecuencia ${conflicto.frecuencia.ciudadOrigen} → ${conflicto.frecuencia.ciudadDestino} a las ${conflicto.frecuencia.hora} hoy.`,
        },
        { status: 400 }
      );
    }

    // 4. Crear la ruta para hoy (con estado HABILITADA)
    // Usamos transacción para evitar doble inserción concurrente
    const nuevaRuta = await prisma.$transaction(async (tx) => {
      // Verificar si ya existe asignación para esta frecuencia hoy
      const rutaExistente = await tx.ruta.findFirst({
        where: { frecuenciaId, fecha: today },
      });
      if (rutaExistente) {
        throw new Error("Esta frecuencia ya tiene un bus asignado para hoy");
      }

      return await tx.ruta.create({
        data: {
          frecuenciaId,
          busId,
          fecha: today,
          oficinistaId: usuario.id,
          estado: "HABILITADA",
        },
        include: {
          bus: {
            include: {
              categorias: {
                include: {
                  asientos: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(nuevaRuta, { status: 201 });
  } catch (error: any) {
    console.error("Error al asignar bus a frecuencia:", error);
    if (error.message === "Esta frecuencia ya tiene un bus asignado para hoy") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/frecuencias/[id]/ruta
// Desasigna el bus de la frecuencia (elimina la ruta de hoy)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!session || !userEmail) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: userEmail },
      include: { rol: true },
    });

    if (!usuario || (usuario.rol.nombre !== "ADMIN" && usuario.rol.nombre !== "OFICINISTA")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id: frecuenciaId } = await params;
    const today = getTodayUTC();

    const ruta = await prisma.ruta.findFirst({
      where: {
        frecuenciaId,
        fecha: today,
      },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: "No hay ninguna asignación activa hoy para esta frecuencia" },
        { status: 404 }
      );
    }

    // Verificar si ya tiene boletos vendidos (si tiene boletos, no se debería poder eliminar la ruta)
    const boletosVendidos = await prisma.boleto.count({
      where: {
        rutaId: ruta.id,
        estado: { not: "CANCELADO" },
      },
    });

    if (boletosVendidos > 0) {
      return NextResponse.json(
        { error: "No se puede desasignar el bus porque ya se han vendido boletos para esta ruta" },
        { status: 400 }
      );
    }

    await prisma.ruta.delete({
      where: { id: ruta.id },
    });

    return NextResponse.json({ message: "Desasignación completada con éxito" });
  } catch (error) {
    console.error("Error al desasignar bus:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
