import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const usuarioId = session.user.id;
    const estado = searchParams.get("estado");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: {
      usuarioId: string;
      estado?: string;
    } = { usuarioId };

    if (estado) {
      where.estado = estado.toUpperCase();
    }

    const [boletos, total] = await Promise.all([
      prisma.boleto.findMany({
        where,
        include: {
          ruta: {
            include: {
              frecuencia: {
                select: {
                  ciudadOrigen: true,
                  ciudadDestino: true,
                  hora: true,
                },
              },
              bus: {
                select: {
                  numero: true,
                  placa: true,
                },
              },
            },
          },
          asiento: {
            include: {
              categoria: {
                select: { nombre: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.boleto.count({ where }),
    ]);

    const historial = boletos.map((boleto) => ({
      id: boleto.id,
      codigoQr: boleto.codigoQr,
      estado: boleto.estado,
      precioBase: Number(boleto.precioBase),
      descuento: Number(boleto.descuento),
      precioFinal: Number(boleto.precioFinal),
      pasajeroNombre: boleto.pasajeroNombre,
      pasajeroCedula: boleto.pasajeroCedula,
      tipoPasajero: boleto.tipoPasajero,
      metodoPago: boleto.metodoPago,
      canalVenta: boleto.canalVenta,
      origenTramo: boleto.origenTramo,
      destinoTramo: boleto.destinoTramo,
      abordado: boleto.abordado,
      fechaAbordaje: boleto.fechaAbordaje,
      comprobanteUrl: boleto.comprobanteUrl,
      createdAt: boleto.createdAt,
      ruta: {
        origen: boleto.ruta.frecuencia.ciudadOrigen,
        destino: boleto.ruta.frecuencia.ciudadDestino,
        hora: boleto.ruta.frecuencia.hora,
        busNumero: boleto.ruta.bus.numero,
        busPlaca: boleto.ruta.bus.placa,
      },
      asiento: {
        numero: boleto.asiento.numero,
        etiqueta: boleto.asiento.etiqueta,
        categoria: boleto.asiento.categoria.nombre,
        posicion: boleto.asiento.posicion,
      },
    }));

    return NextResponse.json({
      boletos: historial,
      paginacion: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error al obtener historial de boletos:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial de boletos" },
      { status: 500 }
    );
  }
}
