"use client";

import { useState, useEffect } from "react";
import { Bus, Users, Plus, X, Trash2, Edit2, AlertCircle } from "lucide-react";

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
  
  // Campos del Formulario
  const [editingBus, setEditingBus] = useState<BusData | null>(null);
  const [numero, setNumero] = useState("");
  const [placa, setPlaca] = useState("");
  const [marcaChasis, setMarcaChasis] = useState("");
  const [marcaCarroceria, setMarcaCarroceria] = useState("");
  const [fotografiaUrl, setFotografiaUrl] = useState("");
  const [enTerminal, setEnTerminal] = useState(true);
  const [activo, setActivo] = useState(true);

  const [categoriasNuevaFlota, setCategoriasNuevaFlota] = useState<Categoria[]>([
    { nombre: "Normal", precioBase: 5.0, cantidad: 30 }
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

  const handleOpenCreateModal = () => {
    setEditingBus(null);
    setNumero("");
    setPlaca("");
    setMarcaChasis("");
    setMarcaCarroceria("");
    setFotografiaUrl("");
    setEnTerminal(true);
    setActivo(true);
    setCategoriasNuevaFlota([{ nombre: "Normal", precioBase: 5.0, cantidad: 30 }]);
    setError("");
    setIsBusModalOpen(true);
  };

  const handleOpenEditModal = (bus: BusData) => {
    setEditingBus(bus);
    setNumero(bus.numero);
    setPlaca(bus.placa);
    setMarcaChasis(bus.marcaChasis);
    setMarcaCarroceria(bus.marcaCarroceria);
    setFotografiaUrl(bus.fotografiaUrl || "");
    setEnTerminal(bus.enTerminal);
    setActivo(bus.activo);
    setError("");
    setIsBusModalOpen(true);
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
      if (editingBus) {
        const payload = {
          numero: numero.trim(),
          placa: placa.toUpperCase().trim(),
          marcaChasis: marcaChasis.trim(),
          marcaCarroceria: marcaCarroceria.trim(),
          fotografiaUrl: fotografiaUrl.trim() || undefined,
          enTerminal,
          activo
        };

        const res = await fetch(`/api/admin/buses/${editingBus.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Error al actualizar la unidad.");
        setSuccess("Bus modificado correctamente.");
      } else {
        const payload = {
          numero: numero.trim(),
          placa: placa.toUpperCase().trim(),
          marcaChasis: marcaChasis.trim(),
          marcaCarroceria: marcaCarroceria.trim(),
          fotografiaUrl: fotografiaUrl.trim() || undefined,
          totalAsientos: totalAsientosCalculados,
          enTerminal,
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

        if (!res.ok) throw new Error("Error al registrar bus");
        setSuccess("Nuevo autobús registrado con éxito.");
      }

      setIsBusModalOpen(false);
      cargarBuses();
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud.");
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
          onClick={handleOpenCreateModal}
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
          <p className="p-12 text-center text-sm text-slate-400">Leyendo bases...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3.5 px-6">Disco</th>
                <th className="py-3.5 px-6">Placa</th>
                <th className="py-3.5 px-6">Fabricante</th>
                <th className="py-3.5 px-6">Asientos</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold">Disco {bus.numero}</td>
                  <td className="py-4 px-6 font-mono text-blue-600">{bus.placa}</td>
                  <td className="py-4 px-6">{bus.marcaChasis} / {bus.marcaCarroceria}</td>
                  <td className="py-4 px-6 font-semibold">
                    <span className="flex items-center space-x-1.5"><Users className="h-4 w-4 text-slate-400" /><span>{bus.totalAsientos} asientos</span></span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleOpenEditModal(bus)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-flex"><Edit2 className="h-4 w-4" /></button>
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
              <h3 className="font-bold text-slate-900">{editingBus ? "Modificar Datos" : "Registrar Bus"}</h3>
              <button onClick={() => setIsBusModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmitBus} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Disco" disabled={editingBus !== null} value={numero} onChange={e => setNumero(e.target.value.replace(/\D/g, ""))} className="p-2 border rounded-lg text-sm font-mono disabled:opacity-50" />
                <input type="text" required placeholder="Placa" value={placa} onChange={e => setPlaca(e.target.value)} className="p-2 border rounded-lg text-sm font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Chasis" value={marcaChasis} onChange={e => setMarcaChasis(e.target.value)} className="p-2 border rounded-lg text-sm" />
                <input type="text" required placeholder="Carrocería" value={marcaCarroceria} onChange={e => setMarcaCarroceria(e.target.value)} className="p-2 border rounded-lg text-sm" />
              </div>

              {editingBus && (
                <div className="bg-slate-50 p-3 rounded-lg border flex gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={enTerminal} onChange={e => setEnTerminal(e.target.checked)} /> Disponible en terminal</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} /> Bus Activo</label>
                </div>
              )}

              {!editingBus && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-blue-600 uppercase">Categorías de Asiento</h4>
                  </div>
                  <div className="mt-3 bg-blue-50 text-blue-800 p-2.5 rounded-lg text-xs font-bold flex justify-between">
                    <span>Asientos Totales:</span>
                    <span className="font-mono">{totalAsientosCalculados}</span>
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                {submitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}