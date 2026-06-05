import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { rutaId: string } }
) {
  try {
    const rutaId = params.rutaId;

    const pasajeros = await prisma.boleto.findMany({
      where: {
        rutaId: rutaId,
        estado: { in: ["PAGADO", "ABORDADO", "NO_ABORDADO"] },
      },
      include: {
        asiento: {
          select: {
            etiqueta: true,
            numero: true,
            categoria: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        asiento: { numero: "asc" },
      },
    });

    const pasajerosFormateados = pasajeros.map((boleto) => ({
      id: boleto.id,
      nombre: boleto.pasajeroNombre,
      cedula: boleto.pasajeroCedula,
      tipo: boleto.tipoPasajero,
      estado: boleto.estado,
      asiento: {
        etiqueta: boleto.asiento.etiqueta,
        numero: boleto.asiento.numero,
        categoria: boleto.asiento.categoria.nombre,
      },
    }));

    const total = pasajerosFormateados.length;
    const abordo = pasajerosFormateados.filter((p) => p.estado === "ABORDADO").length;
    const noAbordo = pasajerosFormateados.filter((p) => p.estado === "NO_ABORDADO").length;
    const pendientes = pasajerosFormateados.filter((p) => p.estado === "PAGADO").length;

    return NextResponse.json({
      rutaId,
      total,
      abordo,
      noAbordo,
      pendientes,
      pasajeros: pasajerosFormateados,
    });
  } catch (error) {
    console.error("Error al obtener pasajeros:", error);
    return NextResponse.json(
      { error: "Error al obtener pasajeros" },
      { status: 500 }
    );
  }
}