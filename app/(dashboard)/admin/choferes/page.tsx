"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash, User, Bus, IdCard } from "lucide-react";

export default function ListaChoferes() {
  const router = useRouter();
  const [choferes, setChoferes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   fetch("/api/admin/usuarios?rol=CHOFER")
  .then((res) => res.json())
  .then((data) => {
    setChoferes(data.usuarios || []);
    setLoading(false);
  })
      .catch(() => setLoading(false));
  }, []);

  const eliminarChofer = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este chofer?")) return;
    await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    setChoferes(choferes.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">👥 Choferes</h1>
          <p className="text-gray-500">Gestiona los conductores de la cooperativa</p>
        </div>
        <button onClick={() => router.push("/admin/choferes/nuevo")}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18} /> Nuevo Chofer
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : choferes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay choferes registrados.</p>
          <button onClick={() => router.push("/admin/choferes/nuevo")}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Crear primer chofer
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {choferes.map((chofer: any) => (
            <div key={chofer.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {chofer.fotoUrl ? (
  <img src={chofer.fotoUrl} alt={chofer.nombre} className="w-14 h-14 rounded-full object-cover border-2 border-blue-500" />
) : (
  <div className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl">
    {chofer.nombre?.charAt(0) || "C"}
  </div>
)}
                  <div>
                    <h3 className="font-bold text-lg">{chofer.nombre}</h3>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><IdCard size={14} /> {chofer.cedula || "Sin cédula"}</span>
                      <span className="flex items-center gap-1">{chofer.licencia ? "✅ Licencia" : "❌ Sin licencia"}</span>
                      <span className="flex items-center gap-1"><Bus size={14} /> {chofer.busAsignado ? `Bus ${chofer.busAsignado.numero}` : "Sin bus"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/admin/choferes/${chofer.id}/editar`)}
                    className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => eliminarChofer(chofer.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition">
                    <Trash size={16} />
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