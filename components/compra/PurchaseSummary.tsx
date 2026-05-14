import Link from "next/link";

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
        <p className="font-semibold text-black text-lg">
          Ruta seleccionada
        </p>

        <div className="mt-3 space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Trayecto:</span>{" "}
            {selectedRoute}
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
              {selectedRoute.includes("Quito")
                ? "$12.50"
                : "$18.00"}
            </span>
          </p>
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

      {purchaseConfirmed && (
        <div className="bg-white border-2 border-dashed border-amber-400 rounded-2xl p-5 shadow">
          <h3 className="text-xl font-bold text-center text-black mb-4">
            Boleto Generado
          </h3>

          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">Código:</span>{" "}
              TICKET-2026-001
            </p>

            <p>
              <span className="font-semibold">Ruta:</span>{" "}
              {selectedRoute}
            </p>

            <p>
              <span className="font-semibold">Estado:</span>{" "}
              <span className="text-amber-600 font-bold">
                Pendiente de validación
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}