import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { rutaId: string } }
) {
  try {
    const ruta = await prisma.ruta.findUnique({
      where: { id: params.rutaId },
      include: {
        frecuencia: true,
        bus: true,
      },
    });

    if (!ruta) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
    }

    return NextResponse.json(ruta);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar ruta" }, { status: 500 });
  }
}