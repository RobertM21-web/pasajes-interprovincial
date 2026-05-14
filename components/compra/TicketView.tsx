type TicketViewProps = {
  selectedRoute: string;
};

export default function TicketView({
  selectedRoute,
}: TicketViewProps) {
  return (
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
          <div className="flex gap-3 mt-5">
            <button className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all">
              Ver boleto
            </button>

            <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-xl font-semibold transition-all">
              Descargar boleto
            </button>
          </div>
        </p>
      </div>
    </div>
  );
}