/**
 * Badge de estado para boletos
 * Muestra el estado del boleto con color según su estado
 */

import { getEstadoConfig } from "@/lib/constants";

interface EstadoBadgeProps {
  estado: string;
  className?: string;
}

export function EstadoBadge({ estado, className = "" }: EstadoBadgeProps) {
  const config = getEstadoConfig(estado);

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${config.badgeClass}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
