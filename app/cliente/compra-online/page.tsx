"use client";

import { useState } from "react";


import RouteCard from "@/components/compra/RouteCard";
import PurchaseSummary from "@/components/compra/PurchaseSummary";

const availableRoutes = [
  {
    name: "Ambato → Quito",
    departure: "14:00",
    price: "12.50",
  },
  {
    name: "Ambato → Guayaquil",
    departure: "22:00",
    price: "18.00",
  },
];

export default function CompraOnlinePage() {
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
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
             {availableRoutes.map((route) => {
                const isSelected = selectedRoute === route.name;

                return (
                    <RouteCard
                    key={route.name}
                    name={route.name}
                    departure={route.departure}
                    price={route.price}
                    selected={isSelected}
                    onSelect={() => setSelectedRoute(route.name)}
                    />
                );
            })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Resumen de Compra
            </h2>

            <PurchaseSummary
                selectedRoute={selectedRoute}
                purchaseConfirmed={purchaseConfirmed}
                setPurchaseConfirmed={setPurchaseConfirmed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}