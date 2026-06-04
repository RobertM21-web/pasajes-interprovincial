"use client";

import { useState } from "react";

interface BoletoAbordaje {
  id: string;
  pasajeroNombre: string;
  pasajeroCedula: string;
  estado: string;
  abordado: boolean;
  fechaAbordaje: string | null;
  origenTramo: string;
  destinoTramo: string;
  asiento: {
    etiqueta: string;
    categoria: { nombre: string };
  };
  ruta: {
    fecha: string;
    frecuencia: { hora: string };
    bus: { numero: string; placa: string };
  };
}

export default function ValidarAbordajePage() {
  const [codigo, setCodigo] = useState("");
  const [boleto, setBoleto] = useState<BoletoAbordaje | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function consultarBoleto() {
    setLoading(true);
    setError("");
    setMessage("");
    setBoleto(null);

    try {
      const res = await fetch(`/api/abordaje?codigo=${encodeURIComponent(codigo)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo consultar boleto");
      setBoleto(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function registrarAbordaje() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/abordaje", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo registrar abordaje");
      setBoleto(data);
      setMessage("Abordaje registrado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validar Abordaje</h1>
        <p className="text-sm text-gray-600">Pega el ID del boleto o el contenido JSON leido del QR.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <label className="block text-sm font-semibold text-gray-700" htmlFor="codigo">
          Codigo del boleto
        </label>
        <textarea
          id="codigo"
          value={codigo}
          onChange={(event) => setCodigo(event.target.value)}
          placeholder='Ej: {"boletoId":"..."} o directamente el ID'
          rows={4}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !codigo.trim()}
            onClick={consultarBoleto}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Consultar
          </button>
          <button
            type="button"
            disabled={loading || !codigo.trim()}
            onClick={registrarAbordaje}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Registrar abordaje
          </button>
        </div>
      </div>

      {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {boleto && (
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{boleto.pasajeroNombre}</h2>
              <p className="text-sm text-gray-500">Cedula: {boleto.pasajeroCedula}</p>
              <p className="mt-3 text-sm text-gray-700">
                {boleto.origenTramo} {"->"} {boleto.destinoTramo}
              </p>
              <p className="text-sm text-gray-700">
                {new Date(boleto.ruta.fecha).toLocaleDateString()} {boleto.ruta.frecuencia.hora} | Bus {boleto.ruta.bus.numero} ({boleto.ruta.bus.placa})
              </p>
              <p className="text-sm text-gray-700">
                Asiento {boleto.asiento.etiqueta} ({boleto.asiento.categoria.nombre})
              </p>
            </div>
            <div className="space-y-2 text-left sm:text-right">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${boleto.estado === "PAGADO" ? "bg-blue-50 text-blue-700" : boleto.estado === "ABORDADO" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {boleto.estado}
              </span>
              <p className="text-xs text-gray-500">
                {boleto.abordado ? `Abordado: ${boleto.fechaAbordaje ? new Date(boleto.fechaAbordaje).toLocaleString() : "si"}` : "No abordado"}
              </p>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
