"use client";

import { useState, useEffect } from "react";
import { Bus, Users, Plus, X, AlertCircle } from "lucide-react";

interface Categoria {
  id?: string;
  nombre: string;
  precioBase: number;
  cantidad: number;
  descripcion?: string;
}

interface BusData {
  id: string;
  numero: string;
  placa: string;
  marcaChasis: string;
  marcaCarroceria: string;
  totalAsientos: number;
  activo: boolean;
  enTerminal: boolean;
  categorias: Categoria[];
}

export default function BusesAdminPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Campos del Formulario de Creación
  const [numero, setNumero] = useState("");
  const [placa, setPlaca] = useState("");
  const [marcaChasis, setMarcaChasis] = useState("");
  const [marcaCarroceria, setMarcaCarroceria] = useState("");
  const [fotografiaUrl, setFotografiaUrl] = useState("");

  const cargarBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/buses");
      if (!res.ok) throw new Error("No se pudo conectar con el servidor API.");
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setBuses([
        {
          id: "b499851a-4ebe-4c3a-ae51-8874109e01de",
          numero: "01",
          placa: "TAA-0101",
          marcaChasis: "Mercedes-Benz",
          marcaCarroceria: "Marcopolo",
          totalAsientos: 40,
          activo: true,
          enTerminal: true,
          categorias: [{ nombre: "Normal", precioBase: 5.0, cantidad: 40 }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBuses();
  }, []);

  const handleSubmitBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const regexPlaca = /^[A-Z]{3}-\d{3,4}$/;
    if (!regexPlaca.test(placa.toUpperCase().trim())) {
      setError("La placa debe cumplir el formato oficial (Ej. ABC-1234).");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        numero: numero.trim(),
        placa: placa.toUpperCase().trim(),
        marcaChasis: marcaChasis.trim(),
        marcaCarroceria: marcaCarroceria.trim(),
        fotografiaUrl: fotografiaUrl.trim() || undefined,
        totalAsientos: 40,
        categorias: [{ nombre: "Normal", precioBase: 5.0, cantidad: 40 }] // Default inicial obligatoria
      };

      const res = await fetch("/api/admin/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar el bus");
      }

      setSuccess("¡Bus registrado con éxito!");
      setIsBusModalOpen(false);
      cargarBuses();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <Bus className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-950">Gestión de Buses</h1>
            <p className="text-xs text-slate-500 mt-0.5">Control vehicular y de flotas.</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal => {
            setNumero("");
            setPlaca("");
            setMarcaChasis("");
            setMarcaCarroceria("");
            setFotografiaUrl("");
            setError("");
            setIsBusModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Añadir Autobús</span>
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm flex items-center space-x-2"><AlertCircle className="h-5 w-5" /><span>{error}</span></div>}
      {success && <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm flex items-center space-x-2"><span>{success}</span></div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Cargando unidades...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Bus / Disco</th>
                <th className="py-3.5 px-6">Placa</th>
                <th className="py-3.5 px-6">Chasis y Carrocería</th>
                <th className="py-3.5 px-6">Asientos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-900">Disco {bus.numero}</td>
                  <td className="py-4 px-6 font-mono text-blue-600">{bus.placa}</td>
                  <td className="py-4 px-6">{bus.marcaChasis} / {bus.marcaCarroceria}</td>
                  <td className="py-4 px-6 flex items-center space-x-1.5">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{bus.totalAsientos} asientos</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isBusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-slate-900">Registrar Nueva Unidad</h3>
              <button onClick={() => setIsBusModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmitBus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Disco *</label>
                <input type="text" required placeholder="Ej. 01" value={numero} onChange={e => setNumero(e.target.value.replace(/\D/g, ""))} className="w-full p-2 border rounded-lg text-sm font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Placa *</label>
                <input type="text" required placeholder="Ej. TAA-0101" value={placa} onChange={e => setPlaca(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Marca Chasis *</label>
                <input type="text" required placeholder="Ej. Mercedes-Benz" value={marcaChasis} onChange={e => setMarcaChasis(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Marca Carrocería *</label>
                <input type="text" required placeholder="Ej. Marcopolo" value={marcaCarroceria} onChange={e => setMarcaCarroceria(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                {submitting ? "Guardando..." : "Guardar Unidad"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}