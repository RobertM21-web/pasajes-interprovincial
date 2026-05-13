"use client";

import { useState } from "react";

import Link from "next/link";

export default function CompraOnlinePage() {
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Compra Online</h1>
        <div className="flex items-center gap-3 mb-8">
            <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                Paso 1: Seleccionar ruta
            </div>

            <div className="w-10 h-1 bg-gray-300 rounded" />

            <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">
                Paso 2: Asientos
            </div>

            <div className="w-10 h-1 bg-gray-300 rounded" />

            <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">
                Paso 3: Confirmación
            </div>
        </div>

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

                      <button
                        onClick={() => setSelectedRoute(ruta)}
                        className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm"
                        >
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
                            {selectedRoute ? (
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
                        <span className="font-medium">Fecha:</span>{" "}
                        15/05/2026
                        </p>

                        <p>
                        <span className="font-medium">Hora:</span>{" "}
                        {selectedRoute.includes("Quito") ? "14:00" : "22:00"}
                        </p>

                        <p>
                        <span className="font-medium">Bus:</span>{" "}
                        Bus Ejecutivo
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
                    
                    <div className="mt-5 border-t border-amber-200 pt-4">
                        <p className="font-semibold text-black mb-3">
                            Datos del pasajero
                        </p>

                        <div className="space-y-3">
                            <input
                            type="text"
                            placeholder="Nombre completo"
                            className="w-full border rounded-xl p-3"
                            />

                            <input
                            type="text"
                            placeholder="Cédula"
                            className="w-full border rounded-xl p-3"
                            />

                            <input
                            type="tel"
                            placeholder="Teléfono"
                            className="w-full border rounded-xl p-3"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-5 border-t border-amber-200 pt-4">
                        <p className="font-semibold text-black mb-3">
                            Comprobante de pago
                        </p>

                        <div className="space-y-3">
                            <input
                            type="file"
                            className="w-full border rounded-xl p-3 bg-white"
                            />

                            <p className="text-sm text-gray-600">
                            Sube tu comprobante de transferencia o depósito.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/cliente/selector-asientos"
                        className="inline-block mt-5 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all"
                    >
                        Elegir asientos
                    </Link>

                    <button className="w-full mt-4 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all">
                        Confirmar compra
                    </button>
                    </div>
                ) : (
                <p>No has seleccionado un viaje todavía.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}