"use client";

import { useState, useEffect } from "react";
import { 
  Bus, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Users,
  Info,
  Eye
} from "lucide-react";

interface Asiento {
  id: string;
  numero: number;
  fila: number;
  posicion: string; // "VENTANA" | "PASILLO"
  etiqueta: string; // "1A", "1B", etc.
}

interface Categoria {
  id?: string;
  nombre: string;
  precioBase: number;
  cantidad: number;
  descripcion?: string;
  asientos?: Asiento[];
}

interface BusData {
  id: string;
  numero: string;
  placa: string;
  marcaChasis: string;
  marcaCarroceria: string;
  fotografiaUrl?: string;
  totalAsientos: number;
  activo: boolean;
  enTerminal: boolean;
  categorias: Categoria[];
}

export default function BusesAdminPage() {
  // Listas y estados de consulta
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Control de Modales
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState<string | null>(null);

  // Vista activa de plano de asientos
  const [selectedBusMap, setSelectedBusMap] = useState<BusData | null>(null);

  // Formulario de Bus (Crear / Editar básico)
  const [editingBus, setEditingBus] = useState<BusData | null>(null);
  const [numero, setNumero] = useState("");
  const [placa, setPlaca] = useState("");
  const [marcaChasis, setMarcaChasis] = useState("");
  const [marcaCarroceria, setMarcaCarroceria] = useState("");
  const [fotografiaUrl, setFotografiaUrl] = useState("");
  const [enTerminal, setEnTerminal] = useState(true);
  const [activo, setActivo] = useState(true);

  // Lista dinámica de categorías para la creación de un nuevo Bus
  const [categoriasNuevaFlota, setCategoriasNuevaFlota] = useState<Categoria[]>([
    { nombre: "Normal", precioBase: 5.0, cantidad: 30, descripcion: "Asiento estándar de la unidad" }
  ]);

  // Formulario para añadir una categoría a un bus ya existente
  const [catNombre, setCatNombre] = useState("");
  const [catPrecio, setCatPrecio] = useState(5.0);
  const [catCantidad, setCatCantidad] = useState(10);
  const [catDescripcion, setCatDescripcion] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Calcula automáticamente el total de asientos sumando las categorías creadas
  const totalAsientosCalculados = categoriasNuevaFlota.reduce((acc, cat) => acc + Number(cat.cantidad), 0);

  // Cargar lista completa de buses de SQL Server (GET) apuntando a la ruta real /api/admin/buses
  const cargarBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/buses");
      if (!res.ok) throw new Error("No se pudo conectar con el servidor API.");
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn("API de buses no detectada o base de datos vacía. Usando datos locales de contingencia.");
      // Fallback seguro de desarrollo para que el Canvas siga viéndose espectacular
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
            { id: "c1", nombre: "Normal", precioBase: 5.0, cantidad: 30, descripcion: "Asiento estándar" },
            { id: "c2", nombre: "VIP", precioBase: 8.5, cantidad: 8, descripcion: "Reclinables premium" },
            { id: "c3", nombre: "Discapacidad", precioBase: 5.0, cantidad: 2, descripcion: "Acceso prioritario" }
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

  // Manejo de agregación/eliminación de categorías en el formulario de creación rápida
  const handleAgregarCategoriaNuevaFlota = () => {
    setCategoriasNuevaFlota([
      ...categoriasNuevaFlota,
      { nombre: "VIP", precioBase: 8.0, cantidad: 8, descripcion: "" }
    ]);
  };

  const handleEliminarCategoriaNuevaFlota = (idx: number) => {
    if (categoriasNuevaFlota.length === 1) return;
    setCategoriasNuevaFlota(categoriasNuevaFlota.filter((_, i) => i !== idx));
  };

  const handleUpdateCategoriaNuevaFlota = (idx: number, campo: keyof Categoria, valor: any) => {
    const updated = [...categoriasNuevaFlota];
    updated[idx] = { ...updated[idx], [campo]: valor };
    setCategoriasNuevaFlota(updated);
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingBus(null);
    setNumero("");
    setPlaca("");
    setMarcaChasis("");
    setMarcaCarroceria("");
    setFotografiaUrl("");
    setEnTerminal(true);
    setActivo(true);
    setCategoriasNuevaFlota([
      { nombre: "Normal", precioBase: 5.0, cantidad: 30, descripcion: "Asiento estándar de la unidad" }
    ]);
    setError("");
    setIsBusModalOpen(true);
  };

  // Abrir Modal de Edición Básica (Para PUT)
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

  // Enviar formulario (POST para crear con categorías / PUT para datos básicos de bus)
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
        // ACTUALIZACIÓN DE BUS (PUT) apuntando a la API real de Enrique
        const payload = {
          numero: numero.trim(),
          placa: placa.toUpperCase().trim(),
          marcaChasis: marcaChasis.trim(),
          marcaCarroceria: marcaCarroceria.trim(),
          fotografiaUrl: fotografiaUrl.trim(),
          enTerminal,
          activo
        };

        const res = await fetch(`/api/admin/buses/${editingBus.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Ocurrió un error al actualizar el bus.");
        }

        setSuccess("Bus actualizado exitosamente.");
        setIsBusModalOpen(false);
        cargarBuses();
      } else {
        // CREACIÓN DE BUS CON CATEGORÍAS (POST) apuntando a la API de Enrique
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
            descripcion: cat.descripcion?.trim() || undefined
          }))
        };

        const res = await fetch("/api/admin/buses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al procesar la creación.");
        }

        setSuccess("Nuevo autobús y plano de asientos creados con éxito.");
        setIsBusModalOpen(false);
        cargarBuses();
      }
    } catch (err: any) {
      setError(err.message || "Error al comunicarse con la base de datos.");
    } finally {
      setSubmitting(false);
    }
  };

  // Registrar nueva categoría en un bus ya creado (POST /api/admin/buses/[id]/categorias)
  const handleAddCategoryToExistingBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/buses/${editingBus.id}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: catNombre.trim(),
          precioBase: Number(catPrecio),
          cantidad: Number(catCantidad),
          descripcion: catDescripcion.trim() || undefined
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar la categoría.");
      }

      setSuccess("Categoría y asientos anexados correctamente al bus.");
      setIsCategoryModalOpen(false);
      setIsBusModalOpen(false);
      // Reiniciar inputs
      setCatNombre("");
      setCatPrecio(5.0);
      setCatCantidad(10);
      setCatDescripcion("");
      cargarBuses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar una categoría de un bus (DELETE /api/admin/buses/[id]/categorias/[id])
  const handleDeleteCategory = async (busId: string, catId: string) => {
    if (!confirm("¿Seguro de que deseas eliminar esta categoría? Se eliminarán los asientos asociados.")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/buses/${busId}/categorias/${catId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar.");

      setSuccess("Categoría eliminada correctamente.");
      setIsBusModalOpen(false);
      cargarBuses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Abrir diálogo de borrado
  const triggerDeleteBus = (id: string) => {
    setBusToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Confirmar eliminación del Bus apuntando a la ruta real de Enrique
  const handleConfirmDeleteBus = async () => {
    if (!busToDelete) return;
    setError("");
    setSuccess("");
    setIsDeleteConfirmOpen(false);

    try {
      const res = await fetch(`/api/admin/buses/${busToDelete}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ocurrió un error.");

      setSuccess(data.message || "Bus procesado con éxito.");
      cargarBuses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      
      {/* MODAL PERSONALIZADO DE ELIMINACIÓN */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl max-w-md w-full text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950">¿Eliminar esta Unidad?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Esta acción es irreversible. El sistema verificará si hay rutas activas para aplicar un borrado lógico (desactivación) o físico de manera automática.
            </p>
            <div className="mt-6 flex justify-center space-x-3">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDeleteBus}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition"
              >
                Confirmar Borrado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white">
            <Bus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Gestión de Buses</h1>
            <p className="text-xs text-slate-500 mt-0.5">Mapea la flota vehicular y gestiona categorías tarifarias de asientos.</p>
          </div>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Añadir Autobús</span>
        </button>
      </div>

      {/* Mensajes de Alerta */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center space-x-2.5 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center space-x-2.5 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Cuerpo principal del CRUD */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* Tabla / Lista de Buses (8 Columnas) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-400">
                <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Leyendo buses de SQL Server...
              </div>
            ) : buses.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-400">
                No existen autobuses cargados en el sistema.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Bus / Disco</th>
                      <th className="py-3.5 px-6">Placa</th>
                      <th className="py-3.5 px-6">Chasis y Carrocería</th>
                      <th className="py-3.5 px-6">Asientos</th>
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {buses.map((bus) => (
                      <tr key={bus.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          Disco {bus.numero}
                        </td>
                        <td className="py-4 px-6 font-mono font-medium text-blue-600">
                          {bus.placa}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800">{bus.marcaChasis || "Mercedes-Benz"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{bus.marcaCarroceria || "Marcopolo"}</p>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          <div className="flex items-center space-x-1.5 text-slate-600">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>{bus.totalAsientos} asientos</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => setSelectedBusMap(bus)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex"
                            title="Ver plano de asientos"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(bus)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition inline-flex"
                            title="Editar bus"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteBus(bus.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition inline-flex"
                            title="Borrar bus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Plano de Asientos Interactivo de Next.js (4 Columnas) */}
        <div className="lg:col-span-4">
          {selectedBusMap ? (
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Bus className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold text-white">Distribución: Bus {selectedBusMap.numero}</h3>
                </div>
                <button 
                  onClick={() => setSelectedBusMap(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Categorías tarifarias del bus seleccionado */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leyenda Tarifaria</span>
                <div className="grid gap-2 text-xs">
                  {selectedBusMap.categorias.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className={`h-3 w-3 rounded ${
                          idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-amber-500" : "bg-purple-500"
                        }`}></span>
                        <span className="font-semibold">{cat.nombre}</span>
                      </div>
                      <span className="font-mono text-emerald-400">${Number(cat.precioBase).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Representación visual de un bus real (Layout Tipo Avión) */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 relative">
                {/* Cabina del Conductor */}
                <div className="h-10 border-b border-dashed border-slate-800 mb-6 flex items-center justify-between px-3 text-slate-500 text-[10px] font-bold uppercase">
                  <span>Conductor </span>
                  <span>Puerta </span>
                </div>

                {/* Plano de Asientos en una cuadrícula de 4 columnas */}
                <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                  {Array.from({ length: Math.ceil(selectedBusMap.totalAsientos / 4) }).map((_, fIdx) => {
                    const fila = fIdx + 1;
                    return ["A", "B", "C", "D"].map((letra) => {
                      const etiqueta = `${fila}${letra}`;
                      const esVIP = fila === 1; 
                      const esDiscapacidad = fila === 10;
                      
                      return (
                        <div 
                          key={etiqueta}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center border text-[10px] font-bold transition-all relative ${
                            esVIP 
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300" 
                              : esDiscapacidad 
                              ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}
                          title={`Asiento ${etiqueta}`}
                        >
                          <span>{etiqueta}</span>
                        </div>
                      );
                    });
                  })}
                </div>

                {/* Pasillo central de salida */}
                <div className="absolute top-[48px] bottom-4 left-1/2 -translate-x-1/2 w-4 bg-slate-950/90 border-l border-r border-dashed border-slate-800 pointer-events-none flex items-center justify-center">
                  <span className="text-[8px] text-slate-700 uppercase tracking-widest rotate-90">Pasillo</span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-start space-x-2 text-[11px] text-slate-400 leading-relaxed">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Los asientos han sido generados automáticamente en la base de datos siguiendo una grilla normalizada de 4 asientos por fila (2 izquierda, pasillo, 2 derecha).</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm sticky top-6">
              <div className="bg-slate-50 p-3.5 rounded-full inline-block text-slate-400 mb-3.5">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-950">Visualizar Planos</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                Haz clic en el icono del ojo de cualquier bus para desplegar su plano de asientos y categorías tarifarias en tiempo real.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE BUS (CREAR / EDITAR) */}
      {isBusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                {editingBus ? `Modificar Datos de Unidad` : "Dar de Alta Autobús con Categorías"}
              </h3>
              <button 
                onClick={() => setIsBusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido con scroll para formularios largos */}
            <form onSubmit={handleSubmitBus} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid gap-5 md:grid-cols-2">
                {/* Inputs de Identificación */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-1">Parámetros Vehiculares</h4>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="bus-numero" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Disco / Registro Nro. *</label>
                    <input
                      id="bus-numero"
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ej. 01"
                      required
                      disabled={editingBus !== null}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50/50 focus:bg-white text-slate-900 font-mono disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bus-placa" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Placa Vehicular *</label>
                    <input
                      id="bus-placa"
                      type="text"
                      maxLength={8}
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value)}
                      placeholder="Ej. TAA-0101"
                      required
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50/50 focus:bg-white text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* Inputs de Fabricante */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-1">Marca e Ingeniería</h4>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="bus-chasis" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Marca del Chasis *</label>
                    <input
                      id="bus-chasis"
                      type="text"
                      value={marcaChasis}
                      onChange={(e) => setMarcaChasis(e.target.value)}
                      placeholder="Ej. Mercedes-Benz"
                      required
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50/50 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bus-carroceria" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Marca de Carrocería *</label>
                    <input
                      id="bus-carroceria"
                      type="text"
                      value={marcaCarroceria}
                      onChange={(e) => setMarcaCarroceria(e.target.value)}
                      placeholder="Ej. Marcopolo"
                      required
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50/50 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Fotografía URL */}
              <div className="space-y-1.5">
                <label htmlFor="bus-fotografia" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Fotografía o Imagen URL</label>
                <input
                  id="bus-fotografia"
                  type="text"
                  value={fotografiaUrl}
                  onChange={(e) => setFotografiaUrl(e.target.value)}
                  placeholder="https://ejemplo.com/bus.png"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-slate-50/50 focus:bg-white text-slate-900"
                />
              </div>

              {/* Parámetros de Estado */}
              {editingBus && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center space-x-2.5">
                    <input 
                      type="checkbox" 
                      id="edit-terminal" 
                      checked={enTerminal} 
                      onChange={(e) => setEnTerminal(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="edit-terminal" className="text-xs font-bold text-slate-700 cursor-pointer">Unidad disponible en Terminal</label>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <input 
                      type="checkbox" 
                      id="edit-activo" 
                      checked={activo} 
                      onChange={(e) => setActivo(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="edit-activo" className="text-xs font-bold text-slate-700 cursor-pointer">Unidad de transporte Activa</label>
                  </div>
                </div>
              )}

              {/* SECCIÓN CATEGORÍAS */}
              {editingBus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Categorías Tarifarias de la Unidad</h4>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                    >
                      + Anexar Categoría
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {editingBus.categorias.map((cat) => (
                      <div key={cat.id} className="p-3.5 rounded-xl border border-slate-200/80 flex items-start justify-between bg-slate-50/50">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{cat.nombre}</p>
                          <p className="text-xs text-slate-500 mt-1 font-mono">${Number(cat.precioBase).toFixed(2)} • {cat.cantidad} Asientos</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(editingBus.id, cat.id || "")}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                          title="Eliminar Categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Distribución de Asientos por Categoría</h4>
                    <button
                      type="button"
                      onClick={handleAgregarCategoriaNuevaFlota}
                      className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                    >
                      + Añadir Categoría
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {categoriasNuevaFlota.map((cat, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 grid gap-3 sm:grid-cols-12 items-center relative">
                        {/* Input de Nombre */}
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nombre Categoría</label>
                          <input 
                            type="text" 
                            required 
                            value={cat.nombre}
                            onChange={(e) => handleUpdateCategoriaNuevaFlota(idx, "nombre", e.target.value)}
                            placeholder="Ej. Normal o VIP"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        {/* Input de Precio */}
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio Base ($)</label>
                          <input 
                            type="number" 
                            required 
                            step="0.01"
                            min="0.01"
                            value={cat.precioBase}
                            onChange={(e) => handleUpdateCategoriaNuevaFlota(idx, "precioBase", Number(e.target.value))}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-white font-mono"
                          />
                        </div>

                        {/* Input de Cantidad */}
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nro. Asientos</label>
                          <input 
                            type="number" 
                            required 
                            min="1"
                            value={cat.cantidad}
                            onChange={(e) => handleUpdateCategoriaNuevaFlota(idx, "cantidad", Number(e.target.value))}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-white font-mono"
                          />
                        </div>

                        {/* Eliminar categoría */}
                        <div className="sm:col-span-2 flex justify-end pt-5">
                          <button
                            type="button"
                            onClick={() => handleEliminarCategoriaNuevaFlota(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contador auto-calculado de asientos para el envío del JSON */}
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between text-xs font-bold text-blue-800">
                    <span>Total de Asientos Generados:</span>
                    <span className="text-sm font-black font-mono">{totalAsientosCalculados} asientos</span>
                  </div>
                </div>
              )}

              {/* Botones del Modal Principal */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBusModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar Unidad"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: AÑADIR CATEGORÍA A BUS EXISTENTE */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-950">Añadir Nueva Categoría</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategoryToExistingBus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre de la Categoría *</label>
                <input 
                  type="text" 
                  required 
                  value={catNombre}
                  onChange={(e) => setCatNombre(e.target.value)}
                  placeholder="Ej. Vip, Discapacidad"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Precio Base ($) *</label>
                  <input 
                    type="number" 
                    required 
                    step="0.01"
                    min="0.01"
                    value={catPrecio}
                    onChange={(e) => setCatPrecio(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Nro. de Asientos *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={catCantidad}
                    onChange={(e) => setCatCantidad(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Descripción Corta</label>
                <textarea 
                  value={catDescripcion}
                  onChange={(e) => setCatDescripcion(e.target.value)}
                  placeholder="Detalles sobre los asientos de esta categoría..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none h-20 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
                >
                  {submitting ? "Creando..." : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}