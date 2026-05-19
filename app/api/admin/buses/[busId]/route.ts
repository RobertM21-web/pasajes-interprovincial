import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const busUpdateSchema = z.object({
  numero: z.string().min(1).optional(),
  placa: z.string().min(1).optional(),
  marcaChasis: z.string().optional(),
  marcaCarroceria: z.string().optional(),
  fotografiaUrl: z.string().optional(),
  totalAsientos: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
  enTerminal: z.boolean().optional(),
});

// GET - Obtener un bus específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ busId: string }> }
) {
  const { busId } = await params;
  try {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: {
        categorias: {
          include: {
            asientos: {
              orderBy: [{ fila: "asc" }, { numero: "asc" }],
            },
          },
        },
      },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(bus);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el bus" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar datos básicos del bus
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ busId: string }> }
) {
  const { busId } = await params;
  try {
    const body = await request.json();
    const validation = busUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validation.error.flatten() },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.update({
      where: { id: busId },
      data: validation.data,
      include: {
        categorias: {
          include: {
            asientos: true,
          },
        },
      },
    });

    return NextResponse.json(bus);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un bus con ese número o placa" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar el bus" },
      { status: 500 }
    );
  }
}

