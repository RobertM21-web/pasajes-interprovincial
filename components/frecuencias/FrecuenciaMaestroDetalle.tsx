'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bus as BusIcon,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';

interface ParadaIntermedia {
  id: string;
  frecuenciaId: string;
  ciudad: string;
  orden: number;
  precioTramo: string | number;
  tiempoEstimado: number | null;
}

interface Asiento {
  id: string;
  etiqueta: string;
  numero: number;
  fila: number;
  posicion: string;
}

interface Frecuencia {
  id?: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  hora: string;
  resolucionAnt?: string | null;
  esDirecta: boolean;
  activa: boolean;
  paradasIntermedias?: ParadaIntermedia[];
  paradas?: ParadaIntermedia[];
}

interface CategoriaAsiento {
  id: string;
  busId?: string;
  nombre: string;
  precioBase: string | number;
  cantidad: number;
  descripcion?: string | null;
  asientos?: Asiento[];
}

interface Bus {
  id: string;
  numero: string;
  placa: string;
  fotografiaUrl?: string | null;
  marcaChasis?: string;
  marcaCarroceria?: string;
  totalAsientos: number;
  activo?: boolean;
  enTerminal?: boolean;
  categorias?: CategoriaAsiento[];
}

interface RutaAsignada {
  id: string;
  frecuenciaId: string;
  busId: string;
  fecha: string;
  estado: string;
  bus: Bus;
  boletosVendidos?: number;
}

interface FrecuenciaMaestroDetalleProps {
  frecuencias: Frecuencia[];
}

