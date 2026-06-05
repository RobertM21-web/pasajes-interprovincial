import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { boletoId, accion } = body;

    if (!boletoId || !accion) {
      return NextResponse.json(
        { error: "boletoId y accion son requeridos" },
        { status: 400 }
      );
    }

    if (!["ABORDADO", "NO_ABORDADO"].includes(accion)) {
      return NextResponse.json(
        { error: "accion debe ser ABORDADO o NO_ABORDADO" },
        { status: 400 }
      );
    }

    const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId },
    });

    if (!boleto) {
      return NextResponse.json(
        { error: "Boleto no encontrado" },
        { status: 404 }
      );
    }

    if (boleto.estado !== "PAGADO") {
      return NextResponse.json(
        { error: `El boleto está en estado ${boleto.estado}, solo se puede abordar un boleto PAGADO` },
        { status: 400 }
      );
    }

    const boletoActualizado = await prisma.boleto.update({
      where: { id: boletoId },
      data: {
        estado: accion,
        abordado: accion === "ABORDADO",
        fechaAbordaje: new Date(),
      },
    });

    return NextResponse.json({
      mensaje: `Pasajero ${accion === "ABORDADO" ? "abordó" : "no abordó"} correctamente`,
      boleto: {
        id: boletoActualizado.id,
        pasajero: boletoActualizado.pasajeroNombre,
        estado: boletoActualizado.estado,
      },
    });
  } catch (error) {
    console.error("Error al registrar abordaje:", error);
    return NextResponse.json(
      { error: "Error al registrar abordaje" },
      { status: 500 }
    );
  }
}