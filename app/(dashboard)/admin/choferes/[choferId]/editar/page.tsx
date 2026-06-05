"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, User, Save, IdCard, Bus } from "lucide-react";

export default function EditarChofer() {
  const router = useRouter();
  const { choferId } = useParams();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    nombre: "", email: "", cedula: "", licencia: "",
    tipoLicencia: "C", busAsignadoId: "", fotoUrl: "",
  });

  useEffect(() => {
    fetch(`/api/admin/usuarios`)
      .then((res) => res.json())
      .then((data) => {
        const usuario = data.usuarios?.find((u: any) => u.id === choferId);
        if (usuario) {
          setForm({
            nombre: usuario.nombre || "",
            email: usuario.email || "",
            cedula: usuario.cedula || "",
            licencia: usuario.licencia || "",
            tipoLicencia: usuario.tipoLicencia || "C",
            busAsignadoId: usuario.busAsignado?.id || "",
            fotoUrl: usuario.fotoUrl || "",
          });
        }
      });

    fetch("/api/admin/buses")
      .then((res) => res.json())
      .then((data) => setBuses(Array.isArray(data) ? data : []));
  }, [choferId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/usuarios?id=${choferId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMensaje("✅ Chofer actualizado");
      setTimeout(() => router.push("/admin/choferes"), 1000);
    } else {
      setMensaje("❌ Error al actualizar");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 mb-6">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-2xl font-bold mb-6">✏️ Editar Chofer</h1>
      {mensaje && <div className={`mb-4 p-4 rounded-xl text-white ${mensaje.includes("✅") ? "bg-green-500" : "bg-red-500"}`}>{mensaje}</div>}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Nombre</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border rounded-lg p-2.5" /></div>
          <div><label className="text-sm font-medium">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg p-2.5" /></div>
          <div><label className="text-sm font-medium">Cédula</label><input type="text" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="w-full border rounded-lg p-2.5" /></div>
          <div><label className="text-sm font-medium">Licencia</label><input type="text" value={form.licencia} onChange={(e) => setForm({ ...form, licencia: e.target.value })} className="w-full border rounded-lg p-2.5" /></div>
          <div>
            <label className="text-sm font-medium">Tipo Licencia</label>
            <select value={form.tipoLicencia} onChange={(e) => setForm({ ...form, tipoLicencia: e.target.value })} className="w-full border rounded-lg p-2.5">
              <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Bus Asignado</label>
            <select value={form.busAsignadoId} onChange={(e) => setForm({ ...form, busAsignadoId: e.target.value })} className="w-full border rounded-lg p-2.5">
              <option value="">Sin bus</option>
              {buses.map((b: any) => <option key={b.id} value={b.id}>Bus {b.numero} - {b.placa}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}