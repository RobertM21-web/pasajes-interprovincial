import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  validarCedulaEcuador,
  validarTelefonoCelular,
  validarNombrePersona,
  validarEmail,
} from "@/lib/validaciones";
import { z } from "zod";

const registerSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .refine(validarNombrePersona, {
      message: "El nombre solo puede contener letras y espacios, sin números ni símbolos",
    }),
  email: z.string().email("El correo electrónico no tiene un formato válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  cedula: z
    .string()
    .length(10, "La cédula debe tener exactamente 10 dígitos")
    .regex(/^\d{10}$/, "La cédula debe contener solo dígitos")
    .refine(validarCedulaEcuador, { message: "Cédula inválida" })
    .optional()
    .nullable(),
  telefono: z
    .string()
    .length(10, "El teléfono debe tener exactamente 10 dígitos")
    .regex(/^09\d{8}$/, "El teléfono debe empezar con 09 y tener 10 dígitos")
    .optional()
    .nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar datos de entrada con Zod
    const parsedData = registerSchema.safeParse(body);
    if (!parsedData.success) {
      const primerError = parsedData.error.issues[0]?.message ?? "Datos de entrada inválidos";
      return NextResponse.json(
        { error: primerError, details: parsedData.error.issues },
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
            nombre: true,
          },
        },
      },
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
