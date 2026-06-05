"use client";

import { use, FormEvent, useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Armchair, Users, Upload, Check } from "lucide-react";
import DatosTitular from "@/components/compra/DatosTitular";
import ListaAcompanantes from "@/components/compra/ListaAcompanantes";
import ResumenPasajeros from "@/components/compra/ResumenPasajeros";
import { validarCedulaEcuador } from "@/lib/validaciones/cedula";
import type { Pasajero, TipoPasajero } from "@/types/pasajero";

const titularInicial: Pasajero = {
  nombre: "",
  cedula: "",
  email: "",
  tipo: "ADULTO",
};

type Seat = {
  id: string;
  numero: number;
  etiqueta: string;
  fila: number;
  posicion: string;
  categoria: string;
  precioBase: number;
  ocupado: boolean;
};

type RutaSelector = {
  id: string;
  fecha: string;
  origen: string;
  destino: string;
  hora: string;
};

export default function CompraViajePage({
  params,
}: {
  params: Promise<{ viajeId: string }>;
}) {
  const { viajeId } = use(params);
  const router = useRouter();

  // Wizard state: 1 = Pasajeros, 2 = Asientos, 3 = Pago
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Paso 1: Estados de pasajeros
  const [titular, setTitular] = useState<Pasajero>(titularInicial);
  const [acompanantes, setAcompanantes] = useState<Pasajero[]>([]);
  const [error, setError] = useState("");

  // Paso 2: Estados de asientos
  const [seats, setSeats] = useState<Seat[]>([]);
  const [ruta, setRuta] = useState<RutaSelector | null>(null);
  const [cargandoAsientos, setCargandoAsientos] = useState(false);
  const [pisoSelector, setPisoSelector] = useState<number>(1);
  const [activePassengerId, setActivePassengerId] = useState<string>("titular");
  const [asignacionAsientos, setAsignacionAsientos] = useState<Record<string, Seat>>({}); // Map: idPasajero -> Seat

  // Paso 3: Estados de Pago
  const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA");
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [comprobanteFileName, setComprobanteFileName] = useState<string | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);
  const [emailEnvio, setEmailEnvio] = useState("");
  const [emailEnvioEditado, setEmailEnvioEditado] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [configuracion, setConfiguracion] = useState<{
    nombreBanco?: string | null;
    numeroCuenta?: string | null;
    titularCuenta?: string | null;
    rucCooperativa?: string | null;
  } | null>(null);

  // Lista unificada de todos los pasajeros
  const todosLosPasajeros = useMemo(() => {
    return [
      { ...titular, uniqueId: "titular", rolLabel: "Titular" },
      ...acompanantes.map((a, i) => ({
        ...a,
        uniqueId: String(a.id),
        rolLabel: `Acompañante ${i + 1}`,
      })),
    ];
  }, [titular, acompanantes]);

  // Cargar asientos al entrar al paso 2
  useEffect(() => {
    if (step !== 2) return;

    async function cargarAsientos() {
      setCargandoAsientos(true);
      setError("");
      try {
        const response = await fetch(`/api/selector-asientos?rutaId=${encodeURIComponent(viajeId)}`);
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || data?.detalle || "No se pudo obtener el mapa de asientos");
        }
        const data = await response.json();
        setSeats(data.asientos || []);
        setRuta(data.ruta || null);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor para asientos");
      } finally {
        setCargandoAsientos(false);
      }
    }

    cargarAsientos();
  }, [step, viajeId]);

  // Cargar configuracion bancaria al entrar al paso 3
  useEffect(() => {
    if (step !== 3) return;

    async function cargarConfiguracion() {
      try {
        const response = await fetch("/api/configuracion");
        if (!response.ok) throw new Error("No se pudo obtener la configuración bancaria");
        const payload = await response.json();
        setConfiguracion(payload?.data || null);
      } catch (err) {
        setConfiguracion(null);
      }
    }

    cargarConfiguracion();
  }, [step]);

  // Validaciones
  const validarCamposPasajero = (p: Pasajero) => {
    if (!p.nombre.trim() || !p.cedula.trim()) return false;
    if (!validarCedulaEcuador(p.cedula)) return false;
    if (p.email !== undefined && p.email.trim().length > 0 && !p.email.includes("@")) return false;

    // Si tiene descuento, validar beneficiario
    if (p.tipo !== "ADULTO") {
      if (!p.beneficiarioNombre?.trim() || !p.beneficiarioCedula?.trim()) return false;
      if (!validarCedulaEcuador(p.beneficiarioCedula)) return false;
      if (p.tipo === "DISCAPACIDAD" && !p.carnetDiscapacidad?.trim()) return false;
    }
    return true;
  };

  const formularioValido = useMemo(() => {
    return todosLosPasajeros.every((p) => validarCamposPasajero(p));
  }, [todosLosPasajeros]);

  const handleTitularChange = (nuevoTitular: Pasajero) => {
    setTitular(nuevoTitular);
    if (!emailEnvioEditado && nuevoTitular.email) {
      setEmailEnvio(nuevoTitular.email);
    }
  };

  // Manejo de clicks en el paso 1
  const continuarAAsientos = (event: FormEvent) => {
    event.preventDefault();
    if (!formularioValido) {
      setError("Revisa los datos de los pasajeros (cédulas y campos de descuento obligatorios) antes de continuar.");
      return;
    }
    setError("");
    setStep(2);
  };

  // Descuento en UI
  const getDescuentoPercentage = (tipo: TipoPasajero) => {
    if (tipo === "TERCERA_EDAD" || tipo === "DISCAPACIDAD") return 0.5;
    if (tipo === "MENOR_EDAD") return 0.25;
    return 0;
  };

  // Manejo de asignación de asiento
  const handleSelectSeat = (seat: Seat) => {
    if (seat.ocupado) return;

    // Verificar si el asiento ya está asignado a otro pasajero y removerlo
    const nuevoAsignacion = { ...asignacionAsientos };
    Object.keys(nuevoAsignacion).forEach((key) => {
      if (nuevoAsignacion[key].id === seat.id) {
        delete nuevoAsignacion[key];
      }
    });

    const activePassenger = todosLosPasajeros.find((p) => p.uniqueId === activePassengerId);
    if (!activePassenger) return;

    // ENFORZAR: Solo personas con discapacidad pueden seleccionar asientos preferenciales de discapacidad
    const isDiscapacidadSeat = seat.categoria.toLowerCase().includes("discapacidad");
    if (isDiscapacidadSeat && activePassenger.tipo !== "DISCAPACIDAD") {
      setError(`El asiento ${seat.etiqueta} es preferencial y solo puede ser seleccionado por pasajeros con discapacidad.`);
      return;
    }

    setError("");
    nuevoAsignacion[activePassengerId] = seat;
    setAsignacionAsientos(nuevoAsignacion);

    // Auto-activar el siguiente pasajero sin asiento para agilizar el flujo
    const siguientePasajeroSinAsiento = todosLosPasajeros.find(
      (p) => p.uniqueId !== activePassengerId && !nuevoAsignacion[p.uniqueId]
    );
    if (siguientePasajeroSinAsiento) {
      setActivePassengerId(siguientePasajeroSinAsiento.uniqueId);
    }
  };

  // Desasignar asiento
  const handleRemoveSeat = (passengerUniqueId: string) => {
    const nuevoAsignacion = { ...asignacionAsientos };
    delete nuevoAsignacion[passengerUniqueId];
    setAsignacionAsientos(nuevoAsignacion);
  };

  const todosAsientosAsignados = useMemo(() => {
    return todosLosPasajeros.every((p) => asignacionAsientos[p.uniqueId] !== undefined);
  }, [todosLosPasajeros, asignacionAsientos]);

  const emailEnvioValido = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEnvio.trim());
  }, [emailEnvio]);

  const precioTotalCompra = useMemo(() => {
    return todosLosPasajeros.reduce((total, p) => {
      const seat = asignacionAsientos[p.uniqueId];
      if (!seat) return total;
      const base = Number(seat.precioBase);
      const desc = getDescuentoPercentage(p.tipo);
      return total + base * (1 - desc);
    }, 0);
  }, [todosLosPasajeros, asignacionAsientos]);

  // Continuar al paso 3
  const continuarAPago = () => {
    if (!todosAsientosAsignados) {
      setError("Asigna un asiento a cada pasajero antes de continuar.");
      return;
    }
    setError("");
    setStep(3);
  };

  // Guardar compras atomically en transacción
  const confirmarCompraFinal = async () => {
    if (!todosAsientosAsignados || !ruta) return;

    setSubmitting(true);
    setError("");

    try {
      const requiereComprobante = metodoPago === "TRANSFERENCIA" || metodoPago === "DEPOSITO";
      if (requiereComprobante && !comprobanteUrl.trim()) {
        throw new Error("Sube el comprobante de pago para continuar.");
      }

      if (!emailEnvioValido) {
        throw new Error("Ingresa un email valido para recibir tus boletos.");
      }

      // Preparar payload transaccional (array de boletos)
      const payload = todosLosPasajeros.map((p) => {
        const seat = asignacionAsientos[p.uniqueId];
        return {
          rutaId: viajeId,
          asientoId: seat.id,
          pasajeroNombre: p.nombre.trim(),
          pasajeroCedula: p.cedula.trim(),
          tipoPasajero: p.tipo,
          origenTramo: ruta.origen,
          destinoTramo: ruta.destino,
          metodoPago,
          canalVenta: "ONLINE",
          emailEnvio: emailEnvio.trim().toLowerCase(),
        };
      });

      const response = await fetch("/api/boletos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo realizar la reserva");
      }

      const boletos = Array.isArray(data) ? data : [data];
      const primaryBoleto = boletos[0];

      // Si se subió comprobante, registrar el pago para cada boleto creado
      if (comprobanteUrl.trim()) {
        for (const boleto of boletos) {
          const pagoResponse = await fetch("/api/pagos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              boletoId: boleto.id,
              comprobanteUrl: comprobanteUrl.trim(),
              metodoPago,
            }),
          });
          const pagoData = await pagoResponse.json().catch(() => null);
          if (!pagoResponse.ok) {
            throw new Error(
              pagoData?.error || `Los boletos se crearon, pero falló el registro del comprobante para el asiento ${boleto.asiento?.etiqueta}`
            );
          }
        }
        router.push(`/cliente/pago-estado/${primaryBoleto.id}`);
      } else {
        router.push(`/cliente/boletos/${primaryBoleto.id}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al completar la compra.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrado de asientos por piso
  const sortedRows = useMemo(() => {
    const filtered = seats.filter((seat) => {
      const numeroFila = parseInt((seat.etiqueta || "").replace(/[^0-9]/g, "")) || 1;
      return pisoSelector === 1 ? numeroFila <= 10 : numeroFila > 10;
    });

    const rowsMap: Record<number, Seat[]> = {};
    filtered.forEach((seat) => {
      const numeroFila = parseInt((seat.etiqueta || "").replace(/[^0-9]/g, "")) || 1;
      if (!rowsMap[numeroFila]) rowsMap[numeroFila] = [];
      rowsMap[numeroFila].push(seat);
    });

    return Object.keys(rowsMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map((rowNum) => ({
        rowNum,
        seats: rowsMap[rowNum],
      }));
  }, [seats, pisoSelector]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Encabezado y Navegación del Wizard */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              onClick={() => {
                if (step > 1) {
                  setError("");
                  setStep((prev) => (prev - 1) as 1 | 2);
                } else {
                  router.back();
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Volver" : "Paso anterior"}
            </button>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Compra de Boleto</h1>
          </div>

          {/* Indicadores de Paso */}
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                step === 1
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <Users className="inline h-3.5 w-3.5 mr-1" />
              1. Pasajeros
            </span>
            <div className="h-0.5 w-6 bg-slate-300" />
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                step === 2
                  ? "bg-amber-500 text-white shadow-sm"
                  : step > 2
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <Armchair className="inline h-3.5 w-3.5 mr-1" />
              2. Asientos
            </span>
            <div className="h-0.5 w-6 bg-slate-300" />
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                step === 3
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <CreditCard className="inline h-3.5 w-3.5 mr-1" />
              3. Pago
            </span>
          </div>
        </div>

        {/* ERRORES GLOBALES */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm animate-pulse">
            {error}
          </div>
        )}

        {/* -------------------- STEP 1: FORMULARIO DE PASAJEROS -------------------- */}
        {step === 1 && (
          <form onSubmit={continuarAAsientos} className="flex flex-col gap-6">
            <DatosTitular value={titular} onChange={handleTitularChange} />

            <ListaAcompanantes value={acompanantes} onChange={setAcompanantes} />

            <ResumenPasajeros titular={titular} acompanantes={acompanantes} />

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!formularioValido}
                className="rounded-xl bg-amber-500 px-6 py-3.5 font-semibold text-white shadow transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar a selección de asientos
              </button>
            </div>
          </form>
        )}

        {/* -------------------- STEP 2: SELECTOR DE ASIENTOS MULTIPLE -------------------- */}
        {step === 2 && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Barra lateral: Asignación por pasajero */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  Asignar Asientos
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Selecciona un pasajero en la lista y haz clic en un asiento disponible del mapa para asignárselo.
                </p>

                <div className="space-y-3">
                  {todosLosPasajeros.map((p) => {
                    const isActive = activePassengerId === p.uniqueId;
                    const assignedSeat = asignacionAsientos[p.uniqueId];
                    const discount = getDescuentoPercentage(p.tipo);

                    return (
                      <div
                        key={p.uniqueId}
                        onClick={() => setActivePassengerId(p.uniqueId)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isActive
                            ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                              {p.rolLabel}
                            </p>
                            <p className="font-bold text-slate-900 mt-0.5 truncate max-w-[150px]">
                              {p.nombre || "Nombre pendiente"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Tarifa: {p.tipo} {discount > 0 && `(-${discount * 100}%)`}
                            </p>
                          </div>

                          <div>
                            {assignedSeat ? (
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-green-100 border border-green-300 px-3 py-1.5 text-xs font-extrabold text-green-800 shadow-sm flex items-center gap-1 animate-bounce">
                                  <Armchair className="h-3 w-3" />
                                  {assignedSeat.etiqueta}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSeat(p.uniqueId);
                                  }}
                                  className="text-[10px] font-bold text-red-500 hover:text-red-700 underline"
                                >
                                  Quitar
                                </button>
                              </div>
                            ) : (
                              <span className="rounded-lg bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 italic">
                                Por asignar
                              </span>
                            )}
                          </div>
                        </div>

                        {assignedSeat && (
                          <div className="mt-2.5 border-t border-dashed border-slate-200 pt-2 flex justify-between text-xs text-slate-600">
                            <span>Precio asiento:</span>
                            <span className="font-bold text-slate-900">
                              ${(Number(assignedSeat.precioBase) * (1 - discount)).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-800">Total calculado:</span>
                  <span className="text-xl font-extrabold text-amber-600">${precioTotalCompra.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  disabled={!todosAsientosAsignados}
                  onClick={continuarAPago}
                  className="mt-5 w-full rounded-xl bg-amber-500 py-3 font-semibold text-white shadow hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                  Continuar al pago
                </button>
              </div>
            </div>

            {/* Mapa interactivo de asientos */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 text-center">Croquis del Autobús</h2>

                {/* Alternador de piso */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPisoSelector(1)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      pisoSelector === 1 ? "bg-amber-500 text-white shadow" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    Piso 1
                  </button>
                  <button
                    onClick={() => setPisoSelector(2)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      pisoSelector === 2 ? "bg-amber-500 text-white shadow" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    Piso 2
                  </button>
                </div>
              </div>

              {cargandoAsientos ? (
                <div className="py-20 text-center text-sm font-medium text-slate-500 animate-pulse">
                  Cargando asientos de la ruta...
                </div>
              ) : (
                <div className="max-w-sm mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-inner">
                  {/* Conductor */}
                  <div className="flex justify-center mb-5">
                    <div className="w-28 h-8 bg-slate-300 rounded-t-2xl flex items-center justify-center text-xs font-semibold text-slate-600">
                      Conductor
                    </div>
                  </div>

                  {/* Filas */}
                  <div className="flex flex-col gap-3">
                    {sortedRows.map(({ rowNum, seats: rowSeats }) => {
                      const seatA = rowSeats.find((s) => (s.etiqueta || "").toUpperCase().endsWith("A"));
                      const seatB = rowSeats.find((s) => (s.etiqueta || "").toUpperCase().endsWith("B"));
                      const seatC = rowSeats.find((s) => (s.etiqueta || "").toUpperCase().endsWith("C"));
                      const seatD = rowSeats.find((s) => (s.etiqueta || "").toUpperCase().endsWith("D"));

                      const renderSeatButton = (seat?: Seat) => {
                        if (!seat) return <div className="h-11 w-full" />;

                        // Determinar si este asiento ya está seleccionado por ALGUIEN en esta compra
                        const selectedByPassengerUniqueId = Object.keys(asignacionAsientos).find(
                          (key) => asignacionAsientos[key].id === seat.id
                        );
                        const isSelectedByActive = selectedByPassengerUniqueId === activePassengerId;
                        const isSelectedByOther = selectedByPassengerUniqueId !== undefined && !isSelectedByActive;

                        const catLower = seat.categoria?.toLowerCase() || "";
                        const isVip = catLower.includes("vip");
                        const isDiscapacidad = catLower.includes("discapacidad") || catLower.includes("conci");

                        let seatStyle = "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-amber-50";

                        if (seat.ocupado) {
                          seatStyle = "bg-red-200 text-red-700 cursor-not-allowed opacity-60";
                        } else if (isSelectedByActive) {
                          seatStyle = "bg-amber-500 text-white scale-105 ring-2 ring-amber-600 font-extrabold shadow-md";
                        } else if (isSelectedByOther) {
                          seatStyle = "bg-green-500 text-white font-extrabold shadow";
                        } else if (isVip) {
                          seatStyle = "bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200";
                        } else if (isDiscapacidad) {
                          seatStyle = "bg-teal-100 text-teal-900 border border-teal-300 hover:bg-teal-200";
                        }

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            disabled={seat.ocupado}
                            onClick={() => handleSelectSeat(seat)}
                            className={`h-11 w-full rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${seatStyle}`}
                          >
                            <div className="flex items-center gap-0.5">
                              <span>{seat.etiqueta}</span>
                              {isVip && <span className="text-[7px] px-0.5 bg-purple-700 text-white rounded font-black">V</span>}
                              {isDiscapacidad && <span className="text-[7px] px-0.5 bg-teal-800 text-white rounded font-black">D</span>}
                            </div>
                            <span className="text-[9px] font-normal opacity-90">${Number(seat.precioBase).toFixed(2)}</span>
                          </button>
                        );
                      };

                      return (
                        <div key={`fila-${rowNum}`} className="grid grid-cols-5 gap-2 items-center">
                          {renderSeatButton(seatA)}
                          {renderSeatButton(seatB)}
                          <div className="w-full text-center text-[10px] text-slate-300 font-bold select-none">||</div>
                          {renderSeatButton(seatC)}
                          {renderSeatButton(seatD)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Leyenda */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center text-xs text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-50 border border-blue-200" />
                  Normal
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-purple-100 border border-purple-300" />
                  VIP
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-teal-100 border border-teal-300" />
                  Preferencial Discapacidad
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-600" />
                  Seleccionado Activo
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-green-500" />
                  Seleccionado Otro Acompañante
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-red-200" />
                  Ocupado
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- STEP 3: PAGO Y CONFIRMACION -------------------- */}
        {step === 3 && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Tabla resumen detallada de pasajeros y sus asientos */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Resumen Detallado de Viaje</h3>

                {ruta && (
                  <div className="mb-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 grid gap-2 md:grid-cols-3">
                    <p>
                      <span className="font-semibold text-slate-900">Trayecto:</span> {ruta.origen} → {ruta.destino}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Fecha:</span> {new Date(ruta.fecha).toLocaleDateString("es-EC", { dateStyle: "long" })}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Hora de salida:</span> {ruta.hora}
                    </p>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600 border-collapse">
                    <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-800 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Pasajero</th>
                        <th className="px-4 py-3">Identificación</th>
                        <th className="px-4 py-3 text-center">Asiento</th>
                        <th className="px-4 py-3 text-center">Tipo</th>
                        <th className="px-4 py-3 text-right">Valor Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {todosLosPasajeros.map((p) => {
                        const seat = asignacionAsientos[p.uniqueId];
                        const discount = getDescuentoPercentage(p.tipo);
                        const seatPrice = seat ? Number(seat.precioBase) : 0;
                        const finalPrice = seatPrice * (1 - discount);

                        return (
                          <tr key={p.uniqueId} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-900">
                              <div>{p.nombre}</div>
                              <div className="text-[10px] text-slate-400 font-normal capitalize">{p.rolLabel}</div>
                            </td>
                            <td className="px-4 py-3 font-mono">{p.cedula}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center gap-1 rounded bg-green-100 border border-green-200 px-2 py-0.5 text-xs font-extrabold text-green-800">
                                {seat?.etiqueta}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="text-xs font-medium">{p.tipo}</div>
                              {discount > 0 && (
                                <span className="rounded bg-amber-100 text-[9px] font-bold text-amber-800 px-1 py-0.5">
                                  -{discount * 100}% Desc
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                              ${finalPrice.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50 border-t-2 border-slate-300">
                        <td colSpan={4} className="px-4 py-4 font-extrabold text-slate-900 text-right">
                          Total a Pagar:
                        </td>
                        <td className="px-4 py-4 font-black text-amber-600 text-right text-lg">
                          ${precioTotalCompra.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Panel lateral: Metodo de pago */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-500" />
                  Método de Pago
                </h3>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-600" htmlFor="emailEnvio">
                    Email donde recibiras tus boletos
                  </label>
                  <input
                    id="emailEnvio"
                    type="email"
                    required
                    value={emailEnvio}
                    onChange={(event) => {
                      setEmailEnvioEditado(true);
                      setEmailEnvio(event.target.value);
                    }}
                    className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-amber-500 ${
                      emailEnvio.trim() && !emailEnvioValido ? "border-red-300" : "border-slate-200"
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                  {emailEnvio.trim() && !emailEnvioValido && (
                    <p className="text-xs font-medium text-red-600">Ingresa un correo electronico valido.</p>
                  )}

                  <label className="block text-xs font-semibold text-slate-600" htmlFor="metodoPago">
                    Selecciona cómo deseas pagar
                  </label>
                  <select
                    id="metodoPago"
                    value={metodoPago}
                    onChange={(event) => setMetodoPago(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-amber-500"
                  >
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="DEPOSITO">Depósito</option>
                    <option value="PAYPAL">PayPal</option>
                  </select>

                  {(metodoPago === "TRANSFERENCIA" || metodoPago === "DEPOSITO") && (
                    <div className="mt-4 space-y-4">
                      {/* Datos bancarios */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs text-slate-700">
                        <p className="font-bold text-amber-800 text-sm mb-2">Datos de la Cooperativa</p>
                        {configuracion ? (
                          <div className="space-y-1.5 font-medium">
                            <p>
                              <span className="font-bold text-slate-900">Banco:</span> {configuracion.nombreBanco || "Sin configurar"}
                            </p>
                            <p>
                              <span className="font-bold text-slate-900">Número de Cuenta:</span> {configuracion.numeroCuenta || "Sin configurar"}
                            </p>
                            <p>
                              <span className="font-bold text-slate-900">Beneficiario:</span> {configuracion.titularCuenta || "Sin configurar"}
                            </p>
                            <p>
                              <span className="font-bold text-slate-900">RUC:</span> {configuracion.rucCooperativa || "Sin configurar"}
                            </p>
                          </div>
                        ) : (
                          <p className="italic">No se han configurado datos de transferencia bancaria.</p>
                        )}
                      </div>

                      {/* Cargador del comprobante */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600" htmlFor="comprobanteFile">
                          Adjuntar foto/PDF del comprobante
                        </label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center p-4">
                          <input
                            id="comprobanteFile"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;

                              const isValidType = ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type);
                              if (!isValidType) {
                                setError("El comprobante debe ser JPG, PNG, WEBP o PDF.");
                                setComprobanteUrl("");
                                setComprobanteFileName(null);
                                setComprobantePreview(null);
                                return;
                              }

                              if (file.size > 5 * 1024 * 1024) {
                                setError("El archivo supera el tamaño máximo permitido de 5MB.");
                                setComprobanteUrl("");
                                setComprobanteFileName(null);
                                setComprobantePreview(null);
                                return;
                              }

                              setError("");
                              setComprobanteFileName(file.name);

                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const result = reader.result;
                                if (typeof result === "string") {
                                  setComprobanteUrl(result);
                                  if (file.type.startsWith("image/")) {
                                    setComprobantePreview(result);
                                  } else {
                                    setComprobantePreview(null);
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                          <span className="text-xs font-semibold text-slate-600 text-center">
                            {comprobanteFileName ? "Reemplazar archivo" : "Haz clic para subir"}
                          </span>
                          <span className="text-[10px] text-slate-400">JPG, PNG o PDF hasta 5MB</span>
                        </div>

                        {comprobanteFileName && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                            <p className="font-bold flex items-center gap-1 text-slate-900">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Archivo cargado:
                            </p>
                            <p className="truncate mt-1 text-slate-600 font-mono">{comprobanteFileName}</p>
                            {comprobantePreview && (
                              <img
                                src={comprobantePreview}
                                alt="Comprobante"
                                className="mt-3.5 max-h-40 w-full rounded-xl object-contain border border-slate-200 bg-white"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    submitting ||
                    !emailEnvioValido ||
                    ((metodoPago === "TRANSFERENCIA" || metodoPago === "DEPOSITO") && !comprobanteUrl.trim())
                  }
                  onClick={confirmarCompraFinal}
                  className="mt-6 w-full rounded-xl bg-amber-500 py-3.5 font-bold text-white shadow hover:bg-amber-600 transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    "Procesando compra..."
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Confirmar Compra
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[10px] text-slate-400 leading-normal">
                  Al confirmar la compra, tus asientos quedan reservados temporalmente mientras el oficinista verifica tu pago. Recibiras tus boletos en {emailEnvio || "tu correo"} cuando el pago sea aprobado.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

