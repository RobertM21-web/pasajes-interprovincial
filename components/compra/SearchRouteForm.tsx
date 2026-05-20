"use client";

import { useState } from "react";

type SearchRouteFormProps = {
  onSearch: (origen: string, destino: string, fecha: string) => void;
};

export default function SearchRouteForm({ onSearch }: SearchRouteFormProps) {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");

  const handleSearchClick = () => {
    // Validación básica antes de llamar a la API
    if (!origen.trim() || !destino.trim() || !fecha) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    
    console.log("¡Click detectado! Buscando:", { origen, destino, fecha });
    onSearch(origen.trim(), destino.trim(), fecha);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Ciudad de Origen"
        value={origen}
        onChange={(e) => setOrigen(e.target.value)}
        className="w-full border rounded-xl p-3 text-black focus:ring-2 focus:ring-amber-500 outline-none"
      />

      <input
        type="text"
        placeholder="Ciudad de Destino"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
        className="w-full border rounded-xl p-3 text-black focus:ring-2 focus:ring-amber-500 outline-none"
      />

      <input 
        type="date" 
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="w-full border rounded-xl p-3 text-black focus:ring-2 focus:ring-amber-500 outline-none" 
      />

      <button 
        type="button"
        onClick={handleSearchClick}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl p-3 font-semibold transition-all shadow-lg shadow-amber-200"
      >
        Buscar viajes
      </button>
    </div>
  );
}