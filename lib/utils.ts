import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number | string | any): string {
  const numberAmount = Number(amount)
  if (isNaN(numberAmount)) return "$0.00"
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(numberAmount)
}

export function formatDate(date: Date | string): string {
  if (!date) return ""
  return new Intl.DateTimeFormat("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}