export default function FrecuenciaMaestroDetalle({ frecuencias }: FrecuenciaMaestroDetalleProps) {
  const [selectedFrecuencia, setSelectedFrecuencia] = useState<Frecuencia | null>(frecuencias[0] ?? null);
  const [searchTerm, setSearchTerm] = useState('');
  const [buses, setBuses] = useState<Bus[]>([]);
  const [rutaAsignada, setRutaAsignada] = useState<RutaAsignada | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [busesLoading, setBusesLoading] = useState(false);
  const [rutaLoading, setRutaLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (!selectedFrecuencia && frecuencias.length > 0) {
      setSelectedFrecuencia(frecuencias[0]);
    }
  }, [frecuencias, selectedFrecuencia]);

  const paradasOrdenadas = useMemo(() => {
    const paradas = selectedFrecuencia?.paradasIntermedias ?? selectedFrecuencia?.paradas ?? [];
    return [...paradas].sort((a, b) => a.orden - b.orden);
  }, [selectedFrecuencia]);

  const filteredFrecuencias = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return frecuencias;

    return frecuencias.filter((frec) => {
      const searchString = `${frec.ciudadOrigen} ${frec.ciudadDestino} ${frec.hora}`.toLowerCase();
      return searchString.includes(term);
    });
  }, [frecuencias, searchTerm]);

  const selectedBus = useMemo(() => {
    return buses.find((bus) => bus.id === selectedBusId) ?? null;
  }, [buses, selectedBusId]);

  const assignedCategorias = rutaAsignada?.bus?.categorias ?? [];
  const selectedCategorias = selectedBus?.categorias ?? [];

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchDetalle = useCallback(async (frecuenciaId: string) => {
    try {
      setRutaLoading(true);
      setBusesLoading(true);
      setSelectedBusId('');

      const [rutaRes, busesRes] = await Promise.all([
        fetch(`/api/frecuencias/${frecuenciaId}/ruta`),
        fetch(`/api/frecuencias/${frecuenciaId}/buses`),
      ]);

      if (!rutaRes.ok) {
        const data = await rutaRes.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo cargar la asignacion actual');
      }

      if (!busesRes.ok) {
        const data = await busesRes.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo cargar la lista de buses');
      }

      const rutaData = await rutaRes.json();
      const busesData = await busesRes.json();

      setRutaAsignada(rutaData);
      setBuses(busesData);
    } catch (error) {
      console.error('Error al cargar detalle de frecuencia:', error);
      setRutaAsignada(null);
      setBuses([]);
      showToast(error instanceof Error ? error.message : 'Error al cargar el detalle', 'error');
    } finally {
      setRutaLoading(false);
      setBusesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!selectedFrecuencia?.id) {
      setBuses([]);
      setRutaAsignada(null);
      return;
    }

    fetchDetalle(selectedFrecuencia.id);
  }, [fetchDetalle, selectedFrecuencia?.id]);

  const handleSelectFrecuencia = (frecuencia: Frecuencia) => {
    setSelectedFrecuencia(frecuencia);
  };

  const handleAsignarBus = async () => {
    if (!selectedFrecuencia?.id || !selectedBusId) {
      showToast('Selecciona un bus disponible para asignarlo', 'info');
      return;
    }

    try {
      setActionLoading(true);
      if (rutaAsignada) {
        const deleteRes = await fetch(`/api/frecuencias/${selectedFrecuencia.id}/ruta`, {
          method: 'DELETE',
        });

        const deleteData = await deleteRes.json().catch(() => ({}));
        if (!deleteRes.ok) {
          throw new Error(deleteData.error || 'No se pudo desasignar el bus actual');
        }
      }

      const res = await fetch(`/api/frecuencias/${selectedFrecuencia.id}/ruta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId: selectedBusId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo asignar el bus');
      }

      showToast(rutaAsignada ? 'Bus asignado cambiado correctamente' : 'Bus asignado correctamente', 'success');
      await fetchDetalle(selectedFrecuencia.id);
    } catch (error) {
      console.error('Error al asignar bus:', error);
      showToast(error instanceof Error ? error.message : 'No se pudo completar la asignacion', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDesasignarBus = async () => {
    if (!selectedFrecuencia?.id) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/frecuencias/${selectedFrecuencia.id}/ruta`, {
        method: 'DELETE',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo desasignar el bus');
      }

      showToast('Bus desasignado correctamente', 'success');
      await fetchDetalle(selectedFrecuencia.id);
    } catch (error) {
      console.error('Error al desasignar bus:', error);
      showToast(error instanceof Error ? error.message : 'No se pudo desasignar el bus', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const num = Number(price);
    return Number.isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getTotalCategoriaAsientos = (categoria: CategoriaAsiento) => {
    return categoria.asientos?.length ?? categoria.cantidad;
  };

  const getBaseNormalPrice = (categorias: CategoriaAsiento[]) => {
    const normal = categorias.find((cat) => cat.nombre.toLowerCase().includes('normal'));
    return Number(normal?.precioBase ?? categorias[0]?.precioBase ?? 0);
  };

  const getCategoriaPricing = (categoria: CategoriaAsiento, categorias: CategoriaAsiento[]) => {
    const basePrice = getBaseNormalPrice(categorias);
    const currentPrice = Number(categoria.precioBase);
    const percentage = basePrice > 0 ? currentPrice / basePrice : 1;

    return {
      basePrice,
      percentage,
      calculatedPrice: basePrice * percentage,
    };
  };

  const renderBusThumbnail = (bus: Bus, sizeClass = 'w-14 h-12') => {
    if (bus.fotografiaUrl) {
      return (
        <img
          src={bus.fotografiaUrl}
          alt={`Bus ${bus.numero}`}
          className={`${sizeClass} rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0`}
        />
      );
    }

    return (
      <div className={`${sizeClass} rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0`}>
        <ImageIcon className="w-5 h-5" />
      </div>
    );
  };

  const renderCategoriaResumen = (categoria: CategoriaAsiento, categorias: CategoriaAsiento[]) => {
    const pricing = getCategoriaPricing(categoria, categorias);
    const etiquetas = categoria.asientos?.map((asiento) => asiento.etiqueta).slice(0, 8) ?? [];
    const extraAsientos = Math.max(0, getTotalCategoriaAsientos(categoria) - etiquetas.length);

    return (
      <div
        key={categoria.id}
        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
      >
        <div className="flex justify-between items-start gap-3">
          <div>
            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{categoria.nombre}</p>
            <p className="text-[10px] text-slate-500">{getTotalCategoriaAsientos(categoria)} asientos</p>
            <p className="text-[10px] text-slate-500 mt-1">
              ${formatPrice(pricing.basePrice)} x {(pricing.percentage * 100).toFixed(0)}%
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded shrink-0">
            ${formatPrice(pricing.calculatedPrice)}
          </span>
        </div>

        {etiquetas.length > 0 ? (
          <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
            Asientos: {etiquetas.join(', ')}
            {extraAsientos > 0 ? ` +${extraAsientos}` : ''}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 w-full items-start">
      <div className="lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Frecuencias
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecciona una frecuencia para gestionar sus buses asignados.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar origen, destino o hora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all"
          />
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          {filteredFrecuencias.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No se encontraron frecuencias.
            </div>
          ) : (
            <div className="max-h-[500px] overflow-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="px-3 py-3">Origen</th>
                    <th className="px-3 py-3">Destino</th>
                    <th className="px-3 py-3">Hora</th>
                    <th className="px-3 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredFrecuencias.map((frec) => {
                    const isSelected = selectedFrecuencia?.id === frec.id;

                    return (
                      <tr
                        key={frec.id}
                        onClick={() => handleSelectFrecuencia(frec)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/30 ring-1 ring-inset ring-blue-500'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">{frec.ciudadOrigen}</td>
                        <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">{frec.ciudadDestino}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg font-semibold">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {frec.hora}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              frec.activa
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                            }`}
                          >
                            {frec.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
                <span>{selectedFrecuencia.ciudadOrigen}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>{selectedFrecuencia.ciudadDestino}</span>
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold text-lg bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  {selectedFrecuencia.hora}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Gestion de buses asignados para la operacion de hoy.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Paradas intermedias en orden
              </h3>

              {selectedFrecuencia.esDirecta ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm font-medium">
                  Esta frecuencia es directa, sin paradas intermedias.
                </div>
              ) : paradasOrdenadas.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl text-sm font-medium">
                  No hay paradas intermedias registradas para esta frecuencia.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/30">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="px-4 py-2 text-center w-12">Nro.</th>
                        <th className="px-4 py-2">Ciudad</th>
                        <th className="px-4 py-2">Precio tramo</th>
                        <th className="px-4 py-2">Tiempo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {paradasOrdenadas.map((parada) => (
                        <tr key={parada.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-2 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-500/5">
                            {parada.orden}
                          </td>
                          <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">
                            {parada.ciudad}
                          </td>
                          <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                            ${formatPrice(parada.precioTramo)} USD
                          </td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                            {parada.tiempoEstimado ? `${parada.tiempoEstimado} min` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BusIcon className="w-4 h-4 text-indigo-500" />
                Bus asignado
              </h3>

              {rutaLoading ? (
                <div className="flex items-center justify-center p-6 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Cargando bus asignado...
                </div>
              ) : rutaAsignada ? (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {renderBusThumbnail(rutaAsignada.bus, 'w-16 h-14')}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          Bus Nro. {rutaAsignada.bus.numero}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                          Placa: {rutaAsignada.bus.placa}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[11px] font-bold px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300">
                            {rutaAsignada.bus.totalAsientos} asientos
                          </span>
                          <span className="text-[11px] font-bold px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300">
                            {rutaAsignada.boletosVendidos ?? 0} boletos vendidos
                          </span>
                          <span className="text-[11px] font-bold px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300">
                            {formatDate(rutaAsignada.fecha)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDesasignarBus}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 transition-all bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Desasignar
                    </button>
                  </div>

                  {assignedCategorias.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                      {assignedCategorias.map((cat) => (
                        renderCategoriaResumen(cat, assignedCategorias)
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500" />
                  No hay bus asignado para esta frecuencia hoy.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Asignar bus disponible
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
                    const isBusSelected = selectedBusId === bus.id;
                    const isAssignedBus = rutaAsignada?.busId === bus.id;

                    return (
                      <button
                        key={bus.id}
                        type="button"
                        onClick={() => setSelectedBusId(isBusSelected ? '' : bus.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                          isBusSelected
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {renderBusThumbnail(bus)}
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                                Bus Nro. {bus.numero}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                Placa: {bus.placa}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                              {bus.totalAsientos} asientos
                            </span>
                            {isAssignedBus ? (
                              <span className="block mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Asignado
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedBus ? (
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Asientos - Bus Nro. {selectedBus.numero}
                  </h4>

                  {selectedCategorias.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Este bus no tiene categorias de asientos configuradas.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedCategorias.map((cat) => (
                        renderCategoriaResumen(cat, selectedCategorias)
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                La asignacion se registra para la fecha actual.
              </p>
              <button
                type="button"
                onClick={handleAsignarBus}
                disabled={actionLoading || !selectedBusId || rutaAsignada?.busId === selectedBusId}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {rutaAsignada ? 'Cambiar bus asignado' : 'Asignar bus a frecuencia'}
              </button>
            </div>
          </div>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-800 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-300 font-medium text-xs max-w-sm">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 dark:text-indigo-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
