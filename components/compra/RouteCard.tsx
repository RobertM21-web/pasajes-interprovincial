"use client";

type RouteCardProps = {
  route: any;
  selected: boolean;
  onSelect: () => void;
};

export default function RouteCard({ route, selected, onSelect }: RouteCardProps) {
  // Aseguramos que la disponibilidad sea un número válido
  const asientos = route.asientosDisponibles ?? 0;
  const estaAgotado = asientos <= 0;

  // Ajuste: Extraer nombres de ciudades de forma segura según la estructura actual de la API
  const listaParadas = Array.isArray(route.paradas) && route.paradas.length > 0
    ? route.paradas.join(" → ") 
    : "Sin paradas intermedias";

  return (
    <div
      className={`
        border rounded-xl p-4 transition-all
        ${selected ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-amber-400"}
        ${estaAgotado ? "opacity-75 bg-gray-50" : ""}
      `}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-semibold text-black text-lg">
            {route.origen} → {route.destino}
          </h3>
          <p className="text-sm text-gray-600 font-medium">Salida: {route.hora}</p>
          
          <div className="mt-3 text-xs text-gray-500 space-y-0.5">
            <p><span className="font-semibold">Bus:</span> Ejecutivo #{route.bus?.numero || "N/A"}</p>
            <p className="font-medium">
              Disponibilidad: 
              <span className={estaAgotado ? "text-red-600 font-bold ml-1" : "text-green-600 ml-1"}>
                {estaAgotado ? "Agotado" : `${asientos} asientos`}
              </span>
            </p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <p className="font-bold text-amber-600 text-lg">
            ${typeof route.precio === 'number' ? route.precio.toFixed(2) : parseFloat(route.precio || 0).toFixed(2)}
          </p>

          <button
            disabled={estaAgotado}
            onClick={onSelect}
            className={`
              mt-3 px-4 py-2 rounded-lg text-sm text-white transition-all font-medium
              ${estaAgotado 
                ? "bg-gray-400 cursor-not-allowed" 
                : (selected ? "bg-green-600" : "bg-amber-500 hover:bg-amber-600")}
            `}
          >
            {estaAgotado ? "No disponible" : (selected ? "Seleccionado" : "Seleccionar")}
          </button>
        </div>
      </div>

      {/* Sección de paradas al pie */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-[10px] uppercase font-bold text-gray-400">Ruta y paradas:</p>
        <p className="text-xs text-gray-600 truncate mt-1">
          {listaParadas}
        </p>
      </div>
    </div>
  );
}