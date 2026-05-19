import prisma from '@/lib/prisma';
import { Plus, Pencil, Trash2, Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export const metadata = {
  title: 'Frecuencias | Panel de Administración',
};

export default async function FrecuenciasPage() {
  // Obtener las frecuencias desde la Base de Datos usando Prisma
  const frecuencias = await prisma.frecuencia.findMany({
    orderBy: [
      { hora: 'asc' },
    ],
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500 p-6 lg:p-8">
      {/* Sección del Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Gestión de Frecuencias
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra los horarios, rutas y paradas de los viajes interprovinciales.
          </p>
        </div>
        
        {/* 
          NOTA: Para integrar @radix-ui/react-dialog (modales) en un Server Component, 
          estos botones interactivos deben ser extraídos a un Client Component 
          (ej. <CreateFrecuenciaDialog />) que envuelva el botón.
        */}
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
          <Plus className="w-4 h-4" />
          Nueva frecuencia
        </button>
      </div>

      {/* Sección de la Tabla */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Hora de Salida
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tipo de Viaje
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {frecuencias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                        <MapPin className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-sm font-medium">No se encontraron frecuencias registradas.</p>
                      <p className="text-xs text-slate-400">Crea una nueva frecuencia para comenzar.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                frecuencias.map((frecuencia) => (
                  <tr 
                    key={frecuencia.id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {frecuencia.ciudadOrigen}
                        </span>
                        <span className="text-slate-400 font-medium">→</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {frecuencia.ciudadDestino}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 w-fit px-3 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {frecuencia.hora}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        frecuencia.esDirecta 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                      }`}>
                        {frecuencia.esDirecta ? 'Viaje Directo' : 'Con Paradas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {frecuencia.activa ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Activa</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Inactiva</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* 
                          NOTA: Igual que el botón de crear, estos botones deben 
                          envolver el trigger del modal en un Client Component.
                        */}
                        <button 
                          className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Editar frecuencia"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
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
        
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span>Mostrando <span className="font-semibold text-slate-900 dark:text-slate-200">{frecuencias.length}</span> resultados</span>
        </div>
      </div>
    </div>
  );
}
