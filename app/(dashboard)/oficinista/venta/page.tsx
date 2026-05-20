"use client";

import { useState, useEffect } from "react";
import { 
  Ticket, 
  User, 
  CreditCard, 
  Bus, 
  Calculator, 
  UserCheck,
  AlertCircle,
  CheckCircle2,
  MapPin,
  QrCode,
  Printer,
  X
} from "lucide-react";

// Interfaces basadas en la API de Sandro
interface AsientoMap {
  id: string;
  numero: number;
  etiqueta: string;
  fila: number;
  posicion: string;
  categoria: string;
  precioBase: number;
  ocupado: boolean;
}

interface RutaDetalle {
  id: string;
  fecha: string;
  origen: string;
  destino: string;
  hora: string;
}

interface RutaDisponible {
  id: string;
  origen: string;
  destino: string;
  hora: string;
  fecha: string;
}

export default function VentaOficinistaPage() {
  const [session, setSession] = useState<any>(null);
  
  // 1. Estados de Selección de Viaje
  const [rutas, setRutas] = useState<RutaDisponible[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<string>("");
  const [rutaInfo, setRutaInfo] = useState<RutaDetalle | null>(null);
  const [loadingRutas, setLoadingRutas] = useState(true);

  // 2. Estados del Mapa de Asientos (API de Sandro)
  const [asientos, setAsientos] = useState<AsientoMap[]>([]);
  const [loadingAsientos, setLoadingAsientos] = useState(false);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<AsientoMap | null>(null);

  // 3. Estados del Pasajero y Formulario
  const [pasajeroNombre, setPasajeroNombre] = useState("");
  const [pasajeroCedula, setPasajeroCedula] = useState("");
  const [tipoPasajero, setTipoPasajero] = useState<"NORMAL" | "MENOR_EDAD" | "TERCERA_EDAD" | "DISCAPACIDAD">("NORMAL");
  const [metodoPago, setMetodoPago] = useState<"TRANSFERENCIA" | "EFECTIVO">("EFECTIVO");
  
  // 4. Estados de Transacción y QR
  const [enviandoVenta, setEnviandoVenta] = useState(false);
  const [error, setError] = useState("");
  const [boletoExitoso, setBoletoExitoso] = useState<any>(null);

  // Inicialización: Cargar Sesión y Rutas Activas
  useEffect(() => {
    // Obtenemos la sesión nativamente para evitar bloqueos del compilador Turbopack o del Canvas
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data && data.user) setSession(data);
        else setSession({ user: { id: "oficinista-dev-123" } });
      })
      .catch(() => setSession({ user: { id: "oficinista-dev-123" } }));

    async function cargarRutas() {
      try {
        // Debes coordinar con el backend la existencia de este endpoint de rutas activas
        const res = await fetch("/api/rutas");
        if (!res.ok) throw new Error("No se encontraron rutas activas en el servidor.");
        const data = await res.json();
        setRutas(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Asegúrate de que el endpoint de rutas esté habilitado.");
        setRutas([]);
      } finally {
        setLoadingRutas(false);
      }
    }
    cargarRutas();
  }, []);

  // Cargar Mapa de Asientos cuando se selecciona una ruta (Consumo del GET /api/selector-asientos de Sandro)
  useEffect(() => {
    if (!rutaSeleccionada) {
      setAsientos([]);
      setAsientoSeleccionado(null);
      setRutaInfo(null);
      return;
    }

    async function cargarAsientos() {
      setLoadingAsientos(true);
      setError("");
      try {
        const res = await fetch(`/api/selector-asientos?rutaId=${rutaSeleccionada}`);
        if (!res.ok) throw new Error("No se pudo cargar el mapa de asientos. Verifica la ruta ID.");
        const data = await res.json();
        
        setAsientos(data.asientos || []);
        setRutaInfo(data.ruta);
        setAsientoSeleccionado(null); // Resetear asiento al cambiar de ruta
      } catch (err: any) {
        setError(err.message);
        setAsientos([]);
        setRutaInfo(null);
      } finally {
        setLoadingAsientos(false);
      }
    }
    cargarAsientos();
  }, [rutaSeleccionada]);

  // Cálculos de Tarifa en tiempo real
  const precioBase = asientoSeleccionado ? asientoSeleccionado.precioBase : 0;
  let porcentajeDescuento = 0;
  if (tipoPasajero === "TERCERA_EDAD" || tipoPasajero === "DISCAPACIDAD") porcentajeDescuento = 50;
  else if (tipoPasajero === "MENOR_EDAD") porcentajeDescuento = 25;
  
  const descuentoCalculado = (precioBase * porcentajeDescuento) / 100;
  const precioFinal = precioBase - descuentoCalculado;

  // Enviar Venta a la API (POST /api/ventas de Sandro)
  const handleVender = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rutaSeleccionada || !asientoSeleccionado || !rutaInfo) {
      setError("Debes seleccionar una ruta y un asiento libre.");
      return;
    }

    if (pasajeroCedula.length < 10) {
      setError("La cédula debe tener al menos 10 dígitos.");
      return;
    }

    setEnviandoVenta(true);

    try {
      // 1. Crear Boleto
      const payload = {
        rutaId: rutaSeleccionada,
        asientoId: asientoSeleccionado.id,
        vendidoPorId: session?.user?.id || "oficinista-123", // Fallback seguro
        pasajeroNombre: pasajeroNombre.trim(),
        pasajeroCedula: pasajeroCedula.trim(),
        tipoPasajero,
        origenTramo: rutaInfo.origen,
        destinoTramo: rutaInfo.destino,
        metodoPago
      };

      const resVenta = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const dataVenta = await resVenta.json();
      if (!resVenta.ok) throw new Error(dataVenta.error || "Error al registrar la venta.");

      // 2. Generar y Obtener QR (GET /api/boletos/[id]/qr)
      const boletoId = dataVenta.id;
      const resQr = await fetch(`/api/boletos/${boletoId}/qr`);
      const dataQr = await resQr.json();
      
      if (!resQr.ok) {
        console.warn("Boleto creado, pero falló la generación del QR.", dataQr.error);
        setBoletoExitoso({ ...dataVenta, qr: null });
      } else {
        setBoletoExitoso(dataQr); // dataQr trae { pasajero, asiento, qr (base64), etc }
      }

      // 3. Bloquear el asiento recién vendido en la UI
      setAsientos(prev => prev.map(a => a.id === asientoSeleccionado.id ? { ...a, ocupado: true } : a));
      
      // Limpiar formulario para la siguiente persona en la fila
      setPasajeroNombre("");
      setPasajeroCedula("");
      setAsientoSeleccionado(null);
      setTipoPasajero("NORMAL");

    } catch (err: any) {
      setError(err.message || "Error al procesar el pago y boleto.");
    } finally {
      setEnviandoVenta(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans relative">
      

      {/* Título de la vista */}
      <div className="flex items-center space-x-3 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div className="bg-emerald-600 p-2.5 rounded-xl text-white">
          <Ticket className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-950">Venta en Ventanilla</h2>
          <p className="text-xs text-slate-500 mt-0.5">Asignación de asientos y emisión de boletos presenciales.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start space-x-2.5 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* COLUMNA IZQUIERDA: Selector de Ruta y Mapa de Asientos (7 Columnas) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PASO 1: Selector de Rutas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <span className="bg-blue-100 text-blue-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">1</span>
              <span>Seleccionar Frecuencia</span>
            </h3>
            
            <select
              value={rutaSeleccionada}
              onChange={(e) => setRutaSeleccionada(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-slate-800 bg-slate-50/50"
              disabled={loadingRutas}
            >
              <option value="">-- Elige una ruta y horario disponible --</option>
              {rutas.map((ruta) => (
                <option key={ruta.id} value={ruta.id}>
                  {ruta.origen} ➔ {ruta.destino} | {ruta.fecha} | {ruta.hora}
                </option>
              ))}
            </select>
          </div>

          {/* PASO 2: Mapa de Asientos Interactivo */}
          <div className={`bg-white p-6 rounded-2xl border shadow-sm transition duration-300 ${!rutaSeleccionada ? 'opacity-50 pointer-events-none grayscale-[50%]' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">2</span>
                <span>Distribución del Autobús</span>
              </h3>
              
              {/* Leyenda Visual */}
              <div className="flex items-center space-x-3 text-[10px] font-bold uppercase text-slate-500">
                <span className="flex items-center"><span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-1"></span> Libre</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-slate-200 border border-slate-300 rounded mr-1"></span> Ocupado</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-emerald-500 border border-emerald-600 rounded mr-1"></span> Tu Selección</span>
              </div>
            </div>

            {loadingAsientos ? (
              <div className="py-12 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>
            ) : asientos.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">Selecciona una ruta para ver los asientos.</div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 max-w-sm mx-auto relative overflow-hidden">
                <div className="h-10 border-b-2 border-slate-300 mb-6 flex items-center justify-between px-3 text-slate-400 text-[10px] font-bold uppercase">
                  <span>Conductor 👨‍✈️</span>
                  <span>Puerta 🚪</span>
                </div>
                
                {/* Grilla de Asientos (4 columnas) */}
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto px-2 pb-2">
                  {asientos.map((asiento) => {
                    const isSelected = asientoSeleccionado?.id === asiento.id;
                    const isOccupied = asiento.ocupado;

                    return (
                      <button
                        key={asiento.id}
                        disabled={isOccupied}
                        onClick={() => setAsientoSeleccionado(asiento)}
                        title={`${asiento.etiqueta} - ${asiento.categoria} ($${asiento.precioBase})`}
                        className={`
                          aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all border-b-4 relative
                          ${isOccupied 
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' 
                            : isSelected 
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md transform -translate-y-1' 
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300'
                          }
                        `}
                      >
                        {/* Pequeño indicador de categoría */}
                        {!isOccupied && !isSelected && asiento.categoria.includes("VIP") && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        )}
                        <span>{asiento.etiqueta}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="absolute top-[64px] bottom-4 left-1/2 -translate-x-1/2 w-8 bg-slate-100/50 pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] rotate-90">Pasillo</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Datos del Pasajero y Checkout (5 Columnas) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleVender} className={`bg-white rounded-2xl border shadow-xl transition duration-300 overflow-hidden ${!asientoSeleccionado ? 'opacity-50 pointer-events-none grayscale-[50%] border-slate-200' : 'border-blue-200 shadow-blue-500/10'}`}>
            
            <div className="bg-slate-900 p-6 text-white">
              <h3 className="text-sm font-bold flex items-center space-x-2 border-b border-slate-700 pb-3 mb-4">
                <span className="bg-emerald-500 text-slate-900 h-6 w-6 rounded-full flex items-center justify-center text-xs">3</span>
                <span>Datos y Facturación</span>
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cédula del Pasajero</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="text" 
                      maxLength={13} 
                      required 
                      value={pasajeroCedula}
                      onChange={(e) => setPasajeroCedula(e.target.value.replace(/\D/g, ""))}
                      placeholder="1801234567"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombres Completos</label>
                  <input 
                    type="text" 
                    required 
                    value={pasajeroNombre}
                    onChange={(e) => setPasajeroNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo Tarifa</label>
                    <select 
                      value={tipoPasajero}
                      onChange={(e) => setTipoPasajero(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 text-white"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="MENOR_EDAD">Menor Edad (25%)</option>
                      <option value="TERCERA_EDAD">3ra Edad (50%)</option>
                      <option value="DISCAPACIDAD">Discap. (50%)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pago en Caja</label>
                    <select 
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 text-white"
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Liquidación Final */}
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Asiento Seleccionado:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{asientoSeleccionado?.etiqueta || "--"} ({asientoSeleccionado?.categoria || "--"})</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Tarifa Base:</span>
                <span className="font-mono">${precioBase.toFixed(2)}</span>
              </div>
              {porcentajeDescuento > 0 && (
                <div className="flex items-center justify-between text-sm text-amber-600">
                  <span className="font-medium">Descuento ({porcentajeDescuento}%):</span>
                  <span className="font-mono">-${descuentoCalculado.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-900">Total a Pagar:</span>
                <span className="text-3xl font-black text-emerald-600 font-mono">${precioFinal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={enviandoVenta || !asientoSeleccionado}
                className="w-full mt-4 h-12 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {enviandoVenta ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Cobrar y Emitir Boleto</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}