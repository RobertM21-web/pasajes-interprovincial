import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: frecuenciaId } = await params;

    // Verificar si la frecuencia existe
    const frecuencia = await prisma.frecuencia.findUnique({
      where: { id: frecuenciaId },
    });

    if (!frecuencia) {
      return NextResponse.json(
        { error: "Frecuencia no encontrada" },
        { status: 404 }
      );
    }

    // Retornar los buses disponibles (activo=true, enTerminal=true) con sus categorías de asientos
    const buses = await prisma.bus.findMany({
      where: {
        activo: true,
        enTerminal: true,
      },
      select: {
        id: true,
        numero: true,
        placa: true,
        fotografiaUrl: true,
        totalAsientos: true,
        categorias: {
          select: {
            id: true,
            nombre: true,
            precioBase: true,
            cantidad: true,
            asientos: {
              select: {
                id: true,
                etiqueta: true,
                numero: true,
                fila: true,
                posicion: true,
              },
              orderBy: [
                { fila: "asc" },
                { numero: "asc" },
              ],
            },
          },
        },
      },
      orderBy: {
        numero: "asc",
      },
    });

    return NextResponse.json(buses);
  } catch (error) {
    console.error("Error al obtener buses para la frecuencia:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
