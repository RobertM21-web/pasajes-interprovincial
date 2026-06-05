'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Bus as BusIcon, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Loader2,
  DollarSign
} from 'lucide-react';

// Interfaces
interface ParadaIntermedia {
  id: string;
  frecuenciaId: string;
  ciudad: string;
  orden: number;
  precioTramo: string | number;
  tiempoEstimado: number | null;
}

interface Frecuencia {
  id: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  hora: string;
  resolucionAnt: string | null;
  esDirecta: boolean;
  activa: boolean;
  paradasIntermedias?: ParadaIntermedia[];
}

interface Bus {
  id: string;
  numero: string;
  placa: string;
  marcaChasis: string;
  marcaCarroceria: string;
  totalAsientos: number;
  activo: boolean;
  enTerminal: boolean;
}

interface CategoriaAsiento {
  id: string;
  busId: string;
  nombre: string;
  precioBase: string | number;
  cantidad: number;
  descripcion: string | null;
}

interface FrecuenciaMaestroDetalleProps {
  frecuencias: Frecuencia[];
}

export default function FrecuenciaMaestroDetalle({ frecuencias }: FrecuenciaMaestroDetalleProps) {
  const [selectedFrecuencia, setSelectedFrecuencia] = useState<Frecuencia | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busesLoading, setBusesLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [categorias, setCategorias] = useState<CategoriaAsiento[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Toast local
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setBusesLoading(true);
        const res = await fetch('/api/buses/disponibles');
        if (res.ok) {
          const data = await res.json();
          setBuses(data);
        }
      } catch (error) {
        console.error('Error fetching buses:', error);
      } finally {
        setBusesLoading(false);
      }
    };
    fetchBuses();
  }, []);

  const handleSelectFrecuencia = (frecuencia: Frecuencia) => {
    setSelectedFrecuencia(frecuencia);
    setSelectedBus(null);
    setCategorias([]);
  };

  const handleSelectBus = async (bus: Bus) => {
    if (selectedBus?.id === bus.id) {
      setSelectedBus(null);
      setCategorias([]);
      return;
    }
    setSelectedBus(bus);
    try {
      setCategoriasLoading(true);
      const res = await fetch(`/api/admin/buses/${bus.id}/categorias`);
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategorias([]);
    } finally {
      setCategoriasLoading(false);
    }
  };

  const handleAsignarBus = () => {
    setToastMessage('Funcionalidad disponible al habilitar ruta');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const formatPrice = (price: string | number) => {
    const num = Number(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Filtrar frecuencias por término de búsqueda
  const filteredFrecuencias = frecuencias.filter((frec) => {
    const searchString = `${frec.ciudadOrigen} ${frec.ciudadDestino} ${frec.hora}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 w-full items-start">
      {/* PANEL IZQUIERDO - Maestro (40% de ancho en pantallas grandes) */}
      <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Frecuencias
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecciona una frecuencia para ver e interactuar con su detalle.
          </p>
        </div>

        {/* Buscador de frecuencias */}
        <input
          type="text"
          placeholder="Buscar origen, destino o hora..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all"
        />

        {/* Listado de frecuencias con scroll */}
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredFrecuencias.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No se encontraron frecuencias.
            </div>
          ) : (
            filteredFrecuencias.map((frec) => {
              const isSelected = selectedFrecuencia?.id === frec.id;
              return (
                <div
                  key={frec.id}
                  onClick={() => handleSelectFrecuencia(frec)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/20 ring-1 ring-blue-500 shadow-sm'
                      : 'border-slate-150 dark:border-slate-800/80 bg-white hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-850 dark:text-slate-200">
                        <span>{frec.ciudadOrigen}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>{frec.ciudadDestino}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-355 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg w-fit">
                        <Clock className="w-3.5 h-3.5 text-slate-450" />
                        <span className="font-semibold">{frec.hora}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Badge Activa/Inactiva */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          frec.activa 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}>
                          {frec.activa ? 'Activa' : 'Inactiva'}
                        </span>

                        {/* Badge Directa/Con Paradas */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          frec.esDirecta 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        }`}>
                          {frec.esDirecta ? 'Directa' : 'Con Paradas'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL DERECHO - Detalle (60% de ancho en pantallas grandes) */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] flex flex-col">
        {!selectedFrecuencia ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-3 text-slate-400">
              <Info className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Selecciona una frecuencia para ver el detalle
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 animate-fade-in">
            {/* Cabecera del Detalle */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
                <span>{selectedFrecuencia.ciudadOrigen}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>{selectedFrecuencia.ciudadDestino}</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold text-lg bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  {selectedFrecuencia.hora}
                </span>
              </h2>
            </div>

            {/* Sección Paradas Intermedias */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Paradas Intermedias
              </h3>

              {selectedFrecuencia.esDirecta ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-350 rounded-xl text-sm font-medium">
                  Esta frecuencia es directa, sin paradas intermedias
                </div>
              ) : !selectedFrecuencia.paradasIntermedias || selectedFrecuencia.paradasIntermedias.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-150 dark:border-amber-500/20 text-amber-800 dark:text-amber-350 rounded-xl text-sm font-medium">
                  No hay paradas intermedias registradas para esta frecuencia.
                </div>
              ) : (
                <div className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/30">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="px-4 py-2 text-center w-12">N°</th>
                        <th className="px-4 py-2">Ciudad</th>
                        <th className="px-4 py-2">Precio Tramo</th>
                        <th className="px-4 py-2">Tiempo Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {[...selectedFrecuencia.paradasIntermedias]
                        .sort((a, b) => a.orden - b.orden)
                        .map((parada) => (
                          <tr key={parada.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                            <td className="px-4 py-2 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-500/5">
                              {parada.orden}
                            </td>
                            <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">
                              {parada.ciudad}
                            </td>
                            <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                              ${formatPrice(parada.precioTramo)} USD
                            </td>
                            <td className="px-4 py-2 text-slate-650 dark:text-slate-400">
                              {parada.tiempoEstimado ? `${parada.tiempoEstimado} min` : '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sección Buses Disponibles */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BusIcon className="w-4 h-4 text-indigo-500" />
                Buses disponibles para esta frecuencia
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {busesLoading ? (
                  <div className="col-span-full flex items-center justify-center p-6 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Cargando buses disponibles...
                  </div>
                ) : buses.length === 0 ? (
                  <div className="col-span-full p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-500">
                    No hay buses disponibles en este momento.
                  </div>
                ) : (
                  buses.map((bus) => {
                    const isBusSelected = selectedBus?.id === bus.id;
                    return (
                      <div
                        key={bus.id}
                        onClick={() => handleSelectBus(bus)}
                        className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isBusSelected
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500 shadow-sm'
                            : 'border-slate-205 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${
                              isBusSelected 
                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                                : 'bg-slate-105 dark:bg-slate-800 text-slate-500'
                            }`}>
                              <BusIcon className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                Bus N° {bus.numero}
                              </p>
                              <p className="text-[11px] text-slate-450 dark:text-slate-400 font-mono">
                                Placa: {bus.placa}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-650 dark:text-slate-300">
                              {bus.totalAsientos} asientos
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sub-tarjeta de Categorías de Asientos */}
              {selectedBus && (
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Categorías de asientos - Bus N° {selectedBus.numero}
                  </h4>
                  
                  {categoriasLoading ? (
                    <div className="flex items-center justify-center p-4 text-slate-550 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Cargando categorías de asientos...
                    </div>
                  ) : categorias.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Este bus no tiene categorías de asientos configuradas.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {categorias.map((cat) => (
                        <div 
                          key={cat.id} 
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                              {cat.nombre}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {cat.cantidad} asientos
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                              ${formatPrice(cat.precioBase)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón de Acción */}
            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={handleAsignarBus}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                Asignar bus a frecuencia
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-800 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-350 font-medium text-xs">
          <Info className="w-4.5 h-4.5 text-indigo-400 dark:text-indigo-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
