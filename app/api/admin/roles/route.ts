import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [roles, permisos] = await Promise.all([
      prisma.rol.findMany({
        include: {
          permisos: {
            include: { permiso: true },
          },
          _count: { select: { usuarios: true } },
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.permiso.findMany({
        orderBy: [{ modulo: "asc" }, { nombre: "asc" }],
      }),
    ]);

    return NextResponse.json({
      roles: roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        activo: rol.activo,
        usuarios: rol._count.usuarios,
        permisos: rol.permisos.map((item) => item.permisoId),
      })),
      permisos,
    });
  } catch (error) {
    console.error("GET /api/admin/roles error:", error);
    return NextResponse.json(
      { error: "Error al obtener roles y permisos" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { rolId, permisoId, asignado } = await request.json();

    if (!rolId || !permisoId || typeof asignado !== "boolean") {
      return NextResponse.json(
        { error: "rolId, permisoId y asignado son requeridos" },
        { status: 400 }
      );
    }

    if (asignado) {
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId, permisoId } },
        update: {},
        create: { rolId, permisoId },
      });
    } else {
      await prisma.rolPermiso.deleteMany({
        where: { rolId, permisoId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/admin/roles error:", error);
    return NextResponse.json(
      { error: "Error al actualizar permisos del rol" },
      { status: 500 }
    );
  }
}
