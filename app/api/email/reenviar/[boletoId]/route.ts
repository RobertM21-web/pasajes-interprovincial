import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boletoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { boletoId } = await params;
    const body = await request.json().catch(() => ({}));

    const boleto = await prisma.boleto.findUnique({
      where: { id: boletoId },
      select: {
        id: true,
        usuarioId: true,
        emailEnvio: true,
        usuario: { select: { email: true } },
      },
    });

    if (!boleto) {
      return NextResponse.json({ error: "Boleto no encontrado" }, { status: 404 });
    }

    const puedeReenviar =
      boleto.usuarioId === session.user.id || ["ADMIN", "OFICINISTA"].includes(session.user.rol || "");

    if (!puedeReenviar) {
      return NextResponse.json({ error: "No tienes permiso para reenviar este boleto." }, { status: 403 });
    }

    const emailDestino = String(body?.emailDestino || boleto.emailEnvio || boleto.usuario?.email || "").trim().toLowerCase();
    if (!emailRegex.test(emailDestino)) {
      return NextResponse.json({ error: "No hay un correo valido para reenviar el boleto." }, { status: 400 });
    }

    const url = new URL("/api/email/enviar-boletos", request.url);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ boletoIds: [boletoId], emailDestino }),
    });

    const payload = await response.json().catch(() => null);
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Error al reenviar boleto:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al reenviar boleto" },
      { status: 500 }
    );
  }
}
