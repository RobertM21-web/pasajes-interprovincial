import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar reportes del chofer
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const choferId = searchParams.get("choferId");

    if (!choferId) {
      return NextResponse.json(
        { error: "Se requiere choferId" },
        { status: 400 }
      );
    }

const reportes = await (prisma as any).choferReporte.findMany({
      where: { choferId },
      include: {
        ruta: {
          select: {
            fecha: true,
            frecuencia: {
              select: {
                ciudadOrigen: true,
                ciudadDestino: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const reportesFormateados = reportes.map((r: any) => ({
      id: r.id,
      tipo: r.tipo,
      descripcion: r.descripcion,
      fecha: r.createdAt,
      ruta: `${r.ruta.frecuencia.ciudadOrigen} → ${r.ruta.frecuencia.ciudadDestino}`,
      fechaRuta: r.ruta.fecha,
    }));

    return NextResponse.json(reportesFormateados);
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return NextResponse.json(
      { error: "Error al obtener reportes" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo reporte
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { choferId, rutaId, tipo, descripcion } = body;

    if (!choferId || !tipo || !descripcion) {
      return NextResponse.json(
        { error: "choferId, tipo y descripcion son requeridos" },
        { status: 400 }
      );
    }

    const tiposValidos = ["RETRASO", "DANO", "EMERGENCIA", "CLIMA", "TRAFICO", "OTRO"];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Debe ser: ${tiposValidos.join(", ")}` },
        { status: 400 }
      );
    }

    const reporte = await (prisma as any).choferReporte.create({
      data: {
        choferId,
        rutaId: rutaId || null,
        tipo,
        descripcion,
      },
    });

    return NextResponse.json(
      {
        mensaje: "Reporte creado correctamente",
        reporte: {
          id: reporte.id,
          tipo: reporte.tipo,
          descripcion: reporte.descripcion,
          fecha: reporte.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear reporte:", error);
    return NextResponse.json(
      { error: "Error al crear reporte" },
      { status: 500 }
    );
  }
}