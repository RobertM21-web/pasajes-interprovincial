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

        </div>


      </div>
    </div>
  );
}