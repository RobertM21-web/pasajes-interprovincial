import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categoriaCreateSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  precioBase: z.number().positive("Precio debe ser positivo"),
  cantidad: z.number().int().positive("Cantidad debe ser positiva"),
  descripcion: z.string().optional(),
});

// GET - Obtener categorías de un bus
export async function GET(
  request: Request,
  { params }: { params: Promise<{ busId: string }> }
) {
  const { busId } = await params;
  try {
    const categorias = await prisma.categoriaAsiento.findMany({
      where: { busId },
      include: {
        asientos: {
          orderBy: [{ fila: "asc" }, { numero: "asc" }],
        },
      },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}

// POST - Agregar una nueva categoría a un bus existente
export async function POST(
  request: Request,
  { params }: { params: Promise<{ busId: string }> }
) {
  const { busId } = await params;
  try {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = categoriaCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validation.error.flatten() },
        { status: 400 }
      );
    }

    const ultimoAsiento = await prisma.asiento.findFirst({
      where: {
        categoria: {
          busId,
        },
      },
      orderBy: { numero: "desc" },
    });

    let asientoInicial = ultimoAsiento ? ultimoAsiento.numero : 0;

    const categoria = await prisma.$transaction(async (tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
      const nuevaCategoria = await tx.categoriaAsiento.create({
        data: {
          busId,
          ...validation.data,
        },
      });

      const asientos = [];
      const asientosPorFila = 4;

      for (let i = 0; i < validation.data.cantidad; i++) {
        asientoInicial++;
        const fila = Math.ceil(asientoInicial / asientosPorFila);
        const posicionFila = asientoInicial % asientosPorFila || asientosPorFila;

        let posicion: string;
        switch (posicionFila) {
          case 1: posicion = "VENTANA"; break;
          case 2: posicion = "PASILLO"; break;
          case 3: posicion = "PASILLO"; break;
          case 4: posicion = "VENTANA"; break;
          default: posicion = "PASILLO";
        }

        const letra = String.fromCharCode(64 + posicionFila);
        const etiqueta = `${fila}${letra}`;

        asientos.push({
          categoriaId: nuevaCategoria.id,
          numero: asientoInicial,
          fila,
          posicion,
          etiqueta,
        });
      }

      await tx.asiento.createMany({
        data: asientos,
      });

      const totalAsientos = await tx.asiento.count({
        where: {
          categoria: {
            busId,
          },
        },
      });

      await tx.bus.update({
        where: { id: busId },
        data: { totalAsientos },
      });

      return nuevaCategoria;
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json(
      { error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}