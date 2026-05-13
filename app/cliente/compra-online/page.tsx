export default function CompraOnlinePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Compra Online</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Buscar Ruta
            </h2>

            <div className="space-y-4">
              <input type="text" placeholder="Origen" className="w-full border rounded-xl p-3" />
              <input type="text" placeholder="Destino" className="w-full border rounded-xl p-3" />
              <input type="date" className="w-full border rounded-xl p-3" />

              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl p-3 font-semibold transition-all">
                Buscar viajes
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {["Ambato → Quito", "Ambato → Guayaquil"].map((ruta, index) => (
                <div
                  key={ruta}
                  className="border rounded-xl p-4 hover:border-amber-400 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-black">{ruta}</h3>
                      <p className="text-sm text-gray-600">
                        Salida: {index === 0 ? "14:00" : "22:00"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-amber-600">
                        ${index === 0 ? "12.50" : "18.00"}
                      </p>

                      <button className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm">
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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