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
 onSuccess?: (message: string) => void;
 onError?: (message: string) => void;
}

export default function FrecuenciaModal({ isOpen, onClose, frecuencia, onSuccess, onError }: FrecuenciaModalProps) {
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
 // Pre-llenar datos si es edición, garantizando que el arreglo paradas esté presente
 setFormData({
 ...frecuencia,
 paradas: frecuencia.paradas || [],
 });
 } else {
 // Limpiar para nueva creación
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
 // PUT para editar, POST para crear
 const url = frecuencia?.id ? `/api/frecuencias/${frecuencia.id}` : '/api/frecuencias';
 const method = frecuencia?.id ? 'PUT' : 'POST';

 const res = await fetch(url, {
 method,
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(formData),
 });

 if (!res.ok) {
 throw new Error('Error en la petición al servidor');
 }

 if (onSuccess) {
 onSuccess(frecuencia?.id ? 'Frecuencia actualizada correctamente' : 'Frecuencia creada exitosamente');
 }
 
 onClose(true); // Refresca los datos en la tabla principal
 } catch (error) {
 console.error(error);
 if (onError) {
 onError('Ocurrió un error al guardar la frecuencia. Por favor, inténtalo de nuevo.');
 } else {
 setErrors({ global: 'Ocurrió un error al guardar. Verifica tu conexión.' });
 }
 } finally {
 setLoading(false);
 }
 };

 return (
 <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
 <Dialog.Portal>
 <Dialog.Overlay className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
 <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden trangray-x-[-50%] trangray-y-[-50%] border border-gray-200 bg-white shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl ">
 
 <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-10">
 <Dialog.Title className="text-lg font-bold text-gray-900 flex items-center gap-2">
 <Clock className="w-5 h-5 text-blue-500" />
 {frecuencia ? 'Editar Frecuencia' : 'Nueva Frecuencia'}
 </Dialog.Title>
 <Dialog.Close asChild>
 <button 
 className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
 aria-label="Cerrar"
 >
 <X className="w-5 h-5" />
 </button>
 </Dialog.Close>
 </div>

 <form onSubmit={handleSubmit} className="p-6">
 {errors.global && (
 <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 ">
 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
 <p className="text-sm font-medium">{errors.global}</p>
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 {/* Origen */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 flex justify-between">
 Ciudad de Origen
 {errors.ciudadOrigen && <span className="text-xs text-rose-500">{errors.ciudadOrigen}</span>}
 </label>
 <input
 type="text"
 name="ciudadOrigen"
 value={formData.ciudadOrigen}
 onChange={handleChange}
 placeholder="Ej: Quito"
 className={`flex h-11 w-full rounded-xl border bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
 errors.ciudadOrigen ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 '
 }`}
 />
 </div>

 {/* Destino */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 flex justify-between">
 Ciudad de Destino
 {errors.ciudadDestino && <span className="text-xs text-rose-500">{errors.ciudadDestino}</span>}
 </label>
 <input
 type="text"
 name="ciudadDestino"
 value={formData.ciudadDestino}
 onChange={handleChange}
 placeholder="Ej: Guayaquil"
 className={`flex h-11 w-full rounded-xl border bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
 errors.ciudadDestino ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 '
 }`}
 />
 </div>

 {/* Hora */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 flex justify-between">
 Hora de Salida
 {errors.hora && <span className="text-xs text-rose-500">{errors.hora}</span>}
 </label>
 <input
 type="time"
 name="hora"
 value={formData.hora}
 onChange={handleChange}
 className={`flex h-11 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:light] transition-colors ${
 errors.hora ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 '
 }`}
 />
 </div>

 {/* Resolución ANT */}
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 ">
 Resolución ANT <span className="text-gray-400 font-normal">(Opcional)</span>
 </label>
 <input
 type="text"
 name="resolucionAnt"
 value={formData.resolucionAnt}
 onChange={handleChange}
 placeholder="Ej: RES-2023-001"
 className="flex h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
 />
 </div>
 </div>

 {/* Checkboxes: Directa & Activa */}
 <div className="flex flex-wrap gap-8 mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50/50 ">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className="relative flex items-center">
 <input
 type="checkbox"
 name="esDirecta"
 checked={formData.esDirecta}
 onChange={handleChange}
 className="peer sr-only"
 />
 <div className="h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors "></div>
 <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:trangray-x-5 shadow-sm"></div>
 </div>
 <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
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
 <div className="h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-emerald-500 transition-colors "></div>
 <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:trangray-x-5 shadow-sm"></div>
 </div>
 <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
 Frecuencia Activa
 </span>
 </label>
 </div>

 {/* Paradas Intermedias */}
 {!formData.esDirecta && (
 <div className="mt-8 space-y-4">
 <div className="flex justify-between items-center border-b border-gray-200 pb-3">
 <div>
 <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
 <MapPin className="w-4 h-4 text-blue-500"/>
 Paradas Intermedias
 </h4>
 <p className="text-xs text-gray-500 mt-1">Configura las paradas, el precio del tramo y el tiempo en llegar.</p>
 </div>
 <button 
 type="button" 
 onClick={handleAddParada} 
 className="text-xs flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors active:scale-95"
 >
 <Plus className="w-4 h-4" /> Agregar Parada
 </button>
 </div>
 
 <div className="space-y-4 mt-4">
 {formData.paradas.length === 0 ? (
 <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
 No has agregado ninguna parada intermedia.
 </div>
 ) : (
 formData.paradas.map((parada, index) => (
 <div key={index} className="grid grid-cols-12 gap-3 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 ">
 {/* Ciudad */}
 <div className="col-span-12 sm:col-span-4 space-y-1.5">
 <label className="text-xs font-medium text-gray-600 ">Ciudad</label>
 <input
 type="text"
 value={parada.ciudad}
 onChange={(e) => handleParadaChange(index, 'ciudad', e.target.value)}
 placeholder="Ej: Ambato"
 className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
 errors[`parada_${index}_ciudad`] ? 'border-rose-500' : 'border-gray-300 '
 }`}
 />
 </div>
 {/* Precio */}
 <div className="col-span-6 sm:col-span-3 space-y-1.5">
 <label className="text-xs font-medium text-gray-600 ">Precio ($)</label>
 <input
 type="number"
 step="0.01"
 min="0"
 value={parada.precioTramo}
 onChange={(e) => handleParadaChange(index, 'precioTramo', e.target.value)}
 placeholder="0.00"
 className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
 errors[`parada_${index}_precio`] ? 'border-rose-500' : 'border-gray-300 '
 }`}
 />
 </div>
 {/* Tiempo Estimado */}
 <div className="col-span-6 sm:col-span-3 space-y-1.5">
 <label className="text-xs font-medium text-gray-600 ">Tiempo (min)</label>
 <input
 type="number"
 min="1"
 value={parada.tiempoEstimado}
 onChange={(e) => handleParadaChange(index, 'tiempoEstimado', e.target.value)}
 placeholder="60"
 className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
 errors[`parada_${index}_tiempo`] ? 'border-rose-500' : 'border-gray-300 '
 }`}
 />
 </div>
 {/* Eliminar Parada */}
 <div className="col-span-12 sm:col-span-2 flex sm:justify-end items-end h-[62px]">
 <button
 type="button"
 onClick={() => handleRemoveParada(index)}
 className="w-full sm:w-auto p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
 <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end gap-3">
 <Dialog.Close asChild>
 <button
 type="button"
 className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
 disabled={loading}
 >
 Cancelar
 </button>
 </Dialog.Close>
 <button
 type="submit"
 disabled={loading}
 className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 "
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
