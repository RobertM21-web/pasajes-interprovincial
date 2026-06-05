import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function extractBoletoId(value: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed?.boletoId === "string") return parsed.boletoId;
  } catch {
    // Puede ser directamente el ID del boleto, no JSON del QR.
  }

  return trimmed;
}

const boletoInclude = {
  asiento: { include: { categoria: true } },
  ruta: { include: { frecuencia: true, bus: true } },
  usuario: { select: { id: true, nombre: true, email: true } },
};

export async function GET(request: NextRequest) {
  try {
    const boletoId = extractBoletoId(request.nextUrl.searchParams.get("codigo"));

    if (!boletoId) {
      return NextResponse.json({ error: "Ingresa el ID o contenido del QR" }, { status: 400 });
    }

    const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId },
      include: boletoInclude,
    });

    if (!boleto) {
      return NextResponse.json({ error: "Boleto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(boleto);
  } catch (error) {
    console.error("GET /api/abordaje error:", error);
    return NextResponse.json(
      { error: "Error al consultar boleto" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { codigo } = await request.json();
    const boletoId = extractBoletoId(codigo);

    if (!boletoId) {
      return NextResponse.json({ error: "Ingresa el ID o contenido del QR" }, { status: 400 });
    }

    const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId },
    });

    if (!boleto) {
      return NextResponse.json({ error: "Boleto no encontrado" }, { status: 404 });
    }

    if (boleto.estado !== "PAGADO") {
      return NextResponse.json(
        { error: "Solo se puede abordar un boleto PAGADO" },
        { status: 400 }
      );
    }

    if (boleto.abordado) {
      return NextResponse.json(
        { error: "Este boleto ya fue marcado como abordado" },
        { status: 400 }
      );
    }

    const actualizado = await prisma.boleto.update({
      where: { id: boletoId },
      data: {
        abordado: true,
        estado: "ABORDADO",
        fechaAbordaje: new Date(),
      },
      include: boletoInclude,
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("PATCH /api/abordaje error:", error);
    return NextResponse.json(
      { error: "Error al registrar abordaje" },
      { status: 500 }
    );
  }
}
