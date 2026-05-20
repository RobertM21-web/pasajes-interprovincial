/**
 * Tarjeta de boleto para mostrar en el historial
 * Muestra toda la información del boleto en un formato amigable
 */

import Link from "next/link";
import { formatFechaCorta, formatHora, formatMoneda } from "@/lib/formatters";
import { EstadoBadge } from "./estado-badge";

interface BoletoCardProps {
  boleto: {
    id: string;
    estado: string;
    precioFinal: number;
    pasajeroNombre: string;
    origenTramo: string;
    destinoTramo: string;
    ruta: {
      origen: string;
      destino: string;
      busNumero: string;
      busPlaca: string;
    };
    asiento: {
      etiqueta: string;
      categoria: string;
    };
    createdAt: Date | string;
  };
}

export function BoletoCard({ boleto }: BoletoCardProps) {
  const fecha = new Date(boleto.createdAt);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
      {/* Header: Ruta y Estado */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {boleto.origenTramo} → {boleto.destinoTramo}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Bus Nº {boleto.ruta.busNumero} • {boleto.ruta.busPlaca}
          </p>
        </div>
        <div className="flex-shrink-0">
          <EstadoBadge estado={boleto.estado} />
        </div>
      </div>

      {/* Información de viaje */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Fecha de compra
          </p>
          <p className="text-sm font-medium text-foreground mt-1">
            {formatFechaCorta(fecha)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Asiento
          </p>
          <p className="text-sm font-medium text-foreground mt-1">
            {boleto.asiento.etiqueta} ({boleto.asiento.categoria})
          </p>
        </div>
      </div>

      {/* Información del pasajero y precio */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Pasajero
          </p>
          <p className="text-sm font-medium text-foreground mt-1">
            {boleto.pasajeroNombre}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Precio pagado
          </p>
          <p className="text-base font-bold text-green-600 mt-1">
            {formatMoneda(boleto.precioFinal)}
          </p>
        </div>
      </div>

      {/* Botones de acciones */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        {/* Botón primario: Ver boleto o Ver QR */}
        {boleto.estado === "PAGADO" || boleto.estado === "ABORDADO" ? (
          <button
            onClick={() => {
              // TODO: Implementar modal o página de visualización del QR
              console.log("Ver QR del boleto:", boleto.id);
            }}
            className={`
              w-full inline-flex items-center justify-center
              px-4 py-2.5 rounded-lg font-medium text-sm
              bg-green-600 text-white hover:bg-green-700
              transition-colors duration-200
            `}
          >
            📱 Ver QR
          </button>
        ) : (
          <Link
            href={`/cliente/boletos/${boleto.id}`}
            className={`
              w-full inline-flex items-center justify-center
              px-4 py-2.5 rounded-lg font-medium text-sm
              bg-blue-600 text-white hover:bg-blue-700
              transition-colors duration-200
            `}
          >
            Ver boleto
          </Link>
        )}

        {/* Botón secundario: Subir comprobante (solo si PENDIENTE) */}
        {boleto.estado === "PENDIENTE" && (
          <button
            onClick={() => {
              // TODO: Implementar modal de subida de comprobante (Sandro)
              console.log("Subir comprobante para boleto:", boleto.id);
            }}
            className={`
              w-full inline-flex items-center justify-center
              px-4 py-2.5 rounded-lg font-medium text-sm
              bg-amber-600 text-white hover:bg-amber-700
              transition-colors duration-200
            `}
          >
            📄 Subir comprobante
          </button>
        )}
      </div>
    </div>
  );
}
