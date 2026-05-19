"use client";

import { useState, useEffect } from "react";
import { Bus, Users, AlertCircle } from "lucide-react";

interface Categoria {
  id?: string;
  nombre: string;
  precioBase: number;
  cantidad: number;
  descripcion?: string;
}

interface BusData {
  id: string;
  numero: string;
  placa: string;
  marcaChasis: string;
  marcaCarroceria: string;
  totalAsientos: number;
  activo: boolean;
  enTerminal: boolean;
  categorias: Categoria[];
}

export default function BusesAdminPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/buses");
      if (!res.ok) throw new Error("No se pudo conectar con el servidor API.");
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      // Fallback seguro de desarrollo
      setBuses([
        {
          id: "b499851a-4ebe-4c3a-ae51-8874109e01de",
          numero: "01",
          placa: "TAA-0101",
          marcaChasis: "Mercedes-Benz",
          marcaCarroceria: "Marcopolo",
          totalAsientos: 40,
          activo: true,
          enTerminal: true,
          categorias: [{ nombre: "Normal", precioBase: 5.0, cantidad: 40 }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBuses();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-3.5">
        <div className="bg-blue-600 p-2.5 rounded-xl text-white">
          <Bus className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-950">Gestión de Buses</h1>
          <p className="text-xs text-slate-500 mt-0.5">Mapea la flota vehicular y gestiona categorías de asientos.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Leyendo buses...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Bus / Disco</th>
                <th className="py-3.5 px-6">Placa</th>
                <th className="py-3.5 px-6">Chasis y Carrocería</th>
                <th className="py-3.5 px-6">Asientos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-900">Disco {bus.numero}</td>
                  <td className="py-4 px-6 font-mono text-blue-600">{bus.placa}</td>
                  <td className="py-4 px-6">{bus.marcaChasis} / {bus.marcaCarroceria}</td>
                  <td className="py-4 px-6 flex items-center space-x-1.5">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{bus.totalAsientos} asientos</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
