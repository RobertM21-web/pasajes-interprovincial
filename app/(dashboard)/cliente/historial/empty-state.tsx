/**
 * Estado vacío cuando no hay boletos
 * Muestra un mensaje amigable e ícono sugestivo
 */

interface EmptyStateProps {
  titulo?: string;
  descripcion?: string;
  showIcon?: boolean;
}

export function EmptyState({
  titulo = "Sin boletos aún",
  descripcion = "No tienes boletos en tu historial. ¡Compra tu pasaje ahora!",
  showIcon = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {showIcon && (
        <div className="mb-6">
          {/* Ícono de boleto */}
          <svg
            className="w-16 h-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7c-.39.39-.902.586-1.414.586H7a2 2 0 01-2-2V5a2 2 0 012-2z"
            />
          </svg>
        </div>
      )}

      <h3 className="text-xl font-semibold text-foreground text-center mb-2">
        {titulo}
      </h3>
      <p className="text-gray-600 text-center max-w-sm">{descripcion}</p>

      {/* Botón de CTA opcional */}
      <a
        href="/cliente/buscar"
        className={`
          mt-6 inline-flex items-center justify-center
          px-6 py-2.5 rounded-lg font-medium text-sm
          bg-blue-600 text-white hover:bg-blue-700
          transition-colors duration-200
        `}
      >
        Buscar pasaje
      </a>
    </div>
  );
}
