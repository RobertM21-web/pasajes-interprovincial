/**
 * Validación de cédula ecuatoriana usando el algoritmo oficial
 * del dígito verificador (Módulo 10).
 *
 * NOTA: Este archivo se mantiene por compatibilidad.
 * Para nuevos usos, importar desde "@/lib/validaciones"
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
