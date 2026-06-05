import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rutas = await prisma.ruta.findMany({
      include: {
        frecuencia: true,
        bus: true,
      },
      take: 10,
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(rutas);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar rutas" }, { status: 500 });
  }
}