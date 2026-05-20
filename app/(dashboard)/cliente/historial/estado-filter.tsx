/**
 * Filtro de estados para el historial de boletos
 * Permite filtrar por estado usando tabs/botones
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ESTADOS_DISPONIBLES } from "@/lib/constants";

export function EstadoFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estadoActual = searchParams.get("estado") || null;

  const handleFilter = (estado: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (estado) {
      params.set("estado", estado);
      params.set("page", "1"); // Reset a página 1
    } else {
      params.delete("estado");
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botón: Todos */}
      <button
        onClick={() => handleFilter(null)}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-colors
          ${
            estadoActual === null
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }
        `}
      >
        Todos
      </button>

      {/* Botones de estados */}
      {ESTADOS_DISPONIBLES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleFilter(value)}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-colors
            ${
              estadoActual === value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
