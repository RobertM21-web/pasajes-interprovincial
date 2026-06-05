"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, X, User, Search } from "lucide-react";

export default function PasajerosRuta() {
  const { rutaId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch(`/api/chofer/pasajeros/${rutaId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [rutaId]);

  const handleAbordaje = async (boletoId: string, accion: string) => {
    const res = await fetch("/api/chofer/abordaje", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boletoId, accion }),
    });

    if (res.ok) {
      // Refrescar datos
      const updated = await fetch(`/api/chofer/pasajeros/${rutaId}`).then((r) => r.json());
      setData(updated);
    }
  };

  const pasajerosFiltrados = data?.pasajeros?.filter((p: any) => {
    const coincideEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cedula.includes(busqueda) ||
      p.asiento.etiqueta.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  }) || [];

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "ABORDADO": return "bg-green-500";
      case "NO_ABORDADO": return "bg-red-500";
      case "PAGADO": return "bg-amber-500";
      default: return "bg-gray-400";
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Cargando pasajeros...</div>;
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 mb-4 hover:underline">
        <ArrowLeft size={18} /> Volver a mis rutas
      </button>

      <h1 className="text-2xl font-bold mb-2">👥 Pasajeros</h1>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-3xl font-bold text-green-500">{data?.abordo || 0}</p>
          <p className="text-sm text-gray-500">✅ Abordo</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-3xl font-bold text-red-500">{data?.noAbordo || 0}</p>
          <p className="text-sm text-gray-500">❌ No abordo</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <p className="text-3xl font-bold text-amber-500">{data?.pendientes || 0}</p>
          <p className="text-sm text-gray-500">⏳ Pendientes</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {["todos", "PAGADO", "ABORDADO", "NO_ABORDADO"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filtroEstado === f ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {f === "todos" ? "Todos" : f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pasajero..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>
      </div>

      {/* Tabla de pasajeros */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Asiento</th>
                <th className="text-left p-3">Pasajero</th>
                <th className="text-left p-3">Cédula</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Categoría</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-center p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pasajerosFiltrados.map((p: any, index: number) => (
                <tr key={p.id} className={`border-b hover:bg-gray-50 ${
                  p.estado === "ABORDADO" ? "bg-green-50" :
                  p.estado === "NO_ABORDADO" ? "bg-red-50" : ""
                }`}>
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-bold text-blue-600">{p.asiento.etiqueta}</td>
                  <td className="p-3 flex items-center gap-2">
                    <User size={16} /> {p.nombre}
                  </td>
                  <td className="p-3 text-sm text-gray-600">{p.cedula}</td>
                  <td className="p-3 text-sm">{p.tipo}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {p.asiento.categoria}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getEstadoBadge(p.estado)}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="p-3">
                    {p.estado === "PAGADO" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleAbordaje(p.id, "ABORDADO")}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition flex items-center gap-1 text-sm"
                        >
                          <Check size={14} /> Abordó
                        </button>
                        <button
                          onClick={() => handleAbordaje(p.id, "NO_ABORDADO")}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition flex items-center gap-1 text-sm"
                        >
                          <X size={14} /> No abordó
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pasajerosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron pasajeros.</p>
        )}
      </div>
    </div>
  );
}