/**
 * Página: Historial de compras del cliente
 * Server Component que obtiene los boletos desde la API
 *
 * Características:
 * - Obtiene todos los boletos del usuario autenticado
 * - Ordena por createdAt DESC
 * - Incluye relaciones: ruta (con frecuencia) y asiento (con categoría)
 * - Filtro por estado
 * - Paginación
 * - Empty state cuando no hay boletos
 */

import { Suspense } from "react";
import { BoletoCard } from "./boleto-card";
import { EmptyState } from "./empty-state";
import { EstadoFilter } from "./estado-filter";

/**
 * Props que recibe la página del Next.js router
 */
interface HistorialPageProps {
  searchParams: Promise<{
    usuarioId?: string;
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
 * Obtiene el historial de boletos desde la API
 */
async function obtenerHistorial(
  usuarioId: string,
  estado?: string,
  page?: string
): Promise<HistorialResponse> {
  const params = new URLSearchParams({
    usuarioId,
  });

  if (estado) params.append("estado", estado);
  if (page) params.append("page", page);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/cliente/historial?${params}`, {
      next: { revalidate: 60 }, // Revalidar cada 60 segundos
    });

    if (!response.ok) {
      throw new Error("Error al obtener historial");
    }

    return response.json();
  } catch (error) {
    console.error("Error al obtener historial:", error);
    throw error;
  }
}

/**
 * Componente que renderiza el contenido del historial
 */
async function HistorialContent({
  usuarioId,
  estado,
  page,
}: {
  usuarioId: string;
  estado?: string;
  page?: string;
}) {
  try {
    const data = await obtenerHistorial(usuarioId, estado, page);

    if (!data.boletos || data.boletos.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="space-y-6">
        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.boletos.map((boleto) => (
            <BoletoCard key={boleto.id} boleto={boleto} />
          ))}
        </div>

        {/* Información de paginación */}
        {data.paginacion && (
          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {data.boletos.length} de {data.paginacion.total} boletos
            </p>
            <p className="text-sm text-gray-600">
              Página {data.paginacion.page} de {data.paginacion.totalPages}
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error al cargar historial
        </h3>
        <p className="text-red-700">
          No pudimos obtener tus boletos. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }
}

/**
 * Página principal: Historial de compras
 */
export default async function HistorialPage({
  searchParams,
}: HistorialPageProps) {
  const params = await searchParams;

  // TODO: En producción, obtener usuarioId de la sesión NextAuth
  // const session = await getServerSession(authOptions);
  // const usuarioId = session?.user?.id;
  const usuarioId = params.usuarioId || "";

  if (!usuarioId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Identificación requerida
            </h2>
            <p className="text-yellow-700 mb-4">
              Por favor, inicia sesión para ver tu historial de compras.
            </p>
            <a
              href="/auth/login"
              className={`
                inline-flex items-center justify-center
                px-6 py-2.5 rounded-lg font-medium text-sm
                bg-blue-600 text-white hover:bg-blue-700
                transition-colors duration-200
              `}
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      </div>
    );
  }

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
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg h-64 animate-pulse"
                />
              ))}
            </div>
          }
        >
          <HistorialContent
            usuarioId={usuarioId}
            estado={params.estado}
            page={params.page}
          />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Metadatos de la página
 */
export const metadata = {
  title: "Historial de Compras",
  description: "Ver el historial de boletos comprados",
};
