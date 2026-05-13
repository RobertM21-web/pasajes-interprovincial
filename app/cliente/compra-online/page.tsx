export default function CompraOnlinePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">
          Compra Online
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Buscar Ruta
            </h2>

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

              <input
                type="date"
                className="w-full border rounded-xl p-3"
              />

              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl p-3 font-semibold transition-all">
                Buscar viajes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Resumen de Compra
            </h2>

            <div className="space-y-3 text-gray-700">
              <p>No has seleccionado un viaje todavía.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}