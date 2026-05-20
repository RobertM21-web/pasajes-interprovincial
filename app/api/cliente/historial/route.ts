import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");

    if (!usuarioId) {
      return NextResponse.json(
        { error: "Se requiere usuarioId" },
        { status: 400 }
      );
    }

    const estado = searchParams.get("estado");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = { usuarioId };

    if (estado) where.estado = estado.toUpperCase();

    if (desde || hasta) {
      where.createdAt = {};
      if (desde) where.createdAt.gte = new Date(desde);
      if (hasta) where.createdAt.lte = new Date(hasta + "T23:59:59");
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
    console.error("Error al obtener historial:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial de compras" },
      { status: 500 }
    );
  }
}