import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Esquema de validación para la configuración de la cooperativa
export const configuracionSchema = z.object({
  nombreCooperativa: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede exceder los 150 caracteres"),

  logoUrl: z.string().optional().or(z.literal("")),

  colorPrimario: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido (ej. #FFFFFF)")
    .optional()
    .or(z.literal("")),

  colorSecundario: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido (ej. #FFFFFF)")
    .optional()
    .or(z.literal("")),

  facebookUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  instagramUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  whatsapp: z.string().max(20, "El número de WhatsApp es muy largo").optional().or(z.literal("")),

  emailSoporte: z
    .string()
    .email("Debe ser un correo electrónico válido")
    .optional()
    .or(z.literal("")),

  telefonoSoporte: z
    .string()
    .max(20, "El teléfono es muy largo")
    .optional()
    .or(z.literal("")),

  nombreBanco: z.string().max(120, "El nombre del banco es muy largo").optional().or(z.literal("")),
  numeroCuenta: z.string().max(50, "El número de cuenta es muy largo").optional().or(z.literal("")),
  titularCuenta: z.string().max(120, "El titular de la cuenta es muy largo").optional().or(z.literal("")),
  rucCooperativa: z.string().max(20, "El RUC es muy largo").optional().or(z.literal("")),
});

// GET: Obtener la configuración actual
export async function GET() {
  try {
    // Buscamos el primer registro de configuración
    const config = await prisma.configuracion.findFirst();

    // Si no existe, devolvemos un objeto indicando que está vacío,
    // o podríamos devolver un 404, pero para el admin es mejor un 200 con data nula
    // para que el frontend sepa que debe hacer la creación inicial.
    if (!config) {
      return NextResponse.json(
        { message: "No existe configuración", data: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ data: config }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la configuración:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al intentar obtener la configuración" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar o crear la configuración
export async function PUT(request: Request) {
  try {
    // TODO: Activar esta validación de sesión cuando se haga el merge de NextAuth
    /*
    import { getServerSession } from "next-auth";
    import { authOptions } from "@/app/api/auth/[...nextauth]/route";
    
    const session = await getServerSession(authOptions);
    if (!session || session.user?.rol !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado. Solo los administradores pueden modificar la configuración." },
        { status: 401 }
      );
    }
    */

    const body = await request.json();

    // Validar el body con Zod
    const result = configuracionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Datos de configuración inválidos", 
          details: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Buscamos si ya existe una configuración
    const existingConfig = await prisma.configuracion.findFirst();

    let config;
    if (existingConfig) {
      // Actualizamos el registro existente
      config = await prisma.configuracion.update({
        where: { id: existingConfig.id },
        data: data,
      });
    } else {
      // Creamos uno nuevo
      config = await prisma.configuracion.create({
        data: data,
      });
    }

    return NextResponse.json(
      { message: "Configuración guardada exitosamente", data: config },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al guardar la configuración:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al guardar la configuración" },
      { status: 500 }
    );
  }
}
