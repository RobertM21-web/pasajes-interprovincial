import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { rutaId: string } }
) {
  try {
    const { rutaId } = params;
    console.log("Buscando ruta:", rutaId);
    
    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId },
      include: {
        frecuencia: true,
        bus: true,
      },
    });

    console.log("Ruta encontrada:", ruta ? "Sí" : "No");

    if (!ruta) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
    }

    return NextResponse.json(ruta);
  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json({ error: "Error al cargar ruta" }, { status: 500 });
  }
}