"use client";

import { Trash2, UserPlus } from "lucide-react";
import { validarCedulaEcuador } from "@/lib/validaciones/cedula";
import type { Pasajero, TipoPasajero } from "@/types/pasajero";

type ListaAcompanantesProps = {
  value: Pasajero[];
  onChange: (acompanantes: Pasajero[]) => void;
};

const tiposPasajero: { value: TipoPasajero; label: string }[] = [
  { value: "ADULTO", label: "Adulto" },
  { value: "MENOR_EDAD", label: "Menor de edad" },
  { value: "TERCERA_EDAD", label: "Tercera edad" },
  { value: "DISCAPACIDAD", label: "Discapacidad" },
];

export default function ListaAcompanantes({
  value,
  onChange,
}: ListaAcompanantesProps) {
  const agregarAcompanante = () => {
    onChange([
      ...value,
      {
        id: Date.now(),
        nombre: "",
        cedula: "",
        tipo: "ADULTO",
      },
    ]);
  };

  const actualizarAcompanante = (
    id: number | undefined,
    campo: keyof Pasajero,
    dato: string
  ) => {
    onChange(
      value.map((acompanante) => {
        if (acompanante.id !== id) return acompanante;
        
        const nuevosDatos = { ...acompanante, [campo]: dato };
        
        // Sincronizar automáticamente el pasajero con el beneficiario si no es adulto
        if (acompanante.tipo !== "ADULTO") {
          if (campo === "nombre") nuevosDatos.beneficiarioNombre = dato;
          if (campo === "cedula") nuevosDatos.beneficiarioCedula = dato;
          if (campo === "beneficiarioNombre") nuevosDatos.nombre = dato;
          if (campo === "beneficiarioCedula") nuevosDatos.cedula = dato;
        }
        
        return nuevosDatos;
      })
    );
  };

  const cambiarTipoAcompanante = (id: number | undefined, nuevoTipo: TipoPasajero) => {
    onChange(
      value.map((acompanante) => {
        if (acompanante.id !== id) return acompanante;
        
        const nuevosDatos = {
          ...acompanante,
          tipo: nuevoTipo,
        };

        if (nuevoTipo === "ADULTO") {
          delete nuevosDatos.beneficiarioNombre;
          delete nuevosDatos.beneficiarioCedula;
          delete nuevosDatos.carnetDiscapacidad;
        } else {
          // Inicializar datos del beneficiario con lo que ya tenga escrito
          nuevosDatos.beneficiarioNombre = acompanante.nombre;
          nuevosDatos.beneficiarioCedula = acompanante.cedula;
          if (nuevoTipo === "DISCAPACIDAD") {
            nuevosDatos.carnetDiscapacidad = acompanante.carnetDiscapacidad ?? "";
          } else {
            delete nuevosDatos.carnetDiscapacidad;
          }
        }

        return nuevosDatos;
      })
    );
  };

  const eliminarAcompanante = (id: number | undefined) => {
    onChange(value.filter((acompanante) => acompanante.id !== id));
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Acompañantes
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Agrega los pasajeros adicionales para este viaje.
          </p>
        </div>

        <button
          type="button"
          onClick={agregarAcompanante}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Agregar acompañante
        </button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-4 text-sm text-[var(--text-secondary)]">
          Todavía no hay acompañantes agregados.
        </p>
      ) : (
        <div className="space-y-4">
          {value.map((acompanante, index) => {
            const cedulaInvalida =
              acompanante.cedula.length > 0 &&
              !validarCedulaEcuador(acompanante.cedula);

            const beneficiarioCedulaInvalida =
              acompanante.beneficiarioCedula &&
              acompanante.beneficiarioCedula.length > 0 &&
              !validarCedulaEcuador(acompanante.beneficiarioCedula);

            return (
              <div
                key={acompanante.id}
                className="rounded-xl border border-[var(--border)] bg-slate-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-semibold text-[var(--text-primary)]">
                    Acompañante {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => eliminarAcompanante(acompanante.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-red-600 shadow-sm transition hover:border-red-500"
                    aria-label="Eliminar acompañante"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Nombre
                    </span>
                    <input
                      type="text"
                      value={acompanante.nombre}
                      onChange={(event) =>
                        actualizarAcompanante(
                          acompanante.id,
                          "nombre",
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition focus:border-amber-500"
                      placeholder="Nombre completo"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Cédula
                    </span>
                    <input
                      type="text"
                      value={acompanante.cedula}
                      onChange={(event) =>
                        actualizarAcompanante(
                          acompanante.id,
                          "cedula",
                          event.target.value
                        )
                      }
                      maxLength={10}
                      className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition focus:border-amber-500 ${
                        cedulaInvalida
                          ? "border-red-500"
                          : "border-[var(--border)]"
                      }`}
                      placeholder="Identificación"
                    />
                    {cedulaInvalida ? (
                      <p className="mt-1 text-xs text-red-600">
                        Cédula ecuatoriana inválida
                      </p>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Tipo pasajero
                    </span>
                    <select
                      value={acompanante.tipo}
                      onChange={(event) =>
                        cambiarTipoAcompanante(
                          acompanante.id,
                          event.target.value as TipoPasajero
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition focus:border-amber-500"
                    >
                      {tiposPasajero.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* SECCIÓN DE DATOS DEL BENEFICIARIO PARA TARIFAS CON DESCUENTO */}
                {acompanante.tipo !== "ADULTO" && (
                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                      <h4 className="text-sm font-semibold text-amber-800 mb-3">
                        Datos del Beneficiario (Descuento de{" "}
                        {acompanante.tipo === "MENOR_EDAD" ? "25%" : "50%"})
                      </h4>
                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="block">
                          <span className="text-xs font-medium text-amber-900">
                            Nombre del Beneficiario
                          </span>
                          <input
                            type="text"
                            value={acompanante.beneficiarioNombre ?? ""}
                            onChange={(e) =>
                              actualizarAcompanante(
                                acompanante.id,
                                "beneficiarioNombre",
                                e.target.value
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm outline-none transition focus:border-amber-500"
                            placeholder="Nombre completo"
                          />
                        </label>

                        <label className="block">
                          <span className="text-xs font-medium text-amber-900">
                            Cédula del Beneficiario
                          </span>
                          <input
                            type="text"
                            value={acompanante.beneficiarioCedula ?? ""}
                            onChange={(e) =>
                              actualizarAcompanante(
                                acompanante.id,
                                "beneficiarioCedula",
                                e.target.value
                              )
                            }
                            maxLength={10}
                            className={`mt-2 w-full rounded-xl border bg-white px-3 py-2 text-xs text-gray-900 shadow-sm outline-none transition focus:border-amber-500 ${
                              beneficiarioCedulaInvalida
                                ? "border-red-500"
                                : "border-amber-300"
                            }`}
                            placeholder="Cédula"
                          />
                          {beneficiarioCedulaInvalida ? (
                            <p className="mt-1 text-[11px] text-red-600">
                              Cédula de beneficiario inválida
                            </p>
                          ) : null}
                        </label>

                        {acompanante.tipo === "DISCAPACIDAD" && (
                          <label className="block">
                            <span className="text-xs font-medium text-amber-900">
                              Nro. Carnet CONADIS / Discapacidad
                            </span>
                            <input
                              type="text"
                              value={acompanante.carnetDiscapacidad ?? ""}
                              onChange={(e) =>
                                actualizarAcompanante(
                                  acompanante.id,
                                  "carnetDiscapacidad",
                                  e.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm outline-none transition focus:border-amber-500"
                              placeholder="Ej: 030491823-2"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

