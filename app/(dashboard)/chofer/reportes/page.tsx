"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Send, Clock, FileText } from "lucide-react";

export default function ReportesChofer() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Formulario
  const [tipo, setTipo] = useState("RETRASO");
  const [descripcion, setDescripcion] = useState("");
  const [rutaId, setRutaId] = useState("");
  const [rutas, setRutas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");

  const choferId = "ID_DEL_CHOFER";

  useEffect(() => {
    // Cargar rutas para el select
    fetch(`/api/chofer/rutas?choferId=${choferId}`)
      .then((res) => res.json())
      .then((data) => {
        setRutas(Array.isArray(data) ? data : []);
      });

    // Cargar reportes anteriores
    fetch(`/api/chofer/reportes?choferId=${choferId}`)
      .then((res) => res.json())
      .then((data) => {
        setReportes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rutaId || !descripcion) return;

    setEnviando(true);
    const res = await fetch("/api/chofer/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choferId, rutaId, tipo, descripcion }),
    });

    if (res.ok) {
      setMensaje("✅ Reporte enviado correctamente");
      setDescripcion("");
      setRutaId("");
      // Refrescar lista
      const updated = await fetch(`/api/chofer/reportes?choferId=${choferId}`).then((r) => r.json());
      setReportes(Array.isArray(updated) ? updated : []);
    } else {
      setMensaje("❌ Error al enviar el reporte");
    }
    setEnviando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "RETRASO": return "bg-amber-500";
      case "DANO": return "bg-red-500";
      case "EMERGENCIA": return "bg-red-700";
      case "CLIMA": return "bg-blue-500";
      case "TRAFICO": return "bg-orange-500";
      default: return "bg-gray-400";
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📝 Reportar Novedad</h1>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" /> Nueva novedad
        </h2>

        {mensaje && (
          <div className={`mb-4 p-3 rounded-lg text-white ${mensaje.includes("✅") ? "bg-green-500" : "bg-red-500"}`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select de ruta */}
          <div>
            <label className="block text-sm font-medium mb-1">Ruta</label>
            <select
              value={rutaId}
              onChange={(e) => setRutaId(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">Selecciona una ruta</option>
              {rutas.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.origen} → {r.destino} - {new Date(r.fecha).toLocaleDateString()} {r.hora}
                </option>
              ))}
            </select>
          </div>

          {/* Select de tipo */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de novedad</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: "RETRASO", label: "⏰ Retraso" },
                { value: "DANO", label: "🔧 Daño del bus" },
                { value: "EMERGENCIA", label: "🆘 Emergencia" },
                { value: "CLIMA", label: "🌧️ Clima" },
                { value: "TRAFICO", label: "🚗 Tráfico" },
                { value: "OTRO", label: "📝 Otro" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTipo(opt.value)}
                  className={`p-2 rounded-lg border-2 transition text-sm ${
                    tipo === opt.value
                      ? "border-blue-500 bg-blue-50 font-bold"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción <span className="text-gray-400">({descripcion.length}/500)</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
              className="w-full border rounded-lg p-3 h-32 resize-none"
              placeholder="Describe la novedad..."
              required
            />
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={enviando || !rutaId || !descripcion}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} /> {enviando ? "Enviando..." : "Reportar novedad"}
          </button>
        </form>
      </div>

      {/* Historial de reportes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText size={20} /> Historial de reportes
        </h2>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : reportes.length === 0 ? (
          <p className="text-gray-500">No has realizado reportes aún.</p>
        ) : (
          <div className="space-y-3">
            {reportes.map((r: any) => (
              <div key={r.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTipoIcono(r.tipo)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getTipoBadge(r.tipo)}`}>
                      {r.tipo}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> {new Date(r.fecha).toLocaleString("es-EC")}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{r.ruta}</span>
                </div>
                <p className="text-gray-700">{r.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}