import { prisma } from "@/lib/prisma";

export async function getConfiguracionCooperativa() {
  const config = await prisma.configuracion.findFirst();

  return {
    nombreCooperativa: config?.nombreCooperativa || "Cooperativa",
    logoUrl: config?.logoUrl || "",
    colorPrimario: config?.colorPrimario || "#0f172a",
    colorSecundario: config?.colorSecundario || "#1d4ed8",
    facebook: config?.facebook || "",
    instagram: config?.instagram || "",
    twitter: config?.twitter || "",
    whatsapp: config?.whatsapp || "",
    emailSoporte: config?.emailSoporte || "",
    telefonoSoporte: config?.telefonoSoporte || "",
    direccion: config?.direccion || "",
  };
}