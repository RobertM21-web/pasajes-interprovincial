import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { enviarBoletosPorEmail } from "@/lib/email";
import { generarPdfBoleto } from "@/lib/pdf-boleto";
import { generateBoletoQR } from "@/lib/qr";

export const runtime = "nodejs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const boletoInclude = {
  ruta: {
    include: {
      frecuencia: true,
      bus: true,
    },
  },
  asiento: {
    include: {
      categoria: true,
    },
  },
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
} as const;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(value);
}

function canSend(sessionUserId: string, sessionRole: string | undefined, boletoUsuarioId: string | null) {
  if (boletoUsuarioId === sessionUserId) return true;
  return ["ADMIN", "OFICINISTA"].includes(sessionRole || "");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const boletoIds = Array.isArray(body?.boletoIds) ? body.boletoIds.filter(Boolean) : [];
    const emailDestino = String(body?.emailDestino || "").trim().toLowerCase();

    if (!boletoIds.length) {
      return NextResponse.json({ error: "Debes enviar al menos un boleto." }, { status: 400 });
    }

    if (!emailRegex.test(emailDestino)) {
      return NextResponse.json({ error: "El correo de destino no es valido." }, { status: 400 });
    }

    const boletos = await prisma.boleto.findMany({
      where: { id: { in: boletoIds } },
      include: boletoInclude,
      orderBy: { createdAt: "asc" },
    });

    if (boletos.length !== boletoIds.length) {
      return NextResponse.json({ error: "Uno o mas boletos no existen." }, { status: 404 });
    }

    const unauthorized = boletos.some(
      (boleto) => !canSend(session.user.id, session.user.rol, boleto.usuarioId)
    );
    if (unauthorized) {
      return NextResponse.json({ error: "No tienes permiso para enviar estos boletos." }, { status: 403 });
    }

    const invalidState = boletos.find((boleto) => !["PAGADO", "ABORDADO"].includes(boleto.estado));
    if (invalidState) {
      return NextResponse.json(
        { error: "Solo se pueden enviar boletos pagados o abordados." },
        { status: 400 }
      );
    }

    const configuracion = await prisma.configuracion.findFirst();
    const nombreCooperativa = configuracion?.nombreCooperativa || "Cooperativa de Transporte";

    const boletosConQr = await Promise.all(
      boletos.map(async (boleto) => {
        if (boleto.codigoQr) return boleto;
        const codigoQr = await generateBoletoQR(boleto.id);
        return { ...boleto, codigoQr };
      })
    );

    const attachments = boletosConQr.map((boleto) => {
      const pdf = generarPdfBoleto(
        {
          id: boleto.id,
          pasajeroNombre: boleto.pasajeroNombre,
          pasajeroCedula: boleto.pasajeroCedula,
          tipoPasajero: boleto.tipoPasajero,
          origenTramo: boleto.origenTramo,
          destinoTramo: boleto.destinoTramo,
          fecha: formatDate(boleto.ruta.fecha),
          hora: boleto.ruta.frecuencia.hora,
          asiento: boleto.asiento.etiqueta,
          precioBase: Number(boleto.precioBase),
          descuento: Number(boleto.descuento),
          precioFinal: Number(boleto.precioFinal),
          codigoQr: boleto.codigoQr,
          busNumero: boleto.ruta.bus.numero,
          busPlaca: boleto.ruta.bus.placa,
        },
        {
          nombreCooperativa,
          colorPrimario: configuracion?.colorPrimario,
          colorSecundario: configuracion?.colorSecundario,
          telefonoSoporte: configuracion?.telefonoSoporte,
          emailSoporte: configuracion?.emailSoporte,
        }
      );

      return {
        filename: `boleto-${boleto.asiento.etiqueta}-${boleto.id.slice(0, 8)}.pdf`,
        content: pdf,
      };
    });

    await enviarBoletosPorEmail({
      emailDestino,
      nombreCooperativa,
      colorPrimario: configuracion?.colorPrimario,
      colorSecundario: configuracion?.colorSecundario,
      contacto: {
        emailSoporte: configuracion?.emailSoporte,
        telefonoSoporte: configuracion?.telefonoSoporte,
        direccion: configuracion?.direccion,
      },
      boletos: boletosConQr.map((boleto) => ({
        pasajeroNombre: boleto.pasajeroNombre,
        origenTramo: boleto.origenTramo,
        destinoTramo: boleto.destinoTramo,
        fecha: formatDate(boleto.ruta.fecha),
        hora: boleto.ruta.frecuencia.hora,
        asiento: boleto.asiento.etiqueta,
        precioFinal: Number(boleto.precioFinal),
      })),
      attachments,
    });

    return NextResponse.json({
      message: `Boletos enviados a ${emailDestino}. Revisa tu bandeja de entrada.`,
      emailDestino,
      enviados: boletos.length,
    });
  } catch (error) {
    console.error("Error al enviar boletos por email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al enviar boletos por email" },
      { status: 500 }
    );
  }
}
