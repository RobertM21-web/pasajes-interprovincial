"use client";

import { useState } from "react";

interface SearchRouteFormProps {
  onSearch: (origen: string, destino: string, fecha: string) => void;
}

export default function SearchRouteForm({ onSearch }: SearchRouteFormProps) {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origen || !destino || !fecha) return;
    onSearch(origen, destino, fecha);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Origen"
        value={origen}
        onChange={(e) => setOrigen(e.target.value)}
        className="w-full border rounded-xl p-3 text-black focus:outline-none focus:border-amber-500"
        required
      />

      <input
        type="text"
        placeholder="Destino"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
        className="w-full border rounded-xl p-3 text-black focus:outline-none focus:border-amber-500"
        required
      />

      <input 
        type="date" 
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="w-full border rounded-xl p-3 text-black focus:outline-none focus:border-amber-500"
        required
      />

      <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl p-3 font-semibold transition-all">
        Buscar viajes
      </button>
    </form>
  );
}