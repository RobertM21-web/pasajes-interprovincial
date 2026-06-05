import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reportes = await (prisma as any).choferReporte.findMany({
      include: {
        chofer: { select: { nombre: true } },
        ruta: {
          select: {
            fecha: true,
            frecuencia: {
              select: { ciudadOrigen: true, ciudadDestino: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formateados = reportes.map((r: any) => ({
  id: r.id,
  tipo: r.tipo,
  descripcion: r.descripcion,
  createdAt: r.createdAt,
  chofer: r.chofer,
  ruta: r.ruta
    ? `${r.ruta.frecuencia?.ciudadOrigen || "?"} → ${r.ruta.frecuencia?.ciudadDestino || "?"}`
    : "Sin ruta (reporte de bus)",
}));
    return NextResponse.json(formateados);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al cargar reportes" }, { status: 500 });
  }
}