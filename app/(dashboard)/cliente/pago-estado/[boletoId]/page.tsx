"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

type PagoEstadoResponse = {
  id: string;
  estado: string;
  motivoRechazo?: string | null;
  codigoQr?: string | null;
  pasajeroNombre?: string | null;
  origenTramo?: string | null;
  destinoTramo?: string | null;
  precioFinal?: number | null;
  ruta?: {
    fecha?: string | null;
    frecuencia?: { hora?: string | null } | null;
  } | null;
  asiento?: { etiqueta?: string | null } | null;
};

export default function PagoEstadoPage({ params }: { params: Promise<{ boletoId: string }> }) {
  const { boletoId } = use(params);
  const router = useRouter();
  const [boleto, setBoleto] = useState<PagoEstadoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval>;

    async function fetchEstado() {
      try {
        const response = await fetch(`/api/pagos/estado/${boletoId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudo obtener el estado del pago");
        }

        if (!isMounted) return;
        setBoleto(data);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Ocurrió un error al consultar el estado del pago");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    fetchEstado();
    intervalId = setInterval(fetchEstado, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [boletoId]);

  const estado = boleto?.estado;
  const esPendiente = estado === "PENDIENTE";
  const esPagado = estado === "PAGADO";
  const esCancelado = estado === "CANCELADO";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Estado del pago</h1>

        {loading ? (
          <div className="rounded-xl border border-[var(--border)] bg-gray-50 p-6 text-center text-gray-600 shadow-sm">
            Consultando el estado del pago...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
            {error}
          </div>
        ) : !boleto ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
            No se encontró el boleto solicitado.
          </div>
        ) : (
          <div className="space-y-6">
            {esPendiente && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">⌛</div>
                <h2 className="text-xl font-semibold text-amber-700">Pago en revisión</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  El comprobante se está evaluando. Vuelve a consultar esta página en unos segundos.
                </p>
              </div>
            )}

            {esPagado && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-xl font-semibold text-emerald-700">Pago aprobado</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Tu boleto está listo. Ya puedes visualizarlo y descargarlo.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/cliente/boletos/${boletoId}`)}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
                >
                  Ver boleto
                </button>
              </div>
            )}

            {esCancelado && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">❌</div>
                <h2 className="text-xl font-semibold text-red-700">Pago rechazado</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  El pago fue rechazado por el oficinista.
                </p>
                {boleto.motivoRechazo ? (
                  <p className="mt-3 rounded-xl bg-white p-4 text-left text-sm text-[var(--text-primary)] shadow-sm">
                    <span className="font-semibold">Motivo:</span> {boleto.motivoRechazo}
                  </p>
                ) : null}
              </div>
            )}

            <div className="rounded-xl border border-[var(--border)] bg-gray-50 p-5 text-sm text-[var(--text-muted)] shadow-sm">
              <p className="font-semibold text-[var(--text-primary)]">Detalle del boleto</p>
              <p className="mt-2">Pasajero: {boleto.pasajeroNombre || 'No disponible'}</p>
              <p>Ruta: {boleto.origenTramo || '---'} → {boleto.destinoTramo || '---'}</p>
              <p>Asiento: {boleto.asiento?.etiqueta || '---'}</p>
              <p>Fecha: {boleto.ruta?.fecha || '---'} {boleto.ruta?.frecuencia?.hora ? `| ${boleto.ruta?.frecuencia?.hora}` : ''}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
