"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioBase: number;
  cantidad: number;
  asientos: number;
  asientosConBoletos: number;
  bus: {
    id: string;
    numero: string;
    placa: string;
    activo: boolean;
  };
}

export default function CategoriasAsientoPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategorias() {
      try {
        const res = await fetch("/api/admin/categorias-asiento");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "No se pudieron cargar las categorias");
        setCategorias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    }

    loadCategorias();
  }, []);

  if (loading) return <p className="text-gray-600">Cargando categorias...</p>;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias de Asiento</h1>
          <p className="text-sm text-gray-600">Revisa las categorias configuradas por bus.</p>
        </div>
        <Link
          href="/admin/buses"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Gestionar en Buses
        </Link>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Bus</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Asientos</th>
              <th className="px-4 py-3">Usados</th>
              <th className="px-4 py-3">Estado bus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categorias.map((categoria) => (
              <tr key={categoria.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{categoria.nombre}</p>
                  <p className="text-xs text-gray-500">{categoria.descripcion || "Sin descripcion"}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  Bus {categoria.bus.numero} - {categoria.bus.placa}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">${categoria.precioBase.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700">{categoria.asientos || categoria.cantidad}</td>
                <td className="px-4 py-3 text-gray-700">{categoria.asientosConBoletos}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${categoria.bus.activo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {categoria.bus.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                  No hay categorias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
