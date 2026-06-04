"use client";

import { useEffect, useState } from "react";

interface BoletoPago {
  id: string;
  pasajeroNombre: string;
  pasajeroCedula: string;
  precioFinal: string | number;
  comprobanteUrl: string | null;
  metodoPago: string;
  origenTramo: string;
  destinoTramo: string;
  createdAt: string;
  asiento: {
    etiqueta: string;
    categoria: { nombre: string };
  };
  ruta: {
    fecha: string;
    frecuencia: { hora: string };
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
    setSavingId(boletoId);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/pagos/${boletoId}/validar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aprobado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo validar el pago");
      setMessage(aprobado ? "Pago aprobado correctamente." : "Pago rechazado y boleto cancelado.");
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

      {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4">
        {boletos.map((boleto) => (
          <article key={boleto.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{boleto.pasajeroNombre}</h2>
                  <p className="text-sm text-gray-500">Cedula: {boleto.pasajeroCedula}</p>
                </div>
                <p className="text-sm text-gray-700">
                  {boleto.origenTramo} {"->"} {boleto.destinoTramo} | {new Date(boleto.ruta.fecha).toLocaleDateString()} {boleto.ruta.frecuencia.hora}
                </p>
                <p className="text-sm text-gray-700">
                  Asiento {boleto.asiento.etiqueta} ({boleto.asiento.categoria.nombre}) | ${Number(boleto.precioFinal).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Metodo: {boleto.metodoPago} | Cliente: {boleto.usuario?.email || "venta sin usuario"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {boleto.comprobanteUrl && (
                  <a
                    href={boleto.comprobanteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Ver comprobante
                  </a>
                )}
                <button
                  type="button"
                  disabled={savingId === boleto.id}
                  onClick={() => validarPago(boleto.id, true)}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={savingId === boleto.id}
                  onClick={() => validarPago(boleto.id, false)}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Rechazar
                </button>
              </div>
            </div>
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
