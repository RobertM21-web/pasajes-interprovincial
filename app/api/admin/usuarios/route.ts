import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get("rol");

    const where: any = { activo: true };
if (rol) {
  where.rol = { nombre: rol };
}

    const [usuarios, roles] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: {
          rol: true,
          busAsignado: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rol.findMany({ orderBy: { nombre: "asc" } }),
    ]);
    // ...

    return NextResponse.json({
      usuarios: usuarios.map((usuario: any) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  cedula: usuario.cedula,
  telefono: usuario.telefono,
  activo: usuario.activo,
  createdAt: usuario.createdAt,
  licencia: usuario.licencia,
  tipoLicencia: usuario.tipoLicencia,
  fotoUrl: usuario.fotoUrl,
  busAsignado: usuario.busAsignado ? {
    id: usuario.busAsignado.id,
    numero: usuario.busAsignado.numero,
    placa: usuario.busAsignado.placa,
  } : null,
  rol: {
    id: usuario.rol.id,
    nombre: usuario.rol.nombre,
  },
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
    const { id, nombre, email, cedula, licencia, tipoLicencia, busAsignadoId, fotoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    const data: any = {};
    if (nombre) data.nombre = nombre;
    if (email) data.email = email;
    if (cedula) data.cedula = cedula;
    if (licencia !== undefined) data.licencia = licencia;
    if (tipoLicencia !== undefined) data.tipoLicencia = tipoLicencia;
    if (busAsignadoId !== undefined) data.busAsignadoId = busAsignadoId || null;
    if (fotoUrl !== undefined) data.fotoUrl = fotoUrl;

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      include: { rol: true, busAsignado: true },
    });

    return NextResponse.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      mensaje: "Usuario actualizado",
    });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
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
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    
await prisma.usuario.update({
  where: { id },
  data: { activo: false },
});
    return NextResponse.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}