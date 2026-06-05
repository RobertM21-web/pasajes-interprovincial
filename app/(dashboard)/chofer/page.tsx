"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bus, Users, Clock, MapPin, Phone, IdCard, Shield, FileText } from "lucide-react";

export default function DashboardChofer() {
  const router = useRouter();
  const { data: session } = useSession();
  const choferId = (session?.user as any)?.id;

  const [perfil, setPerfil] = useState<any>(null);
  const [rutas, setRutas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!choferId) return;

    // Cargar perfil
    fetch("/api/admin/usuarios")
      .then((res) => res.json())
      .then((data) => {
        const usuario = data.usuarios?.find((u: any) => u.id === choferId);
        setPerfil(usuario || null);
      })
      .catch(() => {});

    // Cargar rutas
    fetch(`/api/chofer/rutas?choferId=${choferId}`)
      .then((res) => res.json())
      .then((data) => {
        setRutas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [choferId]);

  const rutasHoy = rutas.filter(
    (r: any) => new Date(r.fecha).toDateString() === new Date().toDateString()
  );
  const totalPasajeros = rutasHoy.reduce((sum: number, r: any) => sum + r.totalPasajeros, 0);
  const proximaRuta = rutasHoy[0];

  return (
    <div className="p-6">
      {/* Perfil del Chofer */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {perfil?.fotoUrl ? (
            <img src={perfil.fotoUrl} alt={perfil.nombre} className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {perfil?.nombre?.charAt(0) || "C"}
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{perfil?.nombre || "Chofer"}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><IdCard size={16} /> {perfil?.cedula || "Sin cédula"}</span>
              <span className="flex items-center gap-1"><Shield size={16} /> Lic: {perfil?.licencia || "N/A"} ({perfil?.tipoLicencia || "-"})</span>
              <span className="flex items-center gap-1"><Phone size={16} /> {perfil?.telefono || "Sin teléfono"}</span>
            </div>
          </div>
          {perfil?.busAsignado && (
            <button onClick={() => router.push("/chofer/mi-bus")}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition flex items-center gap-2">
              <Bus size={18} /> Bus {perfil.busAsignado.numero} - {perfil.busAsignado.placa}
            </button>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button onClick={() => router.push("/chofer/mis-rutas")} 
          className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition text-center">
          <Bus size={32} className="mx-auto text-blue-500 mb-2" />
          <p className="font-bold text-sm">Mis Rutas</p>
        </button>
        <button onClick={() => router.push("/chofer/reportes")} 
          className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition text-center">
          <FileText size={32} className="mx-auto text-orange-500 mb-2" />
          <p className="font-bold text-sm">Reportes</p>
        </button>
        <button onClick={() => router.push("/chofer/mi-bus")} 
          className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition text-center">
          <Bus size={32} className="mx-auto text-green-500 mb-2" />
          <p className="font-bold text-sm">Mi Bus</p>
        </button>
        {rutasHoy.length > 0 && (
          <button onClick={() => router.push(`/chofer/pasajeros/${rutasHoy[0].id}`)} 
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition text-center">
            <Users size={32} className="mx-auto text-purple-500 mb-2" />
            <p className="font-bold text-sm">Pasajeros</p>
          </button>
        )}
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">Rutas de hoy</p><p className="text-3xl font-bold">{rutasHoy.length}</p></div>
            <Bus size={40} />
          </div>
        </div>
        <div className="bg-green-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-90">Pasajeros hoy</p><p className="text-3xl font-bold">{totalPasajeros}</p></div>
            <Users size={40} />
          </div>
        </div>
        <div className="bg-amber-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Próxima salida</p>
              <p className="text-lg font-bold">{proximaRuta ? `${proximaRuta.origen} → ${proximaRuta.destino}` : "Sin rutas"}</p>
              <p className="text-sm">{proximaRuta?.hora || ""}</p>
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
              <thead><tr className="border-b"><th className="text-left p-2">Hora</th><th className="text-left p-2">Origen</th><th className="text-left p-2">Destino</th><th className="text-left p-2">Bus</th><th className="text-left p-2">Pasajeros</th><th className="text-left p-2">Estado</th></tr></thead>
              <tbody>
                {rutasHoy.map((ruta: any) => (
                  <tr key={ruta.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/chofer/pasajeros/${ruta.id}`)}>
                    <td className="p-2">{ruta.hora}</td><td className="p-2">{ruta.origen}</td><td className="p-2">{ruta.destino}</td>
                    <td className="p-2">{ruta.bus?.numero} - {ruta.bus?.placa}</td>
                    <td className="p-2">{ruta.abordo}/{ruta.totalPasajeros}</td>
                    <td className="p-2"><span className={`px-2 py-1 rounded-full text-xs text-white ${ruta.estado === "HABILITADA" ? "bg-blue-500" : ruta.estado === "EN_CURSO" ? "bg-green-500" : "bg-gray-500"}`}>{ruta.estado}</span></td>
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