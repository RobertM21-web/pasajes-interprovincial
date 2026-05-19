"use client";

import { useState, useEffect } from "react";
import { Bus, Users, Plus, X, Trash2, AlertCircle } from "lucide-react";

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
  
  // Campos de bus
  const [numero, setNumero] = useState("");
  const [placa, setPlaca] = useState("");
  const [marcaChasis, setMarcaChasis] = useState("");
  const [marcaCarroceria, setMarcaCarroceria] = useState("");
  const [fotografiaUrl, setFotografiaUrl] = useState("");

  // Categorías de asientos dinámicas para la creación
  const [categoriasNuevaFlota, setCategoriasNuevaFlota] = useState<Categoria[]>([
    { nombre: "Normal", precioBase: 5.0, cantidad: 30, descripcion: "Asiento estándar" }
  ]);

  const totalAsientosCalculados = categoriasNuevaFlota.reduce((acc, cat) => acc + Number(cat.cantidad), 0);

  const cargarBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/buses");
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
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
          categorias: [
            { nombre: "Normal", precioBase: 5.0, cantidad: 30 },
            { nombre: "VIP", precioBase: 8.5, cantidad: 10 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBuses();
  }, []);

  const handleAgregarCategoria = () => {
    setCategoriasNuevaFlota([...categoriasNuevaFlota, { nombre: "VIP", precioBase: 8.0, cantidad: 8 }]);
  };

  const handleEliminarCategoria = (index: number) => {
    if (categoriasNuevaFlota.length === 1) return;
    setCategoriasNuevaFlota(categoriasNuevaFlota.filter((_, i) => i !== index));
  };

  const handleUpdateCategoria = (index: number, campo: keyof Categoria, valor: any) => {
    const updated = [...categoriasNuevaFlota];
    updated[index] = { ...updated[index], [campo]: valor };
    setCategoriasNuevaFlota(updated);
  };

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
        totalAsientos: totalAsientosCalculados,
        categorias: categoriasNuevaFlota.map(cat => ({
          nombre: cat.nombre.trim(),
          precioBase: Number(cat.precioBase),
          cantidad: Number(cat.cantidad),
          descripcion: cat.descripcion || undefined
        }))
      };

      const res = await fetch("/api/admin/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear bus");
      }

      setSuccess("¡Bus registrado con sus categorías de asiento!");
      setIsBusModalOpen(false);
      cargarBuses();
    } catch (err: any) {
      setError(err.message || "Error al procesar.");
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
            <h1 className="text-xl font-bold">Gestión de Buses</h1>
            <p className="text-xs text-slate-500 mt-0.5">Control vehicular y de categorías de asientos.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setNumero("");
            setPlaca("");
            setMarcaChasis("");
            setMarcaCarroceria("");
            setCategoriasNuevaFlota([{ nombre: "Normal", precioBase: 5.0, cantidad: 30 }]);
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

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Leyendo...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3.5 px-6">Disco</th>
                <th className="py-3.5 px-6">Placa</th>
                <th className="py-3.5 px-6">Fabricante</th>
                <th className="py-3.5 px-6">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-900">Disco {bus.numero}</td>
                  <td className="py-4 px-6 font-mono text-blue-600">{bus.placa}</td>
                  <td className="py-4 px-6">{bus.marcaChasis} / {bus.marcaCarroceria}</td>
                  <td className="py-4 px-6 font-semibold">
                    <span className="flex items-center space-x-1.5"><Users className="h-4 w-4 text-slate-400" /><span>{bus.totalAsientos} asientos</span></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isBusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-slate-900">Crear Unidad y Frecuencia</h3>
              <button onClick={() => setIsBusModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmitBus} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Disco" value={numero} onChange={e => setNumero(e.target.value.replace(/\D/g, ""))} className="p-2 border rounded-lg text-sm font-mono" />
                <input type="text" required placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} className="p-2 border rounded-lg text-sm font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Chasis" value={marcaChasis} onChange={e => setMarcaChasis(e.target.value)} className="p-2 border rounded-lg text-sm" />
                <input type="text" required placeholder="Carrocería" value={marcaCarroceria} onChange={e => setMarcaCarroceria(e.target.value)} className="p-2 border rounded-lg text-sm" />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase">Categorías de Asiento</h4>
                  <button type="button" onClick={handleAgregarCategoria} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">+ Agregar</button>
                </div>

                <div className="space-y-3">
                  {categoriasNuevaFlota.map((cat, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg">
                      <input type="text" required placeholder="Nombre" value={cat.nombre} onChange={e => handleUpdateCategoria(idx, "nombre", e.target.value)} className="p-1.5 border rounded bg-white text-xs flex-1" />
                      <input type="number" required placeholder="Precio" value={cat.precioBase} onChange={e => handleUpdateCategoria(idx, "precioBase", Number(e.target.value))} className="p-1.5 border rounded bg-white text-xs w-16 font-mono" />
                      <input type="number" required placeholder="Asientos" value={cat.cantidad} onChange={e => handleUpdateCategoria(idx, "cantidad", Number(e.target.value))} className="p-1.5 border rounded bg-white text-xs w-16 font-mono" />
                      <button type="button" onClick={() => handleEliminarCategoria(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-blue-50 text-blue-800 p-2.5 rounded-lg text-xs font-bold flex justify-between">
                  <span>Asientos Totales:</span>
                  <span className="font-mono">{totalAsientosCalculados}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                {submitting ? "Creando..." : "Guardar Unidad"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}