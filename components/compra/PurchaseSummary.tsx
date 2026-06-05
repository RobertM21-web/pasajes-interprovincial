"use client"; // Asegúrate de tener esto al principio
import Link from "next/link";

type PurchaseSummaryProps = {
  selectedRouteData: any;
  purchaseConfirmed: boolean;
  setPurchaseConfirmed: (value: boolean) => void;
};

export default function PurchaseSummary({
  selectedRouteData,
}: PurchaseSummaryProps) {
  if (!selectedRouteData) {
    return <div className="p-4 text-gray-500">Selecciona una ruta para ver el resumen.</div>;
  }

  const precioBase = selectedRouteData.precio || 0;

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-semibold text-black text-lg">Ruta seleccionada</p>

        <div className="mt-3 space-y-2 text-gray-700">
          <p><span className="font-medium">Trayecto:</span> {selectedRouteData.origen} → {selectedRouteData.destino}</p>
          <p><span className="font-medium">Fecha:</span> {new Date(selectedRouteData.fecha).toLocaleDateString('es-EC', { dateStyle: 'full' })}</p>
          <p><span className="font-medium">Hora:</span> {selectedRouteData.hora}</p>
          <p><span className="font-medium">Bus:</span> Ejecutivo #{selectedRouteData.bus?.numero || "N/A"}</p>

          <p>
            <span className="font-medium">Precio Base:</span>{" "}
            <span className="text-amber-600 font-bold text-xl">${Number(precioBase).toFixed(2)}</span>
          </p>
        </div>

        <div className="mt-5 border-t border-amber-200 pt-4">
          <p className="text-xs text-slate-500 leading-normal">
            * Los descuentos del 25% (menores de edad) y del 50% (tercera edad y personas con discapacidad) se aplicarán en el siguiente paso al ingresar los datos de cada pasajero.
          </p>
        </div>

        <Link
          href={`/compra/${encodeURIComponent(selectedRouteData.id)}`}
          className="inline-block mt-5 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all w-full text-center shadow"
        >
          Iniciar Compra
        </Link>
      </div>
    </div>
  );
}

