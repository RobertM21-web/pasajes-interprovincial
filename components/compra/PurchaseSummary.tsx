"use client";

import Link from "next/link";
import { useState } from "react";
import TicketView from "@/components/compra/TicketView";

type PurchaseSummaryProps = {
  selectedRoute: string | null;
  purchaseConfirmed: boolean;
  setPurchaseConfirmed: (value: boolean) => void;
};

export default function PurchaseSummary({
  selectedRoute,
  purchaseConfirmed,
  setPurchaseConfirmed,
}: PurchaseSummaryProps) {
  const [passengerType, setPassengerType] = useState("Normal");

  if (!selectedRoute) {
    return (
      <p className="text-gray-700">
        No has seleccionado un viaje todavía.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-semibold text-black text-lg">Ruta seleccionada</p>

        <div className="mt-3 space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Trayecto:</span> {selectedRoute}
          </p>

          <p>
            <span className="font-medium">Fecha:</span> 15/05/2026
          </p>

          <p>
            <span className="font-medium">Hora:</span>{" "}
            {selectedRoute.includes("Quito") ? "14:00" : "22:00"}
          </p>

          <p>
            <span className="font-medium">Bus:</span> Bus Ejecutivo
          </p>

          <p>
            <span className="font-medium">Precio:</span>{" "}
            <span className="text-amber-600 font-bold">
              {selectedRoute.includes("Quito") ? "$12.50" : "$18.00"}
            </span>
          </p>
        </div>

        <div className="mt-5 border-t border-amber-200 pt-4">
          <p className="font-semibold text-black mb-3">
            Datos de tarifa y pago
          </p>

          <div className="space-y-3">
            <select
              value={passengerType}
              onChange={(e) => setPassengerType(e.target.value)}
              className="w-full border rounded-xl p-3 bg-white text-gray-700"
            >
              <option>Normal</option>
              <option>Menor de edad</option>
              <option>Tercera edad</option>
              <option>Discapacitado</option>
            </select>

            <select className="w-full border rounded-xl p-3 bg-white text-gray-700">
              <option>Método de pago</option>
              <option>Transferencia bancaria</option>
              <option>Depósito</option>
              <option>PayPal</option>
            </select>

            <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-700">
              <p>
                Descuento aplicado:{" "}
                <span className="font-semibold text-amber-600">
                  {passengerType === "Tercera edad"
                    ? "50%"
                    : passengerType === "Discapacitado"
                    ? "50%"
                    : passengerType === "Menor de edad"
                    ? "30%"
                    : "0%"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/cliente/selector-asientos"
          className="inline-block mt-5 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all"
        >
          Elegir asientos
        </Link>

        <button
          onClick={() => setPurchaseConfirmed(true)}
          className="w-full mt-4 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
        >
          Confirmar compra
        </button>
      </div>

      {purchaseConfirmed && <TicketView selectedRoute={selectedRoute} />}
    </div>
  );
}