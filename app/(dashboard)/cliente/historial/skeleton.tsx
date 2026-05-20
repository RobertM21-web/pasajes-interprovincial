/**
 * Skeleton de carga para tarjetas de boletos
 */

export function BoletoCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-24 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* Información */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
        <div>
          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Más información */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div>
          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* Botón */}
      <div className="pt-2 border-t border-gray-100">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function BoletoListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <BoletoCardSkeleton key={i} />
      ))}
    </div>
  );
}
