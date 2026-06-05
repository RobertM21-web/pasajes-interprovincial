'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Clock, MapPin, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import FrecuenciaModal, { Frecuencia } from '@/components/frecuencias/FrecuenciaModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import * as Toast from '@radix-ui/react-toast';

export default function FrecuenciasPage() {
 const [frecuencias, setFrecuencias] = useState<Frecuencia[]>([]);
 const [loading, setLoading] = useState(true);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedFrecuencia, setSelectedFrecuencia] = useState<Frecuencia | null>(null);

 const [isConfirmOpen, setIsConfirmOpen] = useState(false);
 const [frecuenciaToDelete, setFrecuenciaToDelete] = useState<Frecuencia | null>(null);

 const [toast, setToast] = useState<{ open: boolean; title: string; type: 'success' | 'error' }>({
 open: false,
 title: '',
 type: 'success',
 });

 const showToast = (title: string, type: 'success' | 'error' = 'success') => {
 setToast({ open: true, title, type });
 };

 const fetchFrecuencias = async () => {
 try {
 setLoading(true);
 const res = await fetch('/api/frecuencias');
 if (res.ok) {
 const data = await res.json();
 setFrecuencias(data);
 }
 } catch (error) {
 console.error('Error fetching frecuencias:', error);
 showToast('Error al cargar frecuencias', 'error');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchFrecuencias();
 }, []);

 const handleOpenModal = (frecuencia: Frecuencia | null = null) => {
 setSelectedFrecuencia(frecuencia);
 setIsModalOpen(true);
 };

 const handleCloseModal = (refresh?: boolean) => {
 setIsModalOpen(false);
 setSelectedFrecuencia(null);
 if (refresh) {
 fetchFrecuencias();
 }
 };

 const handleDeleteClick = (frecuencia: Frecuencia) => {
 setFrecuenciaToDelete(frecuencia);
 setIsConfirmOpen(true);
 };

 const confirmDelete = async () => {
 if (!frecuenciaToDelete?.id) return;
 
 try {
 const res = await fetch(`/api/frecuencias/${frecuenciaToDelete.id}`, {
 method: 'DELETE',
 });
 if (!res.ok) throw new Error('Error en la petición');
 
 showToast('Frecuencia eliminada exitosamente');
 fetchFrecuencias();
 } catch (error) {
 console.error(error);
 showToast('No se pudo eliminar la frecuencia', 'error');
 throw error; // Propaga el error para detener el loader del ConfirmDialog si es necesario
 }
 };

 return (
 <Toast.Provider swipeDirection="right">
 <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500 p-6 lg:p-8">
 {/* Sección del Encabezado */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 p-6 rounded-2xl border border-gray-200 backdrop-blur-md shadow-sm">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
 <Clock className="w-6 h-6 text-blue-500" />
 Gestión de Frecuencias
 </h1>
 <p className="text-sm text-gray-500 mt-1">
 Administra los horarios, rutas y paradas de los viajes interprovinciales.
 </p>
 </div>
 
 <button 
 onClick={() => handleOpenModal()}
 className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 "
 >
 <Plus className="w-4 h-4" />
 Nueva frecuencia
 </button>
 </div>

 {/* Sección de la Tabla */}
 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative min-h-[400px]">
 {loading ? (
 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
 <span className="mt-2 text-sm font-medium text-gray-600 ">Cargando frecuencias...</span>
 </div>
 ) : null}

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-gray-50/80 border-b border-gray-200 ">
 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Ruta
 </th>
 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Hora de Salida
 </th>
 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Tipo de Viaje
 </th>
 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Estado
 </th>
 <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
 Acciones
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 ">
 {!loading && frecuencias.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-6 py-16 text-center text-gray-500 ">
 <div className="flex flex-col items-center justify-center gap-3">
 <div className="p-4 bg-gray-50 rounded-full">
 <MapPin className="w-8 h-8 text-gray-400 " />
 </div>
 <p className="text-sm font-medium">No se encontraron frecuencias registradas.</p>
 <p className="text-xs text-gray-400">Crea una nueva frecuencia para comenzar.</p>
 </div>
 </td>
 </tr>
 ) : (
 frecuencias.map((frecuencia) => (
 <tr 
 key={frecuencia.id}
 className="group hover:bg-gray-50/80 transition-colors duration-200"
 >
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-gray-900 ">
 {frecuencia.ciudadOrigen}
 </span>
 <span className="text-gray-400 font-medium">→</span>
 <span className="font-semibold text-gray-900 ">
 {frecuencia.ciudadDestino}
 </span>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center gap-2 text-gray-600 font-medium bg-gray-100 w-fit px-3 py-1 rounded-md">
 <Clock className="w-3.5 h-3.5 text-gray-400" />
 {frecuencia.hora}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
 frecuencia.esDirecta 
 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ' 
 : 'bg-blue-50 text-blue-700 border-blue-200 '
 }`}>
 {frecuencia.esDirecta ? 'Viaje Directo' : 'Con Paradas'}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center gap-1.5">
 {frecuencia.activa ? (
 <>
 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
 <span className="text-sm font-medium text-emerald-600 ">Activa</span>
 </>
 ) : (
 <>
 <XCircle className="w-4 h-4 text-rose-500" />
 <span className="text-sm font-medium text-rose-600 ">Inactiva</span>
 </>
 )}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
 <button 
 onClick={() => handleOpenModal(frecuencia)}
 className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:opacity-100"
 title="Editar frecuencia"
 >
 <Pencil className="w-4 h-4" />
 </button>
 <button 
 onClick={() => handleDeleteClick(frecuencia)}
 className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:opacity-100"
 title="Eliminar frecuencia"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 
 <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-500 flex justify-between items-center">
 <span>Mostrando <span className="font-semibold text-gray-900 ">{frecuencias.length}</span> resultados</span>
 </div>
 </div>

 {/* Modales */}
 <FrecuenciaModal 
 isOpen={isModalOpen} 
 onClose={handleCloseModal} 
 frecuencia={selectedFrecuencia} 
 onSuccess={(msg) => showToast(msg, 'success')}
 onError={(msg) => showToast(msg, 'error')}
 />

 <ConfirmDialog 
 isOpen={isConfirmOpen}
 onClose={() => setIsConfirmOpen(false)}
 onConfirm={confirmDelete}
 title="Eliminar Frecuencia"
 description={`¿Estás seguro de que deseas eliminar la frecuencia de ${frecuenciaToDelete?.ciudadOrigen} a ${frecuenciaToDelete?.ciudadDestino}? Esta acción no se puede deshacer y borrará las paradas intermedias asociadas.`}
 />
 
 {/* Configuración del Toast de Radix UI */}
 <Toast.Root
 open={toast.open}
 onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
 className="bg-white border border-gray-200 shadow-xl rounded-xl p-4 flex items-center justify-between gap-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:trangray-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:trangray-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full"
 >
 <div className="flex items-center gap-3">
 {toast.type === 'success' ? (
 <div className="bg-emerald-100 p-1.5 rounded-full shrink-0">
 <CheckCircle2 className="w-5 h-5 text-emerald-600 " />
 </div>
 ) : (
 <div className="bg-rose-100 p-1.5 rounded-full shrink-0">
 <XCircle className="w-5 h-5 text-rose-600 " />
 </div>
 )}
 <Toast.Title className="text-sm font-semibold text-gray-900 ">
 {toast.title}
 </Toast.Title>
 </div>
 <Toast.Close className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 ">
 <X className="w-4 h-4" />
 </Toast.Close>
 </Toast.Root>
 <Toast.Viewport className="fixed bottom-0 right-0 z-[2147483647] m-0 flex w-[400px] max-w-[100vw] list-none flex-col gap-2 p-6 outline-none" />
 </div>
 </Toast.Provider>
 );
}
