/**
 * Página: Historial de compras del cliente
 * Client Component que obtiene boletos desde /api/boletos/historial
 *
 * Características:
 * - Obtiene todos los boletos del usuario autenticado
 * - Ordena por createdAt DESC
 * - Incluye relaciones: ruta (con frecuencia) y asiento (con categoría)
 * - Filtro interactivo por estado (tabs)
 * - Paginación (Anterior/Siguiente)
 * - Contador "Mostrando X de Y boletos"
 * - Empty state cuando no hay boletos
 * - Loading state con skeleton
 * - Error handling
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BoletoCard } from "./boleto-card";
import { EmptyState } from "./empty-state";
import { EstadoFilter } from "./estado-filter";
import { Pagination } from "./pagination";
import { BoletoListSkeleton } from "./skeleton";

/**
 * Props que recibe la página del Next.js router
 */
interface HistorialPageProps {
  searchParams: Promise<{
    estado?: string;
    page?: string;
  }>;
}

/**
 * Interfaz del boleto obtenido de la API
 */
interface Boleto {
  id: string;
  codigoQr: string | null;
  estado: string;
  precioBase: number;
  descuento: number;
  precioFinal: number;
  pasajeroNombre: string;
  pasajeroCedula: string;
  tipoPasajero: string;
  metodoPago: string;
  canalVenta: string;
  origenTramo: string;
  destinoTramo: string;
  abordado: boolean;
  fechaAbordaje: Date | null;
  comprobanteUrl: string | null;
  createdAt: Date | string;
  ruta: {
    origen: string;
    destino: string;
    hora: string;
    busNumero: string;
    busPlaca: string;
  };
  asiento: {
    numero: number;
    etiqueta: string;
    categoria: string;
    posicion: string;
  };
}

/**
 * Interfaz de la respuesta de la API
 */
interface HistorialResponse {
  boletos: Boleto[];
  paginacion: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Página principal: Historial de compras (Client Component)
 */
export default function HistorialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [paginacion, setPaginacion] = useState<HistorialResponse["paginacion"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parámetros actuales
  const estado = searchParams.get("estado") || null;
  const page = parseInt(searchParams.get("page") || "1");

  // TODO: Obtener usuarioId de NextAuth cuando esté configurado
  const usuarioId = "test-user-id"; // Placeholder

  // Efecto: Cargar boletos cuando cambien los parámetros
  useEffect(() => {
    const cargarBoletos = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          usuarioId,
          page: page.toString(),
        });

        if (estado) {
          params.append("estado", estado);
        }

        const response = await fetch(`/api/boletos/historial?${params}`);

        if (!response.ok) {
          throw new Error("Error al obtener historial");
        }

        const data: HistorialResponse = await response.json();
        setBoletos(data.boletos);
        setPaginacion(data.paginacion);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error desconocido al cargar boletos"
        );
        setBoletos([]);
        setPaginacion(null);
      } finally {
        setLoading(false);
      }
    };

    cargarBoletos();
  }, [estado, page, usuarioId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Historial de Compras
          </h1>
          <p className="text-gray-600">
            Aquí puedes ver todos tus boletos y su estado
          </p>
        </div>

        {/* Filtro de estados */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Filtrar por estado
          </h2>
          <EstadoFilter />
        </div>

        {/* Contenido principal */}
        {loading ? (
          <BoletoListSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error al cargar historial
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`
                inline-flex items-center justify-center
                px-6 py-2.5 rounded-lg font-medium text-sm
                bg-red-600 text-white hover:bg-red-700
                transition-colors duration-200
              `}
            >
              Intentar de nuevo
            </button>
          </div>
        ) : boletos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Contador */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{boletos.length}</span> de{" "}
                <span className="font-semibold">{paginacion?.total || 0}</span> boletos
              </p>
            </div>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boletos.map((boleto) => (
                <BoletoCard key={boleto.id} boleto={boleto} />
              ))}
            </div>

            {/* Paginación */}
            {paginacion && paginacion.totalPages > 1 && (
              <Pagination
                currentPage={paginacion.page}
                totalPages={paginacion.totalPages}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
