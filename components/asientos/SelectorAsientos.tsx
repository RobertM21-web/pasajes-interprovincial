"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Seat = {
  id: string;
  numero: number;
  fila: number;
  posicion: number;
  etiqueta: string; // Ej: "1A", "1B", "2A"
  categoria: string; // "NORMAL", "VIP", "DISCAPACIDAD", etc.
  precioBase: number; // Precio real de la BD
  ocupado: boolean;
};

type RutaSelector = {
  id: string;
  fecha: string;
  origen: string;
  destino: string;
  hora: string;
};

function normalizeTipoPasajero(value?: string): string {
  switch (value) {
    case "Menor de edad":
      return "MENOR_EDAD";
    case "Tercera edad":
      return "TERCERA_EDAD";
    case "Discapacitado":
      return "DISCAPACIDAD";
    default:
      return "NORMAL";
  }
}

function formatCategoria(categoria?: string): string {
  if (!categoria) return "Normal";

  switch (categoria.toUpperCase()) {
    case "NORMAL":
      return "Normal";
    case "VIP":
      return "VIP";
    case "DISCAPACIDAD":
      return "Discapacidad";
    case "TERCERA_EDAD":
      return "Tercera Edad";
    case "MENOR_EDAD":
      return "Menor de Edad";
    default:
      return categoria;
  }
}

function seatMatchesPassengerType(seatCategory?: string, tipoPasajero?: string): boolean {
  const categoria = seatCategory?.toUpperCase() || "";
  const tipo = normalizeTipoPasajero(tipoPasajero);

  if (tipo === "DISCAPACIDAD") return categoria.includes("DISCAPACIDAD");
  if (tipo === "TERCERA_EDAD") return categoria.includes("TERCERA");
  if (tipo === "MENOR_EDAD") return categoria.includes("MENOR");

  return categoria.includes("NORMAL") || categoria.includes("VIP");
}

