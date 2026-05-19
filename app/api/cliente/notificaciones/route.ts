import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar notificaciones del usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Se requiere usuarioId" },
        { status: 400 }
      );
    }

    const tipo = searchParams.get("tipo");
    const leida = searchParams.get("leida");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = { usuarioId };

    if (tipo) where.tipo = tipo.toUpperCase();
    if (leida !== null && leida !== undefined) {
      where.leida = leida === "true";
    }

    const [notificaciones, total, noLeidas] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificacion.count({ where }),
      prisma.notificacion.count({
        where: { usuarioId, leida: false },
      }),
    ]);

    return NextResponse.json({
      notificaciones,
      noLeidas,
      paginacion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuarioId, titulo, mensaje, tipo } = body;

    if (!usuarioId || !titulo || !mensaje) {
      return NextResponse.json(
        { error: "usuarioId, titulo y mensaje son obligatorios" },
        { status: 400 }
      );
    }

    const notificacion = await prisma.notificacion.create({
      data: {
        usuarioId,
        titulo,
        mensaje,
        tipo: tipo || "INFO",
      },
    });

    return NextResponse.json(notificacion, { status: 201 });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return NextResponse.json(
      { error: "Error al crear notificación" },
      { status: 500 }
    );
  }
}