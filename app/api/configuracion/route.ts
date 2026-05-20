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
