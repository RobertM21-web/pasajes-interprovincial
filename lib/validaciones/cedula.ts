export function validarCedulaEcuador(cedula: string): boolean {
  const limpia = cedula.trim();
  return /^\d{10}$/.test(limpia);
}
