'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, Clock, MapPin, Save, Loader2, AlertCircle } from 'lucide-react';

export type ParadaIntermedia = {
  id?: string;
  ciudad: string;
  precioTramo: number | string;
  tiempoEstimado: number | string;
};

export type Frecuencia = {
  id?: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  hora: string;
  resolucionAnt: string;
  esDirecta: boolean;
  activa: boolean;
  paradas: ParadaIntermedia[];
};

interface FrecuenciaModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  frecuencia: Frecuencia | null;
}

export default function FrecuenciaModal({ isOpen, onClose, frecuencia }: FrecuenciaModalProps) {
  const [formData, setFormData] = useState<Frecuencia>({
    ciudadOrigen: '',
    ciudadDestino: '',
    hora: '',
    resolucionAnt: '',
    esDirecta: true,
    activa: true,
    paradas: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (frecuencia) {
        setFormData({
          ...frecuencia,
          paradas: frecuencia.paradas || [],
        });
      } else {
        setFormData({
          ciudadOrigen: '',
          ciudadDestino: '',
          hora: '',
          resolucionAnt: '',
          esDirecta: true,
          activa: true,
          paradas: [],
        });
      }
      setErrors({});
    }
  }, [frecuencia, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.ciudadOrigen.trim()) newErrors.ciudadOrigen = 'Requerido';
    if (!formData.ciudadDestino.trim()) newErrors.ciudadDestino = 'Requerido';
    if (!formData.hora) newErrors.hora = 'Requerido';
    
    if (!formData.esDirecta) {
      if (formData.paradas.length === 0) {
        newErrors.global = 'Debe agregar al menos una parada si el viaje no es directo.';
      }
      formData.paradas.forEach((parada, index) => {
        if (!parada.ciudad.trim()) newErrors[`parada_${index}_ciudad`] = 'Requerido';
        if (parada.precioTramo === '' || Number(parada.precioTramo) < 0) newErrors[`parada_${index}_precio`] = 'Inválido';
        if (parada.tiempoEstimado === '' || Number(parada.tiempoEstimado) <= 0) newErrors[`parada_${index}_tiempo`] = 'Inválido';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddParada = () => {
    setFormData((prev) => ({
      ...prev,
      paradas: [...prev.paradas, { ciudad: '', precioTramo: '', tiempoEstimado: '' }],
    }));
  };

  const handleRemoveParada = (index: number) => {
    setFormData((prev) => {
      const newParadas = [...prev.paradas];
      newParadas.splice(index, 1);
      return { ...prev, paradas: newParadas };
    });
  };

  const handleParadaChange = (index: number, field: keyof ParadaIntermedia, value: string) => {
    setFormData((prev) => {
      const newParadas = [...prev.paradas];
      newParadas[index] = { ...newParadas[index], [field]: value };
      return { ...prev, paradas: newParadas };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const url = frecuencia?.id ? `/api/frecuencias/${frecuencia.id}` : '/api/frecuencias';
      const method = frecuencia?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Error en la petición');
      }

      onClose(true);
    } catch (error) {
      console.error(error);
      setErrors({ global: 'Ocurrió un error al guardar la frecuencia. Por favor, revisa tu conexión e inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden translate-x-[-50%] translate-y-[-50%] border border-slate-200 bg-white shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900">
          
          {/* Header del Modal */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 px-6 py-4 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              {frecuencia ? 'Editar Frecuencia' : 'Nueva Frecuencia'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {errors.global && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{errors.global}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Origen */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  Ciudad de Origen
                  {errors.ciudadOrigen && <span className="text-xs text-rose-500">{errors.ciudadOrigen}</span>}
                </label>
                <input
                  type="text"
                  name="ciudadOrigen"
                  value={formData.ciudadOrigen}
                  onChange={handleChange}
                  placeholder="Ej: Quito"
                  className={`flex h-11 w-full rounded-xl border bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-colors ${
                    errors.ciudadOrigen ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </div>

              {/* Destino */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  Ciudad de Destino
                  {errors.ciudadDestino && <span className="text-xs text-rose-500">{errors.ciudadDestino}</span>}
                </label>
                <input
                  type="text"
                  name="ciudadDestino"
                  value={formData.ciudadDestino}
                  onChange={handleChange}
                  placeholder="Ej: Guayaquil"
                  className={`flex h-11 w-full rounded-xl border bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-colors ${
                    errors.ciudadDestino ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  Hora de Salida
                  {errors.hora && <span className="text-xs text-rose-500">{errors.hora}</span>}
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  className={`flex h-11 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark] transition-colors ${
                    errors.hora ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </div>

              {/* Resolución ANT */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Resolución ANT <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="resolucionAnt"
                  value={formData.resolucionAnt}
                  onChange={handleChange}
                  placeholder="Ej: RES-2023-001"
                  className="flex h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:text-slate-100 transition-colors"
                />
              </div>
            </div>

            {/* Checkboxes: Directa & Activa */}
            <div className="flex flex-wrap gap-8 mt-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-800/30">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="esDirecta"
                    checked={formData.esDirecta}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-indigo-600 transition-colors dark:bg-slate-700"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                  Viaje Directo
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={formData.activa}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-emerald-500 transition-colors dark:bg-slate-700"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                  Frecuencia Activa
                </span>
              </label>
            </div>

            {/* Paradas Intermedias */}
            {!formData.esDirecta && (
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-500"/>
                      Paradas Intermedias
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Configura las paradas, el precio del tramo y el tiempo en llegar.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddParada} 
                    className="text-xs flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-lg font-medium transition-colors dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Agregar Parada
                  </button>
                </div>
                
                <div className="space-y-4 mt-4">
                  {formData.paradas.length === 0 ? (
                    <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-sm">
                      No has agregado ninguna parada intermedia.
                    </div>
                  ) : (
                    formData.paradas.map((parada, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-start bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        {/* Ciudad */}
                        <div className="col-span-12 sm:col-span-4 space-y-1.5">
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Ciudad</label>
                          <input
                            type="text"
                            value={parada.ciudad}
                            onChange={(e) => handleParadaChange(index, 'ciudad', e.target.value)}
                            placeholder="Ej: Ambato"
                            className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                              errors[`parada_${index}_ciudad`] ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </div>
                        {/* Precio */}
                        <div className="col-span-6 sm:col-span-3 space-y-1.5">
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Precio ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={parada.precioTramo}
                            onChange={(e) => handleParadaChange(index, 'precioTramo', e.target.value)}
                            placeholder="0.00"
                            className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                              errors[`parada_${index}_precio`] ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </div>
                        {/* Tiempo Estimado */}
                        <div className="col-span-6 sm:col-span-3 space-y-1.5">
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tiempo (min)</label>
                          <input
                            type="number"
                            min="1"
                            value={parada.tiempoEstimado}
                            onChange={(e) => handleParadaChange(index, 'tiempoEstimado', e.target.value)}
                            placeholder="60"
                            className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                              errors[`parada_${index}_tiempo`] ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </div>
                        {/* Eliminar Parada */}
                        <div className="col-span-12 sm:col-span-2 flex sm:justify-end items-end h-[62px]">
                          <button
                            type="button"
                            onClick={() => handleRemoveParada(index)}
                            className="w-full sm:w-auto p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors dark:hover:bg-rose-500/10 dark:hover:text-rose-400 flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sm:hidden">Eliminar Parada</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Guardando...' : 'Guardar Frecuencia'}
              </button>
            </div>

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
