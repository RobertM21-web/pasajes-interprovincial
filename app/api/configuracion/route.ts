import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Esquema de validación para la configuración de la cooperativa
export const configuracionSchema = z.object({
  nombreCooperativa: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede exceder los 150 caracteres"),
  logoUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  colorPrimario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido (ej. #FFFFFF)").optional().or(z.literal("")),
  colorSecundario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un color hexadecimal válido (ej. #FFFFFF)").optional().or(z.literal("")),
  facebook: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  instagram: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  twitter: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  whatsapp: z.string().max(20, "El número de WhatsApp es muy largo").optional().or(z.literal("")),
  emailSoporte: z.string().email("Debe ser un correo electrónico válido").optional().or(z.literal("")),
  telefonoSoporte: z.string().max(20, "El teléfono es muy largo").optional().or(z.literal("")),
  direccion: z.string().max(255, "La dirección es muy larga").optional().or(z.literal("")),
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
