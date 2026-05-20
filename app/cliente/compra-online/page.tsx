"use client";

import { useState } from "react";
import RouteCard from "@/components/compra/RouteCard";
import PurchaseSummary from "@/components/compra/PurchaseSummary";
import SearchRouteForm from "@/components/compra/SearchRouteForm";

export default function CompraOnlinePage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteData, setSelectedRouteData] = useState<any | null>(null);
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (origen: string, destino: string, fecha: string) => {
    setIsLoading(true);
    try {
      // Usamos la ruta relativa a tu propio servidor Next.js
      const response = await fetch(`/api/rutas?origen=${origen}&destino=${destino}&fecha=${fecha}`);
      
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      
      const data = await response.json();
      
      // Aseguramos que siempre sea un array
      setRoutes(Array.isArray(data) ? data : []);
      setSelectedRouteData(null); // Resetear selección al buscar nuevo
    } catch (error) {
      console.error("Error conectando a API:", error);
      setRoutes([]);
      alert("Hubo un error al buscar las rutas. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Compra Online</h1>
        
        <div className="flex items-center gap-3 mb-8">
            <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">Paso 1: Seleccionar ruta</div>
            <div className="w-10 h-1 bg-gray-300 rounded" />
            <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">Paso 2: Asientos</div>
            <div className="w-10 h-1 bg-gray-300 rounded" />
            <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">Paso 3: Confirmación</div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Buscar Ruta</h2>
            
            <SearchRouteForm onSearch={handleSearch} />

            <div className="mt-6 space-y-4">
               {isLoading ? (
                 <p className="text-center text-gray-500">Buscando rutas...</p>
               ) : routes.length > 0 ? (
                 routes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      selected={selectedRouteData?.id === route.id}
                      onSelect={() => setSelectedRouteData(route)}
                    />
                 ))
               ) : (
                 <p className="text-center text-gray-400 text-sm">No se encontraron rutas para estos criterios.</p>
               )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Resumen de Compra</h2>
            <PurchaseSummary
                selectedRouteData={selectedRouteData}
                purchaseConfirmed={purchaseConfirmed}
                setPurchaseConfirmed={setPurchaseConfirmed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}