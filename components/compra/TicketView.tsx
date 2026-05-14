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
        </p>
      </div>
    </div>
  );
}