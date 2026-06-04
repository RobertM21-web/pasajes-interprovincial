import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoriaAsiento.findMany({
      include: {
        bus: {
          select: {
            id: true,
            numero: true,
            placa: true,
            activo: true,
          },
        },
        asientos: {
          select: {
            id: true,
            numero: true,
            etiqueta: true,
            boletos: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: [{ busId: "asc" }, { nombre: "asc" }],
    });

    return NextResponse.json(
      categorias.map((categoria) => ({
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        precioBase: Number(categoria.precioBase),
        cantidad: categoria.cantidad,
        bus: categoria.bus,
        asientos: categoria.asientos.length,
        asientosConBoletos: categoria.asientos.filter((asiento) => asiento.boletos.length > 0).length,
      }))
    );
  } catch (error) {
    console.error("GET /api/admin/categorias-asiento error:", error);
    return NextResponse.json(
      { error: "Error al obtener categorias de asiento" },
      { status: 500 }
    );
  }
}
