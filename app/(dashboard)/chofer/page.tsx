"use client";

import { useState, useEffect } from "react";
import { Bus, Users, Clock, AlertTriangle } from "lucide-react";

export default function DashboardChofer() {
const [rutas, setRutas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Obtener choferId del usuario logueado
    const choferId = "ID_DEL_CHOFER";
    fetch(`/api/chofer/rutas?choferId=${choferId}`)
      .then((res) => res.json())
      .then((data) => {
        setRutas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const rutasHoy = rutas.filter(
    (r: any) => new Date(r.fecha).toDateString() === new Date().toDateString()
  );
  const totalPasajeros = rutasHoy.reduce((sum: number, r: any) => sum + r.totalPasajeros, 0);
  const proximaRuta = rutasHoy[0];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🚌 Dashboard del Chofer</h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Rutas de hoy</p>
              <p className="text-3xl font-bold">{rutasHoy.length}</p>
            </div>
            <Bus size={40} />
          </div>
        </div>

        <div className="bg-green-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pasajeros hoy</p>
              <p className="text-3xl font-bold">{totalPasajeros}</p>
            </div>
            <Users size={40} />
          </div>
        </div>

        <div className="bg-amber-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Próxima salida</p>
              <p className="text-lg font-bold">
                {proximaRuta
                  ? `${(proximaRuta as any).origen} → ${(proximaRuta as any).destino}`
                  : "Sin rutas"}
              </p>
              <p className="text-sm">{proximaRuta ? (proximaRuta as any).hora : ""}</p>
            </div>
            <Clock size={40} />
          </div>
        </div>
      </div>

      {/* Próximas rutas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📋 Próximas Rutas</h2>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : rutasHoy.length === 0 ? (
          <p className="text-gray-500">No tienes rutas programadas para hoy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Hora</th>
                  <th className="text-left p-2">Origen</th>
                  <th className="text-left p-2">Destino</th>
                  <th className="text-left p-2">Bus</th>
                  <th className="text-left p-2">Pasajeros</th>
                  <th className="text-left p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rutasHoy.map((ruta: any) => (
                  <tr key={ruta.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{ruta.hora}</td>
                    <td className="p-2">{ruta.origen}</td>
                    <td className="p-2">{ruta.destino}</td>
                    <td className="p-2">{ruta.bus.numero} - {ruta.bus.placa}</td>
                    <td className="p-2">{ruta.abordo}/{ruta.totalPasajeros}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${
                        ruta.estado === "HABILITADA" ? "bg-blue-500" :
                        ruta.estado === "EN_CURSO" ? "bg-green-500" :
                        "bg-gray-500"
                      }`}>
                        {ruta.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}