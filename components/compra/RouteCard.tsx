type RouteCardProps = {
  name: string;
  departure: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
};

export default function RouteCard({
  name,
  departure,
  price,
  selected,
  onSelect,
}: RouteCardProps) {
  return (
    <div
      className={`
        border rounded-xl p-4 transition-all
        ${
          selected
            ? "border-amber-500 bg-amber-50 shadow-md"
            : "hover:border-amber-400"
        }
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-black">
            {name}
          </h3>

          <p className="text-sm text-gray-600">
            Salida: {departure}
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>Bus: Ejecutivo 2026</p>
            <p>Placa: TBA-2345</p>
            <p>Chasis: Mercedes Benz</p>
            <p>Carrocería: IMCE</p>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <p className="font-medium text-gray-600">Paradas:</p>
          <p>
            {name.includes("Guayaquil")
              ? "Ambato → Riobamba → Bucay → Guayaquil"
              : "Ambato → Latacunga → Quito"}
          </p>
        </div>

        <div className="text-right">
          <p className="font-bold text-amber-600">
            ${price}
          </p>

          <button
            onClick={onSelect}
            className={`
              mt-2 px-4 py-2 rounded-lg text-sm text-white transition-all
              ${
                selected
                  ? "bg-green-600"
                  : "bg-amber-500 hover:bg-amber-600"
              }
            `}
          >
            {selected ? "Seleccionado" : "Seleccionar"}
          </button>
        </div>
      </div>
    </div>
  );
}