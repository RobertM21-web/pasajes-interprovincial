import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

const createFrecuenciaSchema = z.object({
  ciudadOrigen: z.string().min(1),
  ciudadDestino: z.string().min(1),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "hora debe tener formato HH:MM"),
  resolucionAnt: z.string().optional().nullable(),
  esDirecta: z.boolean().optional(),
  activa: z.boolean().optional(),
});

export async function GET() {
  try {
    const frecuencias = await prisma.frecuencia.findMany({
      include: { paradasIntermedias: true },
      orderBy: { ciudadOrigen: "asc" },
    });

    return NextResponse.json(frecuencias);
  } catch (err) {
    console.error("GET /api/frecuencias error:", err);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createFrecuenciaSchema.parse(body);

    const nueva = await prisma.frecuencia.create({
      data: {
        ciudadOrigen: parsed.ciudadOrigen,
        ciudadDestino: parsed.ciudadDestino,
        hora: parsed.hora,
        resolucionAnt: parsed.resolucionAnt ?? null,
        esDirecta: parsed.esDirecta ?? false,
        activa: parsed.activa ?? true,
      },
    });

    return NextResponse.json(nueva, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Validación inválida", errors: err.issues }, { status: 400 });
    }
    console.error("POST /api/frecuencias error:", err);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
