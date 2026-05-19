import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categoriaUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  precioBase: z.number().positive().optional(),
  descripcion: z.string().optional(),
});

// PUT - Actualizar datos de una categoría
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ busId: string; categoriaId: string }> }
) {
  const { busId, categoriaId } = await params;
  try {
    const body = await request.json();
    const validation = categoriaUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validation.error.flatten() },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoriaAsiento.findFirst({
      where: {
        id: categoriaId,
        busId,
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { error: "Categoría no encontrada en este bus" },
        { status: 404 }
      );
    }

    const categoriaActualizada = await prisma.categoriaAsiento.update({
      where: { id: categoriaId },
      data: validation.data,
    });

    return NextResponse.json(categoriaActualizada);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar la categoría" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría y sus asientos
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ busId: string; categoriaId: string }> }
) {
  const { busId, categoriaId } = await params;
  try {
    const categoria = await prisma.categoriaAsiento.findFirst({
      where: {
        id: categoriaId,
        busId,
      },
      include: {
        asientos: {
          include: {
            boletos: true,
          },
        },
      },
    });

    if (!categoria) {
      return NextResponse.json(
        { error: "Categoría no encontrada en este bus" },
        { status: 404 }
      );
    }

    const tieneBoletos = categoria.asientos.some(
  (asiento: { boletos: any[] }) => asiento.boletos.length > 0
);
    if (tieneBoletos) {
      return NextResponse.json(
        { error: "No se puede eliminar: hay asientos con boletos vendidos" },
        { status: 400 }
      );
    }

    await prisma.categoriaAsiento.delete({
      where: { id: categoriaId },
    });

    const totalAsientos = await prisma.asiento.count({
      where: {
        categoria: {
          busId,
        },
      },
    });

    await prisma.bus.update({
      where: { id: busId },
      data: { totalAsientos },
    });

    return NextResponse.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json(
      { error: "Error al eliminar la categoría" },
      { status: 500 }
    );
  }
}
