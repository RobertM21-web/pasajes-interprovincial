/**
 * Constantes y configuraciones del sistema
 * - Estados de boletos
 * - Tipos de pasajeros
 * - Métodos de pago
 * - Canales de venta
 */

/**
 * Estados de boletos con información de UI
 */
export const BOLETO_ESTADOS = {
  PENDIENTE: {
    label: "Pendiente",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-300",
    badgeClass: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },
  PAGADO: {
    label: "Pagado",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
    badgeClass: "bg-green-100 text-green-800 border border-green-300",
  },
  ABORDADO: {
    label: "Abordado",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
    badgeClass: "bg-blue-100 text-blue-800 border border-blue-300",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-300",
    badgeClass: "bg-red-100 text-red-800 border border-red-300",
  },
  NO_ABORDADO: {
    label: "No Abordado",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-300",
    badgeClass: "bg-orange-100 text-orange-800 border border-orange-300",
  },
} as const;

export type EstadoBoleto = keyof typeof BOLETO_ESTADOS;

/**
 * Obtiene la configuración de UI para un estado de boleto
 * @param estado - Estado del boleto
 * @returns Configuración con colores y clases Tailwind
 */
export function getEstadoConfig(
  estado: string | undefined
): (typeof BOLETO_ESTADOS)[EstadoBoleto] {
  const key = (estado || "PENDIENTE").toUpperCase() as EstadoBoleto;
  return BOLETO_ESTADOS[key] || BOLETO_ESTADOS.PENDIENTE;
}

/**
 * Lista de todos los estados disponibles para filtros
 */
export const ESTADOS_DISPONIBLES = Object.entries(BOLETO_ESTADOS).map(
  ([key, value]) => ({
    value: key as EstadoBoleto,
    label: value.label,
  })
);

/**
 * Tipos de pasajeros
 */
export const TIPOS_PASAJERO = {
  NORMAL: { label: "Adulto", descuento: 0 },
  MENOR_EDAD: { label: "Menor de edad", descuento: 0.25 },
  TERCERA_EDAD: { label: "Tercera edad", descuento: 0.25 },
  DISCAPACIDAD: { label: "Con discapacidad", descuento: 0.25 },
} as const;

/**
 * Métodos de pago disponibles
 */
export const METODOS_PAGO = {
  TRANSFERENCIA: { label: "Transferencia bancaria" },
  DEPOSITO: { label: "Depósito bancario" },
  PAYPAL: { label: "PayPal" },
} as const;

/**
 * Canales de venta
 */
export const CANALES_VENTA = {
  ONLINE: { label: "Compra en línea" },
  OFICINA: { label: "Ventanilla" },
} as const;

/**
 * Posiciones de asientos
 */
export const POSICIONES_ASIENTO = {
  VENTANA: "Ventana",
  PASILLO: "Pasillo",
  MEDIO: "Medio",
} as const;
