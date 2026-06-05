import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const rutas = await prisma.ruta.findMany({
      where: {
        choferId: choferId,
        estado: { in: ["HABILITADA", "EN_CURSO", "COMPLETADA"] },
      },
      include: {
        frecuencia: {
          select: {
            ciudadOrigen: true,
            ciudadDestino: true,
            hora: true,
          },
        },
        bus: {
          select: {
            numero: true,
            placa: true,
            totalAsientos: true,
          },
        },
        boletos: {
          select: {
            id: true,
            estado: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    const rutasFormateadas = rutas.map((ruta) => ({
      id: ruta.id,
      fecha: ruta.fecha,
      origen: ruta.frecuencia.ciudadOrigen,
      destino: ruta.frecuencia.ciudadDestino,
      hora: ruta.frecuencia.hora,
      estado: ruta.estado,
      bus: {
        numero: ruta.bus.numero,
        placa: ruta.bus.placa,
        totalAsientos: ruta.bus.totalAsientos,
      },
      totalPasajeros: ruta.boletos.length,
      abordo: ruta.boletos.filter((b) => b.estado === "ABORDADO").length,
      pendientes: ruta.boletos.filter((b) => b.estado === "PAGADO").length,
    }));

    return NextResponse.json(rutasFormateadas);
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    return NextResponse.json(
      { error: "Error al obtener las rutas asignadas" },
      { status: 500 }
    );
  }
}