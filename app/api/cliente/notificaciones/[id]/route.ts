import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Marcar como leída
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificacion = await prisma.notificacion.findUnique({
      where: { id: params.id },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    const actualizada = await prisma.notificacion.update({
      where: { id: params.id },
      data: { leida: true },
    });

    return NextResponse.json(actualizada);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar notificación" },
      { status: 500 }
    );
  }
}