export default function SelectorAsientos({
  rutaId,
  tipoPasajero,
  precioFinal,
}: {
  rutaId: string;
  tipoPasajero?: string;
  precioFinal?: string;
}) {
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [ruta, setRuta] = useState<RutaSelector | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [floor, setFloor] = useState<number>(1);
  const [pasajeroNombre, setPasajeroNombre] = useState("");
  const [pasajeroCedula, setPasajeroCedula] = useState("");
  const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA");
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [comprobanteFileName, setComprobanteFileName] = useState<string | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);
  const [configuracion, setConfiguracion] = useState<{
    nombreBanco?: string | null;
    numeroCuenta?: string | null;
    titularCuenta?: string | null;
    rucCooperativa?: string | null;
  } | null>(null);

  useEffect(() => {
    async function cargarAsientos() {
      try {
        setLoading(true);
        const response = await fetch(`/api/selector-asientos?rutaId=${encodeURIComponent(rutaId)}`);
        
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || data?.detalle || "No se pudo obtener el mapa de asientos");
        }
        
        const data = await response.json();
        setSeats(data.asientos || []);
        setRuta(data.ruta || null);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    }

    if (rutaId) {
      cargarAsientos();
    }
  }, [rutaId]);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const response = await fetch('/api/configuracion');
        if (!response.ok) {
          throw new Error('No se pudo obtener la configuración bancaria');
        }
        const payload = await response.json();
        setConfiguracion(payload?.data || null);
      } catch (err) {
        setConfiguracion(null);
      }
    }

    cargarConfiguracion();
  }, []);

  const cambiarPiso = (numeroPiso: number) => {
    setFloor(numeroPiso);
    setSelectedSeat(null);
  };

  // Filtrar asientos por piso basándonos en el número dentro de la etiqueta
  const filteredSeats = seats.filter((seat) => {
    const textoEtiqueta = seat.etiqueta || "";
    const numeroFila = parseInt(textoEtiqueta.replace(/[^0-9]/g, "")) || 1;
    
    if (floor === 1) return numeroFila <= 10;
    return numeroFila > 10;
  });

  // Agrupar los asientos por número de fila extraído
  const rowsMap: { [key: number]: Seat[] } = {};
  filteredSeats.forEach((seat) => {
    const textoEtiqueta = seat.etiqueta || "";
    const filaNum = parseInt(textoEtiqueta.replace(/[^0-9]/g, "")) || 1;
    
    if (!rowsMap[filaNum]) {
      rowsMap[filaNum] = [];
    }
    rowsMap[filaNum].push(seat);
  });

  const sortedRows = Object.keys(rowsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const selectedSeatData = seats.find((seat) => seat.id === selectedSeat);
  const selectedCount = selectedSeatData ? 1 : 0;
  const totalPagar = selectedSeatData ? Number(selectedSeatData.precioBase) : 0;
  async function continuarCompra() {
    if (!selectedSeatData || !ruta) return;

    setSubmitting(true);
    setError(null);

    try {
      const requiereComprobante = metodoPago === "TRANSFERENCIA" || metodoPago === "DEPOSITO";
      if (requiereComprobante && !comprobanteUrl.trim()) {
        throw new Error("Sube el comprobante de pago para continuar");
      }

      const response = await fetch("/api/boletos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rutaId,
          asientoId: selectedSeatData.id,
          pasajeroNombre: pasajeroNombre.trim(),
          pasajeroCedula: pasajeroCedula.trim(),
          tipoPasajero: normalizeTipoPasajero(tipoPasajero),
          origenTramo: ruta.origen,
          destinoTramo: ruta.destino,
          metodoPago,
          canalVenta: "ONLINE",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el boleto");
      }

      if (comprobanteUrl.trim()) {
        const pagoResponse = await fetch("/api/pagos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boletoId: data.id,
            comprobanteUrl: comprobanteUrl.trim(),
            metodoPago,
          }),
        });
        const pagoData = await pagoResponse.json().catch(() => null);
        if (!pagoResponse.ok) {
          throw new Error(pagoData?.error || "El boleto se creó, pero no se pudo subir el comprobante");
        }
      }

      if (comprobanteUrl.trim()) {
        router.push(`/cliente/pago-estado/${data.id}`);
      } else {
        router.push(`/cliente/boletos/${data.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al continuar la compra");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow text-center text-gray-700 font-medium animate-pulse">
        Cargando mapa de asientos dinámico desde la base de datos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow text-center text-red-600 font-semibold">
        Error al procesar la solicitud: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-black">
        Selecciona tu asiento
      </h2>
      {(tipoPasajero || precioFinal) && (
        <p className="mb-5 text-center text-sm text-gray-600">
          Tarifa: <span className="font-semibold">{tipoPasajero || "Normal"}</span>
          {precioFinal ? <span> | Precio calculado: <strong>${Number(precioFinal).toFixed(2)}</strong></span> : null}
        </p>
      )}

      {/* Selector de Piso */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          onClick={() => cambiarPiso(1)}
          className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-semibold transition-all ${
            floor === 1 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Piso 1
        </button>
        <button
          onClick={() => cambiarPiso(2)}
          className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-semibold transition-all ${
            floor === 2 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Piso 2
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <div className="w-24 sm:w-32 h-10 bg-gray-300 rounded-t-3xl flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700">
          Conductor
        </div>
      </div>

      {/* Renderizado de filas del autobús */}
      <div className="w-full max-w-sm mx-auto bg-gray-50 border border-gray-200 rounded-3xl p-3 sm:p-6 shadow-inner overflow-x-auto">
        <div className="flex flex-col gap-3">
          {sortedRows.map((filaNum) => {
            const asientosDeFila = rowsMap[filaNum];

            // Filtramos las posiciones de los asientos según la letra final de la etiqueta
            const asientoA = asientosDeFila.find((s) => (s.etiqueta || "").toUpperCase().endsWith("A"));
            const asientoB = asientosDeFila.find((s) => (s.etiqueta || "").toUpperCase().endsWith("B"));
            const asientoC = asientosDeFila.find((s) => (s.etiqueta || "").toUpperCase().endsWith("C"));
            const asientoD = asientosDeFila.find((s) => (s.etiqueta || "").toUpperCase().endsWith("D"));

            const renderButton = (seat?: Seat) => {
              if (!seat) return <div className="h-12 w-full" />;

              const isSelected = selectedSeat === seat.id;
              const nombreCat = seat.categoria?.toLowerCase() || "";
              
              const cat = seat.categoria?.toUpperCase() || "";

              const isAllowed = seatMatchesPassengerType(seat.categoria, tipoPasajero);

                let seatStyle = "";

                  if (seat.ocupado) {
                    seatStyle = "bg-red-400 text-white cursor-not-allowed opacity-70";
                  } else if (!isAllowed) {
                    seatStyle = "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-70";
                  } else if (isSelected) {
                    seatStyle = "bg-gray-500 text-white scale-105 ring-2 ring-green-600 border-2 border-green-500";
                  } else if (cat.includes("VIP")) {
                    seatStyle = "bg-yellow-400 text-yellow-900 border border-yellow-500 hover:bg-yellow-300";
                  } else if (cat.includes("DISCAPACIDAD")) {
                    seatStyle = "bg-blue-400 text-white border border-blue-500 hover:bg-blue-300";
                  } else if (cat.includes("TERCERA")) {
                    seatStyle = "bg-purple-400 text-white border border-purple-500 hover:bg-purple-300";
                  } else if (cat.includes("MENOR")) {
                    seatStyle = "bg-orange-400 text-white border border-orange-500 hover:bg-orange-300";
                  } else {
                    seatStyle = "bg-green-400 text-white border border-green-500 hover:bg-green-300";
                  }

                  return (
                    <button
                      key={seat.id}
                      disabled={seat.ocupado || !isAllowed}
                      onClick={() => {
                        if (!seat.ocupado && isAllowed) {
                          setSelectedSeat((prev) => (prev === seat.id ? null : seat.id));
                        }
                      }}
                      className={`group relative h-11 sm:h-12 w-full rounded-xl font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center transition-all ${seatStyle}`}
                    >
                  <div className="flex items-center gap-0.5">
                    <span>{seat.etiqueta}</span>
                    {isSelected && (
                      <span className="text-[8px] px-1 bg-green-600 text-white rounded-full font-extrabold">
                        ✓
                      </span>
                    )}
                    {cat.includes("VIP") && (
                      <span className="text-[7px] px-0.5 bg-yellow-700 text-white rounded font-extrabold">V</span>
                    )}
                    {cat.includes("DISCAPACIDAD") && (
                      <span className="text-[7px] px-0.5 bg-blue-700 text-white rounded font-extrabold">D</span>
                    )}
                    {cat.includes("TERCERA") && (
                      <span className="text-[7px] px-0.5 bg-purple-700 text-white rounded font-extrabold">T</span>
                    )}
                    {cat.includes("MENOR") && (
                      <span className="text-[7px] px-0.5 bg-orange-700 text-white rounded font-extrabold">M</span>
                    )}
                  </div>
                  <span className="text-[9px] font-normal opacity-85">
                    ${Number(seat.precioBase).toFixed(2)}
                  </span>
                  {!seat.ocupado && (
                    <div className="pointer-events-none absolute -top-16 left-1/2 z-20 hidden w-32 -translate-x-1/2 rounded-lg bg-gray-900 px-2 py-1.5 text-[10px] font-medium text-white shadow-lg group-hover:block">
                      <p className="font-bold">{seat.etiqueta}</p>
                      <p>{formatCategoria(seat.categoria)}</p>
                      <p>${Number(seat.precioBase).toFixed(2)}</p>
                    </div>
                  )}
                </button>
              );
            };

            return (
              <div key={`fila-${filaNum}`} className="grid grid-cols-5 gap-1 sm:gap-2 items-center min-w-[260px]">
                {renderButton(asientoA)}
                {renderButton(asientoB)}

                {/* Pasillo central */}
                <div className="w-full text-center text-xs text-gray-300 font-bold select-none">
                  ||
                </div>

                {renderButton(asientoC)}
                {renderButton(asientoD)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda Dinámica */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mt-6 justify-center text-[10px] sm:text-xs text-gray-600">
  <div className="flex items-center gap-1.5">
    <div className="w-3.5 h-3.5 rounded bg-green-400" />
    Normal
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3.5 h-3.5 rounded bg-yellow-400" />
    VIP
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3.5 h-3.5 rounded bg-blue-400" />
    Discapacidad
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3.5 h-3.5 rounded bg-purple-400" />
    Tercera Edad
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3.5 h-3.5 rounded bg-orange-400" />
    Menor de Edad
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3.5 h-3.5 rounded bg-gray-500" />
    Seleccionado
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3.5 h-3.5 rounded bg-red-400" />
    Ocupado
  </div>
</div>

      {/* Panel Informativo de Selección */}
      {selectedSeatData && (
        <div className="mt-6 max-w-sm mx-auto bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 mb-2">
            Asientos seleccionados: {selectedCount}
          </p>
          <p className="text-base font-medium text-gray-800">
            Asiento seleccionado:
            <span className="ml-2 text-amber-600 font-bold">{selectedSeatData.etiqueta}</span>
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Categoría: <span className="font-semibold uppercase text-purple-700">{selectedSeatData.categoria}</span>
          </p>
          <div className="mt-3 rounded-lg bg-white border border-amber-100 p-3 space-y-1">
            <p className="text-xs text-gray-600 flex justify-between">
              <span>Precio del asiento</span>
              <span className="font-semibold text-gray-900">
                ${Number(selectedSeatData.precioBase).toFixed(2)}
              </span>
            </p>
            <p className="text-sm font-bold text-gray-900 flex justify-between border-t border-amber-100 pt-2 mt-2">
              <span>Total a pagar</span>
              <span className="text-amber-600">${totalPagar.toFixed(2)}</span>
            </p>
          </div>
          <div className="mt-4 space-y-3 text-left">
            <label className="block text-xs font-semibold text-gray-600" htmlFor="pasajeroNombre">
              Nombre del pasajero
            </label>
            <input
              id="pasajeroNombre"
              value={pasajeroNombre}
              onChange={(event) => setPasajeroNombre(event.target.value)}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-500"
              placeholder="Nombre completo"
            />
            <label className="block text-xs font-semibold text-gray-600" htmlFor="pasajeroCedula">
              Cedula del pasajero
            </label>
            <input
              id="pasajeroCedula"
              value={pasajeroCedula}
              onChange={(event) => setPasajeroCedula(event.target.value)}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-500"
              placeholder="Cedula o identificacion"
              maxLength={13}
            />
            <label className="block text-xs font-semibold text-gray-600" htmlFor="metodoPago">
              Metodo de pago
            </label>
            <select
              id="metodoPago"
              value={metodoPago}
              onChange={(event) => setMetodoPago(event.target.value)}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-500"
            >
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="DEPOSITO">Deposito</option>
              <option value="PAYPAL">PayPal</option>
            </select>
            {(metodoPago === "TRANSFERENCIA" || metodoPago === "DEPOSITO") && (
              <>
                <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm mb-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Realiza la transferencia por el valor total y sube el comprobante
                  </p>
                  {configuracion ? (
                    <div className="space-y-2 text-sm text-[var(--text-muted)]">
                      <p>
                        <span className="font-semibold text-black">Banco:</span> {configuracion.nombreBanco || 'Sin banco configurado'}
                      </p>
                      <p>
                        <span className="font-semibold text-black">Cuenta:</span> {configuracion.numeroCuenta || 'Sin número configurado'}
                      </p>
                      <p>
                        <span className="font-semibold text-black">Titular:</span> {configuracion.titularCuenta || 'Sin titular configurado'}
                      </p>
                      <p>
                        <span className="font-semibold text-black">RUC:</span> {configuracion.rucCooperativa || 'Sin RUC configurado'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">No se encontraron datos bancarios de la cooperativa.</p>
                  )}
                </div>

                <label className="block text-xs font-semibold text-gray-600" htmlFor="comprobanteFile">
                  Adjuntar comprobante (jpg, png, webp, pdf) máximo 5MB
                </label>
                <input
                  id="comprobanteFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;

                    const isValidType = [
                      'image/jpeg',
                      'image/png',
                      'image/webp',
                      'application/pdf',
                    ].includes(file.type);

                    if (!isValidType) {
                      setError('El comprobante debe ser JPG, PNG, WEBP o PDF');
                      setComprobanteUrl('');
                      setComprobanteFileName(null);
                      setComprobantePreview(null);
                      event.target.value = '';
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      setError('El comprobante no puede superar los 5MB');
                      setComprobanteUrl('');
                      setComprobanteFileName(null);
                      setComprobantePreview(null);
                      event.target.value = '';
                      return;
                    }

                    setError(null);
                    setComprobanteFileName(file.name);

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result;
                      if (typeof result === 'string') {
                        setComprobanteUrl(result);
                        if (file.type.startsWith('image/')) {
                          setComprobantePreview(result);
                        } else {
                          setComprobantePreview(null);
                        }
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-500"
                />

                {comprobanteFileName && (
                  <div className="mt-3 rounded-xl border border-[var(--border)] bg-gray-50 p-3 text-sm text-[var(--text-muted)] shadow-sm">
                    <p className="font-semibold text-[var(--text-primary)]">Archivo seleccionado:</p>
                    <p>{comprobanteFileName}</p>
                    {comprobantePreview ? (
                      <img
                        src={comprobantePreview}
                        alt="Vista previa del comprobante"
                        className="mt-3 max-h-48 w-full rounded-xl object-contain border border-gray-200"
                      />
                    ) : (
                      <p className="mt-2 text-[11px] text-gray-500">Vista previa disponible solo para imágenes.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            disabled={
              submitting ||
              !pasajeroNombre.trim() ||
              !pasajeroCedula.trim() ||
              ((metodoPago === "TRANSFERENCIA" || metodoPago === "DEPOSITO") && !comprobanteUrl.trim())
            }
            onClick={continuarCompra}
            className="mt-4 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Procesando..." : "Continuar compra"}
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-500">
            El oficinista revisara el comprobante antes de aprobar la compra.
          </p>
        </div>
      )}
    </div>
  );
}
