export type TipoPasajero =
  | "ADULTO"
  | "MENOR_EDAD"
  | "TERCERA_EDAD"
  | "DISCAPACIDAD";

export interface Pasajero {
  id?: number;
  nombre: string;
  cedula: string;
  email?: string;
  tipo: TipoPasajero;
  beneficiarioNombre?: string;
  beneficiarioCedula?: string;
  carnetDiscapacidad?: string;
}

export interface PasajeroConError extends Pasajero {
  errorCedula?: string;
}

