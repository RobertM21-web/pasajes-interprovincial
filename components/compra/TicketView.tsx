"use client";

type TicketViewProps = {
  selectedRoute: string;
};

export default function TicketView({ selectedRoute }: TicketViewProps) {
  return (
    <div className="mt-6 p-6 border-2 border-dashed border-green-500 bg-green-50 rounded-2xl animate-fade-in">
      <h3 className="text-lg font-bold text-green-800 mb-2">¡Compra Confirmada!</h3>
      <p className="text-sm text-green-700">Tu pasaje ha sido generado con éxito.</p>
      
      <div className="mt-4 bg-white p-4 rounded-xl border shadow-sm">
        <p className="text-xs text-gray-500 uppercase font-bold">Detalle del viaje</p>
        <p className="text-black font-semibold mt-1">{selectedRoute}</p>
        <div className="mt-4 pt-4 border-t border-dashed">
          <p className="text-xs text-gray-400">Código de validación: <span className="text-black font-mono">TKT-8829-X</span></p>
        </div>
      </div>
      
      <button 
        onClick={() => window.print()}
        className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
      >
        Descargar PDF
      </button>
    </div>
  );
}