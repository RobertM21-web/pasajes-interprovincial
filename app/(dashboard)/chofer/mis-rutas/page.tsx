"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, Calendar, Clock, MapPin, Bus } from "lucide-react";

export default function MisRutas() {
  const router = useRouter();
  const [rutas, setRutas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("hoy");

  useEffect(() => {
    const choferId = "ID_DEL_CHOFER";
    fetch(`/api/chofer/rutas?choferId=${choferId}`)
      .then((res) => res.json())
      .then((data) => {
        setRutas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtrarRutas = () => {
    const ahora = new Date();
    return rutas.filter((r: any) => {
      const fechaRuta = new Date(r.fecha);
      switch (filtro) {
        case "hoy":
          return fechaRuta.toDateString() === ahora.toDateString();
        case "semana": {
          const inicioSemana = new Date(ahora);
          inicioSemana.setDate(ahora.getDate() - ahora.getDay());
          const finSemana = new Date(inicioSemana);
          finSemana.setDate(inicioSemana.getDate() + 6);
          return fechaRuta >= inicioSemana && fechaRuta <= finSemana;
        }
        case "mes":
          return fechaRuta.getMonth() === ahora.getMonth() && fechaRuta.getFullYear() === ahora.getFullYear();
        default:
          return true;
      }
    });
  };

  const rutasFiltradas = filtrarRutas();

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "HABILITADA": return "bg-blue-500";
      case "EN_CURSO": return "bg-green-500";
      case "COMPLETADA": return "bg-gray-500";
      case "CANCELADA": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🚌 Mis Rutas</h1>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {["hoy", "semana", "mes"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === f
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f === "hoy" ? "📅 Hoy" : f === "semana" ? "📆 Esta semana" : "🗓️ Este mes"}
          </button>
        ))}
      </div>

      {/* Lista de rutas */}
      {loading ? (
        <p className="text-gray-500">Cargando rutas...</p>
      ) : rutasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow">
          <p className="text-gray-500 text-lg">No tienes rutas asignadas en este período.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rutasFiltradas.map((ruta: any) => (
            <div key={ruta.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-blue-500" />
                    <span className="font-bold text-lg">{ruta.origen} → {ruta.destino}</span>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getBadgeColor(ruta.estado)}`}>
                      {ruta.estado}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {new Date(ruta.fecha).toLocaleDateString("es-EC")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {ruta.hora}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bus size={14} /> Bus {ruta.bus.numero} - {ruta.bus.placa}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{ruta.abordo}</p>
                    <p className="text-xs text-gray-500">Abordo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-500">{ruta.totalPasajeros}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <button
                    onClick={() => router.push(`/chofer/pasajeros/${ruta.id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                  >
                    <Eye size={16} /> Ver pasajeros
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}