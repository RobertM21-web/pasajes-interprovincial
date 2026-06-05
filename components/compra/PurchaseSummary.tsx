"use client"; // Asegúrate de tener esto al principio
import Link from "next/link";
import { useState, useMemo } from "react";

type PurchaseSummaryProps = {
  selectedRouteData: any;
  purchaseConfirmed: boolean;
  setPurchaseConfirmed: (value: boolean) => void;
};

export default function PurchaseSummary({
  selectedRouteData,
  purchaseConfirmed,
  setPurchaseConfirmed,
}: PurchaseSummaryProps) {
  // 1. TODOS los hooks van arriba, sin condiciones
  const [passengerType, setPassengerType] = useState("Normal");

  const { descuento, porcentaje } = useMemo(() => {
    if (passengerType === "Tercera edad" || passengerType === "Discapacitado") 
      return { descuento: 0.5, porcentaje: "50%" };
    if (passengerType === "Menor de edad") 
      return { descuento: 0.3, porcentaje: "30%" };
    return { descuento: 0, porcentaje: "0%" };
  }, [passengerType]);

  // 2. Ahora, después de los hooks, hacemos la validación
  if (!selectedRouteData) {
    return <div className="p-4 text-gray-500">Selecciona una ruta para ver el resumen.</div>;
  }

  // 3. Calculamos el precio solo si existe la ruta
  const precioFinal = (selectedRouteData.precio || 0) * (1 - descuento);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-semibold text-black text-lg">Ruta seleccionada</p>

        <div className="mt-3 space-y-2 text-gray-700">
          <p><span className="font-medium">Trayecto:</span> {selectedRouteData.origen} → {selectedRouteData.destino}</p>
          <p><span className="font-medium">Fecha:</span> {new Date(selectedRouteData.fecha).toLocaleDateString('es-EC', { dateStyle: 'full' })}</p>
          <p><span className="font-medium">Hora:</span> {selectedRouteData.hora}</p>
          <p><span className="font-medium">Bus:</span> Ejecutivo #{selectedRouteData.bus?.numero || "N/A"}</p>

          <p>
            <span className="font-medium">Precio Final:</span>{" "}
            <span className="text-blue-600 font-bold text-xl">${precioFinal.toFixed(2)}</span>
          </p>
        </div>

        <div className="mt-5 border-t border-blue-200 pt-4">
          <p className="font-semibold text-black mb-3">Datos de tarifa</p>
          <select 
            value={passengerType} 
            onChange={(e) => setPassengerType(e.target.value)}
            className="w-full border rounded-xl p-3 bg-white text-gray-700"
          >
            <option value="Normal">Normal</option>
            <option value="Menor de edad">Menor de edad</option>
            <option value="Tercera edad">Tercera edad</option>
            <option value="Discapacitado">Discapacitado</option>
          </select>
          <p className="mt-2 text-sm text-gray-600">Descuento aplicado: <strong>{porcentaje}</strong></p>
        </div>

        <Link
          href={`/cliente/selector-asientos?rutaId=${encodeURIComponent(selectedRouteData.id)}&tipoPasajero=${encodeURIComponent(passengerType)}&precio=${encodeURIComponent(precioFinal.toFixed(2))}`}
          className="inline-block mt-5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all w-full text-center shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
        >
          Elegir asientos
        </Link>
      </div>
    </div>
  );
}
