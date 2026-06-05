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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, password, cedula, licencia, tipoLicencia, busAsignadoId, fotoUrl, rol } = body;

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json(
        { error: "nombre, email, password y rol son requeridos" },
        { status: 400 }
      );
    }

    // Buscar el rol
    const rolData = await prisma.rol.findFirst({
      where: { nombre: rol },
    });

    if (!rolData) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 400 });
    }

    // Hash de la contraseña
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        cedula: cedula || null,
        telefono: null,
        licencia: licencia || null,
        tipoLicencia: tipoLicencia || null,
        busAsignadoId: busAsignadoId || null,
        fotoUrl: fotoUrl || null,
        rolId: rolData.id,
      },
    });

    return NextResponse.json(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: rol,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/usuarios error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email o cédula" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}