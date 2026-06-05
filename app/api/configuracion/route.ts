import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

  facebook: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  instagram: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  twitter: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  whatsapp: z.string().max(20, "El número de WhatsApp es muy largo").optional().or(z.literal("")),
  emailSoporte: z.string().email("Debe ser un correo electrónico válido").optional().or(z.literal("")),
  telefonoSoporte: z.string().max(20, "El teléfono es muy largo").optional().or(z.literal("")),
  direccion: z.string().max(255, "La dirección es muy larga").optional().or(z.literal("")),
  nombreBanco: z.string().max(120, "El nombre del banco es muy largo").optional().or(z.literal("")),
  numeroCuenta: z.string().max(50, "El número de cuenta es muy largo").optional().or(z.literal("")),
  titularCuenta: z.string().max(150, "El titular de la cuenta es muy largo").optional().or(z.literal("")),
  rucCooperativa: z.string().max(20, "El RUC es muy largo").optional().or(z.literal("")),
});

export async function GET() {
  try {
    const config = await prisma.configuracion.findFirst();

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const result = configuracionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Datos de configuración inválidos",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;
    const existingConfig = await prisma.configuracion.findFirst();

    let config;

    if (existingConfig) {
      config = await prisma.configuracion.update({
        where: { id: existingConfig.id },
        data,
      });
    } else {
      config = await prisma.configuracion.create({
        data,
      });
    }

    return NextResponse.json(
      { message: "Configuración guardada exitosamente", data: config },
      { status: 200 }
    );
  } catch (error) {
  console.error("Error al guardar la configuración:", JSON.stringify(error, null, 2));

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Ocurrió un error al guardar la configuración",
    },
    { status: 500 }
  );
}
}