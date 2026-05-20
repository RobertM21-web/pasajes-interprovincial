import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("El correo electrónico no es válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  cedula: z.string().max(13, "La cédula no puede exceder 13 dígitos").optional().nullable(),
  telefono: z.string().max(15, "El teléfono no puede exceder 15 dígitos").optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar datos de entrada
    const parsedData = registerSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Datos de entrada inválidos", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { nombre, email, password, cedula, telefono } = parsedData.data;

    // Verificar si el correo ya existe
    const existingEmail = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 409 }
      );
    }

    // Verificar si la cédula ya existe (si se proporcionó)
    if (cedula && cedula.trim() !== "") {
      const existingCedula = await prisma.usuario.findUnique({
        where: { cedula },
      });

      if (existingCedula) {
        return NextResponse.json(
          { error: "La cédula ya se encuentra registrada" },
          { status: 409 }
        );
      }
    }

    // Buscar el rol de CLIENTE
    const rolCliente = await prisma.rol.findUnique({
      where: { nombre: "CLIENTE" },
    });

    if (!rolCliente) {
      return NextResponse.json(
        { error: "Error interno: El rol de cliente no está configurado en el sistema" },
        { status: 500 }
      );
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        cedula: cedula?.trim() || null,
        telefono: telefono?.trim() || null,
        rolId: rolCliente.id,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: {
          select: {
            nombre: true
          }
        }
      }
    });

    return NextResponse.json(
      { message: "Usuario registrado exitosamente", user: nuevoUsuario },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error al procesar tu solicitud" },
      { status: 500 }
    );
  }
}
