"use client";

import { useEffect, useState } from "react";

interface BoletoPago {
  id: string;
  pasajeroNombre: string;
  pasajeroCedula: string;
  tipoPasajero: string;
  precioBase: string | number;
  descuento: string | number;
  precioFinal: string | number;
  comprobanteUrl: string | null;
  metodoPago: string;
  origenTramo: string;
  destinoTramo: string;
  createdAt: string;
  asiento: {
    etiqueta: string;
    fila: string;
    posicion: string;
    categoria: { nombre: string };
  };
  ruta: {
    fecha: string;
    frecuencia: { hora: string };
    bus: { numero: string; placa: string };
  };
  usuario: {
    nombre: string;
    email: string;
  } | null;
}

export default function ValidarPagosPage() {
  const [boletos, setBoletos] = useState<BoletoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  async function loadPagos() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pagos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar pagos");
      setBoletos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPagos();
  }, []);

  async function validarPago(boletoId: string, aprobado: boolean) {
    if (!aprobado && !motivoRechazo.trim()) {
      setError("Debes escribir el motivo de rechazo.");
      return;
    }

    setSavingId(boletoId);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/pagos/${boletoId}/validar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aprobado,
          ...((!aprobado) && { motivoRechazo: motivoRechazo.trim() }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo validar el pago");
      if (aprobado) {
        setMessage(data.emailMessage || `Pago aprobado correctamente.${data.emailError ? ` ${data.emailError}` : ""}`);
      } else {
        setMessage("Pago rechazado y boleto cancelado.");
      }
      setRechazandoId(null);
      setMotivoRechazo("");
      await loadPagos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p className="text-gray-600">Cargando pagos pendientes...</p>;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validar Pagos</h1>
        <p className="text-sm text-gray-600">Aprueba o rechaza comprobantes pendientes.</p>
      </div>

      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {boletos.map((boleto) => (
          <article key={boleto.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">{boleto.pasajeroNombre}</h2>
                <p className="text-xs text-gray-500">CI: {boleto.pasajeroCedula}</p>
              </div>
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                PENDIENTE
              </span>
            </div>

            {/* Spec grid */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Ruta</p>
                <p className="font-semibold text-gray-900">{boleto.origenTramo} → {boleto.destinoTramo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Fecha y hora</p>
                <p className="font-semibold text-gray-900">
                  {new Date(boleto.ruta.fecha).toLocaleDateString("es-EC")} &middot; {boleto.ruta.frecuencia.hora}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Bus</p>
                <p className="font-semibold text-gray-900">
                  #{boleto.ruta.bus.numero} <span className="text-gray-500 font-normal">({boleto.ruta.bus.placa})</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Asiento</p>
                <p className="font-semibold text-gray-900">
                  {boleto.asiento.etiqueta} &middot; Fila {boleto.asiento.fila} {boleto.asiento.posicion}
                </p>
                <p className="text-xs text-gray-500">{boleto.asiento.categoria.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Tipo pasajero</p>
                <p className="font-semibold text-gray-900">{boleto.tipoPasajero.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Método de pago</p>
                <p className="font-semibold text-gray-900">{boleto.metodoPago.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Precio</p>
                <p className="font-semibold text-gray-900">
                  ${Number(boleto.precioFinal).toFixed(2)}
                  {Number(boleto.descuento) > 0 && (
                    <span className="ml-1 text-xs text-green-600">(-${Number(boleto.descuento).toFixed(2)})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Cliente</p>
                <p className="font-semibold text-gray-900 truncate">{boleto.usuario?.nombre || "—"}</p>
                <p className="text-xs text-gray-500 truncate">{boleto.usuario?.email || "venta sin usuario"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {boleto.comprobanteUrl && (
                  <a
                    href={boleto.comprobanteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Ver comprobante
                  </a>
                )}
                <button
                  type="button"
                  disabled={savingId === boleto.id}
                  onClick={() => validarPago(boleto.id, true)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {savingId === boleto.id ? "Procesando..." : "✓ Aprobar"}
                </button>
                <button
                  type="button"
                  disabled={savingId === boleto.id}
                  onClick={() => {
                    setRechazandoId(rechazandoId === boleto.id ? null : boleto.id);
                    setMotivoRechazo("");
                    setError("");
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  ✕ Rechazar
                </button>
              </div>
            </div>

            {rechazandoId === boleto.id && (
              <div className="border-t border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-semibold text-red-700 mb-2">Motivo del rechazo</p>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Escribe el motivo del rechazo... (el cliente verá este mensaje)"
                  rows={3}
                  className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    disabled={savingId === boleto.id}
                    onClick={() => validarPago(boleto.id, false)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {savingId === boleto.id ? "Procesando..." : "Confirmar rechazo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRechazandoId(null);
                      setMotivoRechazo("");
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}

        {boletos.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            No hay comprobantes pendientes.
          </div>
        )}
      </div>
    </section>
  );
}
