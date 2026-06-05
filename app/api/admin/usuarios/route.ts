import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [usuarios, roles] = await Promise.all([
      prisma.usuario.findMany({
        include: { rol: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rol.findMany({ orderBy: { nombre: "asc" } }),
    ]);

    return NextResponse.json({
      usuarios: usuarios.map((usuario) => ({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        cedula: usuario.cedula,
        telefono: usuario.telefono,
        activo: usuario.activo,
        createdAt: usuario.createdAt,
        rol: {
          id: usuario.rol.id,
          nombre: usuario.rol.nombre,
        },
      })),
      roles: roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/usuarios error:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, rolId, activo } = body;

    if (!usuarioId) {
      return NextResponse.json({ error: "usuarioId es requerido" }, { status: 400 });
    }

    const data: { rolId?: string; activo?: boolean } = {};
    if (typeof rolId === "string") data.rolId = rolId;
    if (typeof activo === "boolean") data.activo = activo;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay cambios para aplicar" }, { status: 400 });
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data,
      include: { rol: true },
    });

    return NextResponse.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      activo: usuario.activo,
      rol: { id: usuario.rol.id, nombre: usuario.rol.nombre },
    });
  } catch (error) {
    console.error("PATCH /api/admin/usuarios error:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
