/**
 * Utilidades para formateo de datos
 * - Fechas (zona horaria Ecuador)
 * - Moneda (USD)
 * - Hora y duración
 */

const formattersLocale = new Intl.DateTimeFormat("es-EC", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const formattersLocaleTime = new Intl.DateTimeFormat("es-EC", {
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea una fecha al formato "D de Mes de Año"
 * @param date - Fecha a formatear
 * @returns Ejemplo: "20 de mayo de 2026"
 */
export function formatFecha(date: Date | string): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return formattersLocale.format(parsedDate);
}

/**
 * Formatea una fecha en formato corto "DD/MM/YYYY"
 * @param date - Fecha a formatear
 * @returns Ejemplo: "20/05/2026"
 */
export function formatFechaCorta(date: Date | string): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una hora en formato "HH:MM"
 * @param time - Hora como string "14:00" o como Date
 * @returns Ejemplo: "14:00"
 */
export function formatHora(time: string | Date): string {
  if (typeof time === "string") return time;
  return formattersLocaleTime.format(time);
}

/**
 * Formatea moneda a USD
 * @param amount - Cantidad a formatear
 * @returns Ejemplo: "$15.50"
 */
export function formatMoneda(amount: number | string | { toNumber(): number }): string {
  let numAmount: number;

  if (typeof amount === "string") {
    numAmount = parseFloat(amount);
  } else if (typeof amount === "number") {
    numAmount = amount;
  } else if (typeof amount === "object" && "toNumber" in amount) {
    numAmount = amount.toNumber();
  } else {
    numAmount = 0;
  }

  return currencyFormatter.format(numAmount);
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param from - Fecha inicial
 * @param to - Fecha final (default: hoy)
 * @returns Número de días
 */
export function diasTranscurridos(
  from: Date | string,
  to: Date | string = new Date()
): number {
  const fromDate = typeof from === "string" ? new Date(from) : from;
  const toDate = typeof to === "string" ? new Date(to) : to;

  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Convierte minutos a formato "Xh Ym"
 * @param minutes - Minutos
 * @returns Ejemplo: "2h 30m"
 */
export function formatDuracion(minutes: number): string {
  const horas = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (horas === 0) return `${mins}m`;
  if (mins === 0) return `${horas}h`;

  return `${horas}h ${mins}m`;
}

/**
 * Formatea fecha y hora juntas
 * @param date - Fecha y hora
 * @returns Ejemplo: "20 de mayo de 2026, 14:00"
 */
export function formatFechaHora(date: Date | string): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const fecha = formatFecha(parsedDate);
  const hora = formatHora(parsedDate);
  return `${fecha}, ${hora}`;
}
