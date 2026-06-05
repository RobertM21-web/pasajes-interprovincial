"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bus, AlertTriangle, Check, Circle, Wrench, Gauge, Thermometer, Droplets } from "lucide-react";

export default function MiBus() {
  const { data: session } = useSession();
  const router = useRouter();
  const choferId = (session?.user as any)?.id;
  const [perfil, setPerfil] = useState<any>(null);
  const [estadoBus, setEstadoBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportando, setReportando] = useState(false);
  const [falla, setFalla] = useState("");

  useEffect(() => {
    if (!choferId) return;

    // Cargar perfil con bus asignado
    fetch("/api/admin/usuarios")
      .then((res) => res.json())
      .then((data) => {
        const usuario = data.usuarios?.find((u: any) => u.id === choferId);
        setPerfil(usuario || null);
        
        // Si tiene bus, cargar estado
        if (usuario?.busAsignado?.id) {
          fetch(`/api/buses/${usuario.busAsignado.id}/estado`)
            .then((res) => res.json())
            .then((data) => setEstadoBus(data))
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [choferId]);

  const reportarFalla = async () => {
    if (!falla.trim() || !perfil?.busAsignado) return;
    await fetch("/api/chofer/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        choferId,
        rutaId: null,
        tipo: "DANO",
        descripcion: `[Reporte de bus] ${falla}`,
      }),
    });
    setFalla("");
    setReportando(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Bus size={64} className="mx-auto text-gray-300 animate-pulse" />
        <p className="text-gray-500 mt-4">Cargando información del bus...</p>
      </div>
    );
  }

  if (!perfil?.busAsignado) {
    return (
      <div className="p-6 text-center">
        <Bus size={64} className="mx-auto text-gray-300" />
        <p className="text-gray-500 mt-4 text-lg">No tienes un bus asignado actualmente.</p>
      </div>
    );
  }

  const bus = perfil.busAsignado;
  const estado = estadoBus || { llantas: 80, aceite: 75, motor: "OK" };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🚍 Mi Bus</h1>

      {/* Tarjeta del bus */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-40 flex items-center justify-center">
          <Bus size={80} className="text-white opacity-30" />
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold">Bus {bus.numero} - {bus.placa}</h2>
          <p className="text-gray-500 mt-1">Capacidad: {bus.totalAsientos} asientos</p>
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <Check size={14} /> Operativo
          </span>
        </div>
      </div>

      {/* Estado del vehículo */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Gauge size={22} /> Estado del Vehículo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Llantas */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1"><Circle size={14} className="text-gray-500" /> Llantas</span>
              <span className={`text-sm font-bold ${estado.llantas > 50 ? "text-green-600" : estado.llantas > 25 ? "text-amber-600" : "text-red-600"}`}>{estado.llantas}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full ${estado.llantas > 50 ? "bg-green-500" : estado.llantas > 25 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${estado.llantas}%` }}></div>
            </div>
          </div>

          {/* Aceite */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1"><Droplets size={14} className="text-gray-500" /> Aceite</span>
              <span className={`text-sm font-bold ${estado.aceite > 50 ? "text-green-600" : estado.aceite > 25 ? "text-amber-600" : "text-red-600"}`}>{estado.aceite}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full ${estado.aceite > 50 ? "bg-green-500" : estado.aceite > 25 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${estado.aceite}%` }}></div>
            </div>
          </div>

          {/* Motor */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1"><Wrench size={14} className="text-gray-500" /> Motor</span>
              <span className={`text-sm font-bold ${estado.motor === "OK" ? "text-green-600" : "text-red-600"}`}>{estado.motor}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`h-3 rounded-full ${estado.motor === "OK" ? "bg-green-500" : "bg-red-500"}`} style={{ width: estado.motor === "OK" ? "100%" : "30%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reportar falla */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle size={22} className="text-amber-500" /> Reportar Falla
        </h2>
        {!reportando ? (
          <button onClick={() => setReportando(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
            ⚠️ Reportar un problema del bus
          </button>
        ) : (
          <div className="space-y-3">
            <textarea value={falla} onChange={(e) => setFalla(e.target.value)}
              className="w-full border rounded-lg p-3 h-24 resize-none" placeholder="Describe la falla o problema del bus..." />
            <div className="flex gap-2">
              <button onClick={reportarFalla} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Enviar reporte</button>
              <button onClick={() => { setReportando(false); setFalla(""); }} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}