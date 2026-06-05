"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Bus, User, Clock, Search, Filter } from "lucide-react";

export default function ReportesAdmin() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/admin/reportes")
      .then((res) => res.json())
      .then((data) => {
        setReportes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "RETRASO": return "bg-amber-500";
      case "DANO": return "bg-red-500";
      case "EMERGENCIA": return "bg-red-700";
      case "CLIMA": return "bg-blue-500";
      case "TRAFICO": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getTipoIcono = (tipo: string) => {
    switch (tipo) {
      case "RETRASO": return "⏰";
      case "DANO": return "🔧";
      case "EMERGENCIA": return "🆘";
      case "CLIMA": return "🌧️";
      case "TRAFICO": return "🚗";
      default: return "📝";
    }
  };

  const reportesFiltrados = reportes.filter((r) => {
    const coincideTipo = filtro === "TODOS" || r.tipo === filtro;
    const coincideBusqueda =
      r.chofer?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ruta?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideTipo && coincideBusqueda;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 Reportes de Choferes</h1>
          <p className="text-gray-500">Revisa todas las novedades reportadas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {["TODOS", "RETRASO", "DANO", "EMERGENCIA", "CLIMA", "TRAFICO", "OTRO"].map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filtro === f ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Buscar..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full" />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-2xl font-bold text-red-500">{reportes.filter(r => r.tipo === "DANO").length}</p>
          <p className="text-xs text-gray-500">🔧 Daños</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-2xl font-bold text-amber-500">{reportes.filter(r => r.tipo === "RETRASO").length}</p>
          <p className="text-xs text-gray-500">⏰ Retrasos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-2xl font-bold text-red-700">{reportes.filter(r => r.tipo === "EMERGENCIA").length}</p>
          <p className="text-xs text-gray-500">🆘 Emergencias</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-2xl font-bold text-blue-500">{reportes.length}</p>
          <p className="text-xs text-gray-500">📋 Total</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Chofer</th>
                <th className="text-left p-3">Ruta</th>
                <th className="text-left p-3">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm flex items-center gap-1">
                    <Clock size={14} /> {new Date(r.createdAt || r.fecha).toLocaleString("es-EC")}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getTipoBadge(r.tipo)}`}>
                      {getTipoIcono(r.tipo)} {r.tipo}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    {r.chofer?.nombre || "Sin chofer"}
                  </td>
                  <td className="p-3 text-sm">{r.ruta || "—"}</td>
                  <td className="p-3 text-sm max-w-xs truncate">{r.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reportesFiltrados.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay reportes registrados.</p>
        )}
      </div>
    </div>
  );
}