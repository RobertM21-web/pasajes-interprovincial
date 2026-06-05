"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Save, IdCard, FileText, Bus } from "lucide-react";

export default function NuevoChofer() {
  const router = useRouter();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "Chofer123!",
    cedula: "",
    licencia: "",
    tipoLicencia: "C",
    busAsignadoId: "",
    fotoUrl: "",
  });

  useEffect(() => {
    fetch("/api/admin/buses")
      .then((res) => res.json())
      .then((data) => setBuses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.cedula || !form.licencia) {
      setMensaje("❌ Completa todos los campos obligatorios");
      return;
    }
    setLoading(true);
    setMensaje("");

    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rol: "CHOFER" }),
    });

    if (res.ok) {
      setMensaje("✅ Chofer creado correctamente. Redirigiendo...");
      setTimeout(() => router.push("/admin/choferes"), 1500);
    } else {
      const data = await res.json();
      setMensaje(`❌ Error: ${data.error || "No se pudo crear el chofer"}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 mb-6 hover:underline">
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 p-3 rounded-xl">
          <User size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Chofer</h1>
          <p className="text-gray-500 text-sm">Registra un nuevo conductor en el sistema</p>
        </div>
      </div>

      {mensaje && (
        <div className={`mb-4 p-4 rounded-xl text-white font-medium ${mensaje.includes("✅") ? "bg-green-500" : "bg-red-500"}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-5">
        {/* Datos personales */}
        <div className="border-b pb-4">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><User size={18} /> Datos Personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre completo *</label>
              <input type="text" required value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Pedro Chofer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="chofer@cooperativa.com" />
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="border-b pb-4">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><IdCard size={18} /> Documentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cédula *</label>
              <input type="text" required value={form.cedula}
                onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="1801234567" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Licencia *</label>
              <input type="text" required value={form.licencia}
                onChange={(e) => setForm({ ...form, licencia: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="LIC-123456" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Licencia *</label>
              <select value={form.tipoLicencia}
                onChange={(e) => setForm({ ...form, tipoLicencia: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="A">A - Moto</option>
                <option value="B">B - Auto</option>
                <option value="C">C - Bus</option>
                <option value="D">D - Tráiler</option>
                <option value="E">E - Especial</option>
              </select>
            </div>
            <div>
 
<div>
  <label className="block text-sm font-medium mb-1">Foto del Chofer</label>
  <input type="file" accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setForm({ ...form, fotoUrl: data.url });
        }
      }
    }}
    className="w-full border rounded-lg p-2.5" />
 
</div>
  {form.fotoUrl && (
    <img src={form.fotoUrl} alt="Preview" className="mt-2 w-24 h-24 rounded-full object-cover border-2 border-blue-500" />
  )}
</div>
          </div>
        </div>

        {/* Asignación de bus */}
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><Bus size={18} /> Asignación</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Bus Asignado</label>
            <select value={form.busAsignadoId}
              onChange={(e) => setForm({ ...form, busAsignadoId: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Sin bus asignado</option>
              {buses.map((bus: any) => (
                <option key={bus.id} value={bus.id}>
                  Bus {bus.numero} - {bus.placa} ({bus.totalAsientos} asientos)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón */}
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={20} /> {loading ? "Creando..." : "Crear Chofer"}
        </button>
      </form>
    </div>
  );
}