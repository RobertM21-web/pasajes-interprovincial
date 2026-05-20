/**
 * API: GET /api/boletos/historial
 * 
 * Obtiene el historial de boletos del usuario autenticado
 * 
 * Query params (opcionales):
 * - estado: filtro por estado (PENDIENTE, PAGADO, ABORDADO, CANCELADO, NO_ABORDADO)
 * - page: número de página (default: 1)
 * - limit: cantidad de resultados por página (default: 10)
 * 
 * TODO: Implementar getServerSession() cuando NextAuth esté configurado
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // TODO: Obtener de NextAuth session en producción
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: "No autenticado" },
    //     { status: 401 }
    //   );
    // }
    // const usuarioId = session.user.id;

    // Por ahora: permite query param pero en producción será de la sesión
    const usuarioId = searchParams.get("usuarioId");
    if (!usuarioId) {
      return NextResponse.json(
        { error: "Se requiere usuarioId (mientras NextAuth no esté configurado)" },
        { status: 400 }
      );
    }

    // Parámetros de filtrado
    const estado = searchParams.get("estado");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    // Construir WHERE clause
    const where: any = { usuarioId };

    if (estado) {
      where.estado = estado.toUpperCase();
    }

    // Ejecutar queries en paralelo
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

    // Transformar respuesta
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
