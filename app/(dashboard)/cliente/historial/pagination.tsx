/**
 * Componente de paginación
 * Muestra: Anterior | Página X de Y | Siguiente
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`, { scroll: false });
    onPageChange?.(newPage);
  };

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between py-6 border-t border-gray-200">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-colors
          ${
            hasPrevious
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        ← Anterior
      </button>

      <span className="text-sm font-medium text-gray-700">
        Página <span className="font-bold">{currentPage}</span> de{" "}
        <span className="font-bold">{totalPages}</span>
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-colors
          ${
            hasNext
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        Siguiente →
      </button>
    </div>
  );
}
