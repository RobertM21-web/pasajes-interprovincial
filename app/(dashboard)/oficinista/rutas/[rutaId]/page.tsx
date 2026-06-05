"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bus, MapPin, Clock, Calendar, User, Check, X } from "lucide-react";

export default function DetalleRuta() {
  const { rutaId } = useParams();
  const router = useRouter();
  const [ruta, setRuta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/rutas/${rutaId}`)
      .then((res) => res.json())
      .then((data) => {
        setRuta(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [rutaId]);

  if (loading) return <div className="p-6 text-gray-500">Cargando...</div>;
  if (!ruta) return <div className="p-6 text-gray-500">Ruta no encontrada.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 mb-6 hover:underline">
        <ArrowLeft size={18} /> Volver
      </button>

      <h1 className="text-2xl font-bold mb-6">📋 Detalle de Ruta</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-blue-500" />
            <div><p className="text-sm text-gray-500">Origen</p><p className="font-bold">{ruta.frecuencia?.ciudadOrigen || ruta.origen}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-red-500" />
            <div><p className="text-sm text-gray-500">Destino</p><p className="font-bold">{ruta.frecuencia?.ciudadDestino || ruta.destino}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <div><p className="text-sm text-gray-500">Fecha</p><p className="font-bold">{new Date(ruta.fecha).toLocaleDateString("es-EC")}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-500" />
            <div><p className="text-sm text-gray-500">Hora</p><p className="font-bold">{ruta.frecuencia?.hora || ruta.hora}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Bus size={20} className="text-gray-500" />
            <div><p className="text-sm text-gray-500">Bus</p><p className="font-bold">{ruta.bus?.numero} - {ruta.bus?.placa}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Check size={20} className="text-green-500" />
            <div><p className="text-sm text-gray-500">Estado</p>
              <span className={`px-2 py-1 rounded-full text-xs text-white ${ruta.estado === "HABILITADA" ? "bg-blue-500" : "bg-green-500"}`}>
                {ruta.estado}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}