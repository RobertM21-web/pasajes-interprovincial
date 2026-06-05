import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";

const idParamSchema = z.object({ id: z.string().uuid() });

const updateFrecuenciaSchema = z.object({
  ciudadOrigen: z.string().min(1).optional(),
  ciudadDestino: z.string().min(1).optional(),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "hora debe tener formato HH:MM").optional(),
  resolucionAnt: z.string().nullable().optional(),
  esDirecta: z.boolean().optional(),
  activa: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const parsed = idParamSchema.safeParse(await params);
    if (!parsed.success) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const frecuencia = await prisma.frecuencia.findUnique({
      where: { id: parsed.data.id },
      include: { paradasIntermedias: true },
    });

    if (!frecuencia) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    return NextResponse.json(frecuencia);
  } catch (err) {
    console.error("GET /api/frecuencias/[id] error:", err);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const parsedId = idParamSchema.safeParse(await params);
    if (!parsedId.success) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    const body = await req.json();
    const parsedBody = updateFrecuenciaSchema.parse(body);

    const exist = await prisma.frecuencia.findUnique({ where: { id: parsedId.data.id } });
    if (!exist) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    const updated = await prisma.frecuencia.update({
      where: { id: parsedId.data.id },
      data: parsedBody,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Validación inválida", errors: err.issues }, { status: 400 });
    }
    console.error("PUT /api/frecuencias/[id] error:", err);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const parsedId = idParamSchema.safeParse(await params);
    if (!parsedId.success) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    const id = parsedId.data.id;

    // verificar rutas activas (HABILITADA o EN_CURSO)
    const rutasActivas = await prisma.ruta.count({
      where: { frecuenciaId: id, estado: { in: ["HABILITADA", "EN_CURSO"] } },
    });

    if (rutasActivas > 0) {
      return NextResponse.json({ message: "No se puede eliminar: existen rutas activas" }, { status: 400 });
    }

    const exist = await prisma.frecuencia.findUnique({ where: { id } });
    if (!exist) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    await prisma.frecuencia.delete({ where: { id } });

    return NextResponse.json({ message: "Eliminado" });
  } catch (err) {
    console.error("DELETE /api/frecuencias/[id] error:", err);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
