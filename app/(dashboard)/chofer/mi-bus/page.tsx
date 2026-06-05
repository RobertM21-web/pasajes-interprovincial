"use client";

import { useState, useEffect } from "react";
import { Bus, User, MapPin, Check, Circle } from "lucide-react";

export default function MiBus() {
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const choferId = "ID_DEL_CHOFER";
    fetch(`/api/chofer/rutas?choferId=${choferId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Tomar el bus de la primera ruta activa
          const rutaActiva = data.find((r: any) => r.estado === "HABILITADA" || r.estado === "EN_CURSO");
          if (rutaActiva) {
            setBus(rutaActiva.bus);
          } else {
            setBus(data[0].bus);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Bus size={64} className="mx-auto text-gray-300 animate-pulse" />
          <p className="text-gray-500 mt-4">Cargando información del bus...</p>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Bus size={64} className="mx-auto text-gray-300" />
          <p className="text-gray-500 mt-4 text-lg">No tienes un bus asignado actualmente.</p>
          <p className="text-gray-400 text-sm mt-2">Contacta al administrador si esto es un error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🚍 Mi Bus</h1>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Foto del bus */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-48 flex items-center justify-center">
          <Bus size={100} className="text-white opacity-50" />
        </div>

        {/* Datos del bus */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Información General</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 w-24">Número:</span>
                  <span className="font-bold text-lg">Bus {bus.numero}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 w-24">Placa:</span>
                  <span className="font-bold text-lg">{bus.placa}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 w-24">Capacidad:</span>
                  <span className="font-bold text-lg">{bus.totalAsientos} asientos</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 w-24">Estado:</span>
                  <span className="flex items-center gap-2 text-green-600 font-bold">
                    <Check size={18} /> Operativo
                  </span>
                </div>
              </div>
            </div>

            {/* Distribución de asientos simulada */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Circle size={16} className="text-green-500 fill-green-500" />
                  <span className="text-sm">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm">VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle size={16} className="text-blue-500 fill-blue-500" />
                  <span className="text-sm">Discapacidad</span>
                </div>
              </div>

              {/* Mini visualización de asientos */}
              <div className="mt-4 bg-gray-100 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-1 max-w-[200px]">
                  {Array.from({ length: Math.min(bus.totalAsientos, 40) }).map((_, i) => {
                    const colores = ["bg-green-400", "bg-green-400", "bg-amber-400", "bg-amber-400", "bg-blue-400"];
                    const color = i < 30 ? colores[0] : i < 38 ? colores[2] : colores[4];
                    return (
                      <div
                        key={i}
                        className={`${color} rounded w-8 h-8 flex items-center justify-center text-xs text-white font-bold`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Vista referencial de {bus.totalAsientos} asientos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}