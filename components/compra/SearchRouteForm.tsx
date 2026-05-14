export default function SearchRouteForm() {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Origen"
        className="w-full border rounded-xl p-3"
      />

      <input
        type="text"
        placeholder="Destino"
        className="w-full border rounded-xl p-3"
      />

      <input type="date" className="w-full border rounded-xl p-3" />

      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl p-3 font-semibold transition-all">
        Buscar viajes
      </button>
    </div>
  );
}