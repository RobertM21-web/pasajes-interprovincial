"use client";

import { useState } from "react";
import RouteCard from "@/components/compra/RouteCard";
import PurchaseSummary from "@/components/compra/PurchaseSummary";
import SearchRouteForm from "@/components/compra/SearchRouteForm";

export default function CompraOnlinePage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);

  // Temporalmente, podemos usar una ruta de prueba que respete la nueva estructura
  const handleSearch = async (origen: string, destino: string, fecha: string) => {
    // Simulamos la estructura que espera RouteCard
    const mockRoute = {
      id: "1",
      origen: "Ambato",
      destino: "Quito",
      hora: "14:00",
      fecha: "2026-05-19",
      esDirecta: true,
      precio: 12.50,
      totalAsientos: 40,
      asientosDisponibles: 20,
      bus: { id: "bus1", numero: 101 },
      paradas: []
    };
    setRoutes([mockRoute]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Compra Online</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Buscar Ruta</h2>
            <SearchRouteForm onSearch={handleSearch} />

            <div className="mt-6 space-y-4">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  selected={selectedRoute?.id === route.id}
                  onSelect={() => setSelectedRoute(route)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Resumen de Compra</h2>
            <PurchaseSummary
              selectedRouteData={selectedRoute}
              purchaseConfirmed={purchaseConfirmed}
              setPurchaseConfirmed={setPurchaseConfirmed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}