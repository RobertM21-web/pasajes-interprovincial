type TicketViewProps = {
  selectedRouteData: any;
};

export default function TicketView({ selectedRouteData }: TicketViewProps) {
  if (!selectedRouteData) return null;

  return (
    <div className="bg-white border-2 border-dashed border-amber-400 rounded-2xl p-6 shadow-xl mt-6 relative overflow-hidden">
      {/* Círculos decorativos para estilo de boleto físico */}
      <div className="absolute -left-3 top-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>
      <div className="absolute -right-3 top-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>

      <h3 className="text-2xl font-bold text-center text-black mb-6 uppercase tracking-wider">
        Boleto de Viaje
      </h3>

      <div className="space-y-3 text-gray-800 border-t border-b border-gray-100 py-4">
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Código:</span>
          <span className="font-bold text-black">TICKET-2026-{selectedRouteData.id.slice(-4).toUpperCase()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Ruta:</span>
          <span className="font-semibold">{selectedRouteData.origen} → {selectedRouteData.destino}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Hora:</span>
          <span className="font-semibold">{selectedRouteData.hora}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Estado:</span>
          <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">
            Pendiente de validación
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button 
          onClick={() => window.print()} // Funcionalidad real de impresión
          className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all"
        >
          Imprimir / Guardar
        </button>

        <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-xl font-semibold transition-all">
          Enviar al correo
        </button>
      </div>
    </div>
  );
}