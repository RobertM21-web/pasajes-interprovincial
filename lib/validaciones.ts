/**
 * ============================================================
 * SISTEMA DE PASAJES INTERPROVINCIAL
 * Archivo centralizado de schemas de validación con Zod v4
 * ============================================================
 */

import { z } from "zod";

// ============================================================
// FUNCIONES DE VALIDACIÓN PURAS (reutilizables en frontend/backend)
// ============================================================

/**
 * Valida una cédula ecuatoriana usando el algoritmo oficial
 * del dígito verificador (Módulo 10).
 */
export function validarCedulaEcuador(cedula: string): boolean {
  const limpia = cedula.trim();

  // Exactamente 10 dígitos numéricos
  if (!/^\d{10}$/.test(limpia)) return false;

  // Provincia válida (01–24)
  const provincia = parseInt(limpia.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  // Tercer dígito debe ser menor a 6 (personas naturales)
  const tercerDigito = parseInt(limpia[2], 10);
  if (tercerDigito >= 6) return false;

  // Algoritmo de módulo 10 (coeficientes pares/impares)
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(limpia[i], 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(limpia[9], 10);
  const decenaSuperior = Math.ceil(suma / 10) * 10;
  let resultado = decenaSuperior - suma;
  if (resultado === 10) resultado = 0;

  return resultado === digitoVerificador;
}

/**
 * Valida formato de placa ecuatoriana: 3 letras mayúsculas + guion + 3 o 4 dígitos
 * Ejemplos válidos: ABC-123, ABC-1234
 */
export function validarPlacaEcuador(placa: string): boolean {
  return /^[A-Z]{3}-\d{3,4}$/.test(placa.trim().toUpperCase());
}

/**
 * Valida teléfono celular ecuatoriano:
 * - 10 dígitos exactos
 * - Debe empezar con 09
 */
export function validarTelefonoCelular(telefono: string): boolean {
  const limpio = telefono.trim().replace(/\s|-/g, "");
  return /^09\d{8}$/.test(limpio);
}

/**
 * Valida nombre de persona:
 * - Solo letras (incluye ñ, tildes), espacios
 * - Mínimo 3 caracteres
 */
export function validarNombrePersona(nombre: string): boolean {
  const limpio = nombre.trim();
  if (limpio.length < 3) return false;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(limpio);
}

/**
 * Valida formato de email
 */
export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ============================================================
// SCHEMAS ZOD — Para validación en API routes (backend)
// ============================================================

/** Schema de cédula ecuatoriana con dígito verificador */
export const cedulaEcuatorianaSchema = z
  .string()
  .length(10, "La cédula debe tener exactamente 10 dígitos")
  .regex(/^\d{10}$/, "La cédula debe contener solo dígitos")
  .refine(validarCedulaEcuador, { message: "Cédula inválida" });

/** Schema de placa vehicular ecuatoriana */
export const placaEcuatorianaSchema = z
  .string()
  .min(1, "La placa es obligatoria")
  .transform((v) => v.toUpperCase().trim())
  .refine(validarPlacaEcuador, {
    message: "Formato de placa inválido. Use: ABC-123 o ABC-1234",
  });

/** Schema de teléfono celular ecuatoriano */
export const telefonoCelularSchema = z
  .string()
  .length(10, "El teléfono debe tener exactamente 10 dígitos")
  .regex(/^09\d{8}$/, "El teléfono debe empezar con 09 y tener 10 dígitos");

/** Schema de nombre de persona */
export const nombrePersonaSchema = z
  .string()
  .min(3, "El nombre debe tener al menos 3 caracteres")
  .refine(validarNombrePersona, {
    message: "El nombre solo puede contener letras y espacios",
  });

/** Schema de email */
export const emailSchema = z
  .string()
  .email("El correo electrónico no tiene un formato válido")
  .min(1, "El correo es obligatorio");

/** Schema de cantidad de asientos (por categoría o total) */
export const cantidadAsientosSchema = z
  .number()
  .int("Debe ser un número entero")
  .min(1, "Mínimo 1 asiento")
  .max(50, "Máximo 50 asientos permitidos");

// ============================================================
// SCHEMAS COMPUESTOS — Para formularios completos
// ============================================================

/** Schema de registro de usuario/cliente */
export const registroClienteSchema = z.object({
  nombre: nombrePersonaSchema,
  cedula: cedulaEcuatorianaSchema,
  telefono: telefonoCelularSchema,
  email: emailSchema,
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

/** Schema para crear/editar un bus */
export const busSchema = z.object({
  numero: z.string().min(1, "El número de bus es obligatorio"),
  placa: placaEcuatorianaSchema,
  marcaChasis: z
    .string()
    .min(2, "La marca del chasis debe tener al menos 2 caracteres"),
  marcaCarroceria: z
    .string()
    .min(2, "La marca de carrocería debe tener al menos 2 caracteres"),
  fotografiaUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  enTerminal: z.boolean().default(true),
  categorias: z
    .array(
      z.object({
        nombre: z.string().min(1, "El nombre de la categoría es obligatorio"),
        precioBase: z.number().positive("El precio debe ser mayor a 0"),
        cantidad: cantidadAsientosSchema,
        descripcion: z.string().optional(),
      })
    )
    .min(1, "Debe tener al menos una categoría"),
});

/** Schema para venta de boleto en ventanilla */
export const ventaBoletaSchema = z.object({
  pasajeroNombre: nombrePersonaSchema,
  pasajeroCedula: cedulaEcuatorianaSchema,
  rutaId: z.string().min(1, "Debe seleccionar una ruta"),
  asientoId: z.string().min(1, "Debe seleccionar un asiento"),
  tipoPasajero: z.enum(["NORMAL", "MENOR_EDAD", "TERCERA_EDAD", "DISCAPACIDAD"]),
  metodoPago: z.enum(["EFECTIVO", "TRANSFERENCIA"]),
});

// ============================================================
// HELPERS PARA VALIDACIÓN EN TIEMPO REAL (frontend)
// Retornan string con el mensaje de error, o "" si es válido
// ============================================================

export const validarCampo = {
  cedula: (valor: string): string => {
    if (!valor) return "";
    if (!/^\d+$/.test(valor)) return "Solo se permiten dígitos";
    if (valor.length < 10) return `Faltan ${10 - valor.length} dígito(s)`;
    if (valor.length === 10 && !validarCedulaEcuador(valor)) return "Cédula inválida";
    return "";
  },

  placa: (valor: string): string => {
    if (!valor) return "";
    const upper = valor.toUpperCase().trim();
    if (!validarPlacaEcuador(upper))
      return "Formato inválido. Ejemplo: ABC-1234";
    return "";
  },

  telefono: (valor: string): string => {
    if (!valor) return "";
    if (!/^\d+$/.test(valor)) return "Solo se permiten números";
    if (valor.length < 10) return `Faltan ${10 - valor.length} dígito(s)`;
    if (valor.length === 10 && !valor.startsWith("09"))
      return "Debe empezar con 09";
    if (valor.length > 10) return "Máximo 10 dígitos";
    return "";
  },

  nombre: (valor: string): string => {
    if (!valor) return "";
    if (valor.trim().length < 3) return "Mínimo 3 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(valor.trim()))
      return "Solo letras y espacios, sin números ni símbolos";
    return "";
  },

  email: (valor: string): string => {
    if (!valor) return "";
    if (!validarEmail(valor)) return "Formato de correo inválido";
    return "";
  },

  asientos: (valor: number): string => {
    if (valor < 1) return "Mínimo 1 asiento";
    if (valor > 50) return "Máximo 50 asientos permitidos";
    return "";
  },

  password: (valor: string): string => {
    if (!valor) return "";
    if (valor.length < 8) return "Mínimo 8 caracteres";
    return "";
  },
};
