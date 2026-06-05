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

  async function continuarCompra() {
    if (!selectedSeatData || !ruta) return;

    setSubmitting(true);
    setError(null);

    try {
      const requiereComprobante = metodoPago === "TRANSFERENCIA" || metodoPago === "DEPOSITO";
      if (requiereComprobante && !comprobanteUrl.trim()) {
        throw new Error("Ingresa la URL del comprobante de pago");
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
          throw new Error(pagoData?.error || "El boleto se creo, pero no se pudo subir el comprobante");
        }
      }

      router.push(`/cliente/boletos/${data.id}`);
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
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Selecciona tu asiento
      </h2>
      {(tipoPasajero || precioFinal) && (
        <p className="mb-5 text-center text-sm text-gray-600">
          Tarifa: <span className="font-semibold">{tipoPasajero || "Normal"}</span>
          {precioFinal ? <span> | Precio calculado: <strong>${Number(precioFinal).toFixed(2)}</strong></span> : null}
        </p>
      )}

      {/* Selector de Piso */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => cambiarPiso(1)}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            floor === 1 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Piso 1
        </button>
        <button
          onClick={() => cambiarPiso(2)}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            floor === 2 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Piso 2
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <div className="w-32 h-10 bg-gray-300 rounded-t-3xl flex items-center justify-center text-sm font-medium text-gray-700">
          Conductor
        </div>
      </div>

      {/* Renderizado de filas del autobús */}
      <div className="max-w-sm mx-auto bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-inner">
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

                let seatStyle = "";

                if (seat.ocupado) {
                  seatStyle = "bg-red-400 text-white cursor-not-allowed opacity-70";
                } else if (isSelected) {
                  seatStyle = "bg-gray-500 text-white scale-105 ring-2 ring-gray-700";
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
                  disabled={seat.ocupado}
                  onClick={() => setSelectedSeat(seat.id)}
                  className={`group relative h-12 w-full rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${seatStyle}`}
                  
                >
                  <div className="flex items-center gap-0.5">
                    <span>{seat.etiqueta}</span>
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
              <div key={`fila-${filaNum}`} className="grid grid-cols-5 gap-2 items-center">
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
      <div className="flex flex-wrap gap-4 mt-6 justify-center text-xs text-gray-600">
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
        <div className="mt-6 max-w-sm mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <p className="text-base font-medium text-gray-800">
            Asiento seleccionado:
            <span className="ml-2 text-amber-600 font-bold">{selectedSeatData.etiqueta}</span>
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Categoría: <span className="font-semibold uppercase text-purple-700">{selectedSeatData.categoria}</span>
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Precio de este asiento: <span className="font-bold text-gray-900">${Number(selectedSeatData.precioBase).toFixed(2)}</span>
          </p>
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
                <label className="block text-xs font-semibold text-gray-600" htmlFor="comprobanteUrl">
                  URL del comprobante
                </label>
                <input
                  id="comprobanteUrl"
                  value={comprobanteUrl}
                  onChange={(event) => setComprobanteUrl(event.target.value)}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-500"
                  placeholder="https://..."
                />
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
