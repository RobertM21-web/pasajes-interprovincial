"use client";

import Link from "next/link";
import { useState } from "react";
import TicketView from "@/components/compra/TicketView";

type PurchaseSummaryProps = {
  selectedRouteData: any | null;
  purchaseConfirmed: boolean;
  setPurchaseConfirmed: (value: boolean) => void;
};

export default function PurchaseSummary({
  selectedRouteData,
  purchaseConfirmed,
  setPurchaseConfirmed,
}: PurchaseSummaryProps) {
  const [passengerName, setPassengerName] = useState("");
  const [passengerCedula, setPassengerCedula] = useState("");
  const [passengerType, setPassengerType] = useState("Normal");

  if (!selectedRouteData) {
    return <p className="text-gray-700 italic">No has seleccionado una ruta todavía.</p>;
  }

  // Lógica de cálculo dinámico para el descuento de ley
  const precioBase = Number(selectedRouteData.precio);
  const tieneDescuento = passengerType !== "Normal";
  const precioFinal = tieneDescuento ? precioBase * 0.5 : precioBase;

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-semibold text-black text-lg">Resumen de Compra</p>

        <div className="mt-3 space-y-2 text-gray-700 text-sm">
          <p><span className="font-medium">Trayecto:</span> {selectedRouteData.origen} → {selectedRouteData.destino}</p>
          <p><span className="font-medium">Precio Base:</span> ${precioBase.toFixed(2)}</p>
        </div>

        <div className="mt-5 border-t border-amber-200 pt-4 space-y-3">
          <input
            type="text"
            placeholder="Nombre del Pasajero"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm bg-white text-black"
          />
          <input
            type="text"
            placeholder="Cédula"
            value={passengerCedula}
            onChange={(e) => setPassengerCedula(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm bg-white text-black"
          />
          <select
            value={passengerType}
            onChange={(e) => setPassengerType(e.target.value)}
            className="w-full border rounded-xl p-3 bg-white text-gray-700 text-sm"
          >
            <option>Normal</option>
            <option>Menor de edad</option>
            <option>Tercera edad</option>
            <option>Discapacitado</option>
          </select>
          <div className="text-sm font-bold text-amber-600">
            Total a pagar: ${precioFinal.toFixed(2)}
          </div>
        </div>

        <button
          onClick={() => setPurchaseConfirmed(true)}
          className="w-full mt-4 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
        >
          Confirmar compra
        </button>
      </div>

      {purchaseConfirmed && <TicketView selectedRoute={`${selectedRouteData.origen} → ${selectedRouteData.destino}`} />}
    </div>
  );
}