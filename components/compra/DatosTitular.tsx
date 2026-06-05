"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { validarCedulaEcuador } from "@/lib/validaciones/cedula";
import type { Pasajero, TipoPasajero } from "@/types/pasajero";

type DatosTitularProps = {
  value: Pasajero;
  onChange: (titular: Pasajero) => void;
};

type PerfilUsuario = {
  nombre: string;
  email: string;
  cedula: string | null;
};

const tiposPasajero: { value: TipoPasajero; label: string }[] = [
  { value: "ADULTO", label: "Adulto" },
  { value: "MENOR_EDAD", label: "Menor de edad" },
  { value: "TERCERA_EDAD", label: "Tercera edad" },
  { value: "DISCAPACIDAD", label: "Discapacidad" },
];

export default function DatosTitular({ value, onChange }: DatosTitularProps) {
  const { data: session, status } = useSession();
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [esParaOtraPersona, setEsParaOtraPersona] = useState(false);

  const estaLogueado = status === "authenticated";

  // Cargar perfil del usuario
  useEffect(() => {
    if (!estaLogueado) {
      setPerfil(null);
      return;
    }

    let activo = true;

    async function cargarPerfil() {
      setCargandoPerfil(true);
      try {
        const response = await fetch("/api/usuario/perfil");
        if (!response.ok) return;

        const data = (await response.json()) as PerfilUsuario;
        if (!activo) return;

        setPerfil(data);
        
        // Inicializar datos del titular con datos del perfil por defecto
        onChange({
          nombre: data.nombre ?? "",
          cedula: data.cedula ?? "",
          email: data.email ?? "",
          tipo: "ADULTO",
        });
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        if (activo) {
          setCargandoPerfil(false);
        }
      }
    }

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [estaLogueado, onChange]);

  // Manejar cambio de "¿Es para otra persona?"
  const handleToggleOtraPersona = (checked: boolean) => {
    setEsParaOtraPersona(checked);
    if (!checked && perfil) {
      // Regresar a los datos del perfil
      onChange({
        nombre: perfil.nombre ?? "",
        cedula: perfil.cedula ?? "",
        email: perfil.email ?? "",
        tipo: "ADULTO",
        beneficiarioNombre: undefined,
        beneficiarioCedula: undefined,
        carnetDiscapacidad: undefined,
      });
    } else {
      // Limpiar campos para otra persona
      onChange({
        nombre: "",
        cedula: "",
        email: "",
        tipo: "ADULTO",
        beneficiarioNombre: undefined,
        beneficiarioCedula: undefined,
        carnetDiscapacidad: undefined,
      });
    }
  };

  const actualizarCampo = (campo: keyof Pasajero, dato: string) => {
    const nuevosDatos = { ...value, [campo]: dato };
    
    // Sincronizar automáticamente el pasajero con el beneficiario si aplica
    if (value.tipo !== "ADULTO") {
      if (campo === "nombre") nuevosDatos.beneficiarioNombre = dato;
      if (campo === "cedula") nuevosDatos.beneficiarioCedula = dato;
    }

    onChange(nuevosDatos);
  };

  const handleTipoChange = (nuevoTipo: TipoPasajero) => {
    const nuevosDatos: Pasajero = {
      ...value,
      tipo: nuevoTipo,
    };

    if (nuevoTipo === "ADULTO") {
      delete nuevosDatos.beneficiarioNombre;
      delete nuevosDatos.beneficiarioCedula;
      delete nuevosDatos.carnetDiscapacidad;
    } else {
      // Si compra para sí mismo y es de descuento
      if (estaLogueado && !esParaOtraPersona && perfil) {
        nuevosDatos.beneficiarioNombre = perfil.nombre ?? "";
        nuevosDatos.beneficiarioCedula = perfil.cedula ?? "";
      } else {
        // Si es para otra persona o guest, prellenamos con lo que ya tenga escrito
        nuevosDatos.beneficiarioNombre = value.nombre;
        nuevosDatos.beneficiarioCedula = value.cedula;
      }

      if (nuevoTipo === "DISCAPACIDAD") {
        nuevosDatos.carnetDiscapacidad = value.carnetDiscapacidad ?? "";
      } else {
        delete nuevosDatos.carnetDiscapacidad;
      }
    }

    onChange(nuevosDatos);
  };

  const cedulaInvalida =
    value.cedula.length > 0 && !validarCedulaEcuador(value.cedula);

  const beneficiarioCedulaInvalida =
    value.beneficiarioCedula &&
    value.beneficiarioCedula.length > 0 &&
    !validarCedulaEcuador(value.beneficiarioCedula);

  const camposBloqueados = estaLogueado && !esParaOtraPersona;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Datos del pasajero principal (Titular)
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Ingresa los datos de la persona que viajará en el asiento principal.
          </p>
        </div>

        {estaLogueado && (
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-amber-700">
            <input
              type="checkbox"
              checked={esParaOtraPersona}
              onChange={(e) => handleToggleOtraPersona(e.target.checked)}
              className="rounded border-[var(--border)] text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            ¿El boleto es para otra persona?
          </label>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Nombre
          </span>
          <input
            type="text"
            value={value.nombre}
            onChange={(event) => actualizarCampo("nombre", event.target.value)}
            disabled={camposBloqueados || cargandoPerfil}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition focus:border-amber-500 disabled:bg-slate-100 disabled:text-[var(--text-secondary)]"
            placeholder="Nombre completo"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Cédula
          </span>
          <input
            type="text"
            value={value.cedula}
            onChange={(event) => actualizarCampo("cedula", event.target.value)}
            disabled={camposBloqueados || cargandoPerfil}
            maxLength={10}
            className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition focus:border-amber-500 disabled:bg-slate-100 disabled:text-[var(--text-secondary)] ${
              cedulaInvalida ? "border-red-500" : "border-[var(--border)]"
            }`}
            placeholder="Identificación"
          />
          {cedulaInvalida && (
            <p className="mt-1 text-xs text-red-600">Cédula ecuatoriana inválida</p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Email
          </span>
          <input
            type="email"
            value={value.email ?? ""}
            onChange={(event) => actualizarCampo("email", event.target.value)}
            disabled={camposBloqueados || cargandoPerfil}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition focus:border-amber-500 disabled:bg-slate-100 disabled:text-[var(--text-secondary)]"
            placeholder="Correo electrónico"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Tipo pasajero
          </span>
          <select
            value={value.tipo}
            onChange={(event) => handleTipoChange(event.target.value as TipoPasajero)}
            disabled={cargandoPerfil}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition focus:border-amber-500 disabled:bg-slate-100 disabled:text-[var(--text-secondary)]"
          >
            {tiposPasajero.map((t) => {
              // Si está comprando para sí mismo, ocultamos menor de edad
              if (estaLogueado && !esParaOtraPersona && t.value === "MENOR_EDAD") {
                return null;
              }
              return (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {/* SECCIÓN DE DATOS DEL BENEFICIARIO PARA TARIFAS CON DESCUENTO */}
      {value.tipo !== "ADULTO" && (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <h3 className="text-md font-semibold text-amber-800 mb-3">
              Datos del Beneficiario (Descuento de{" "}
              {value.tipo === "MENOR_EDAD" ? "25%" : "50%"})
            </h3>
            <p className="text-xs text-amber-700 mb-4">
              Se requiere registrar la información del beneficiario para validar el descuento en la hoja de ruta y en el abordaje.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-amber-900">
                  Nombre del Beneficiario
                </span>
                <input
                  type="text"
                  value={value.beneficiarioNombre ?? ""}
                  onChange={(e) => actualizarCampo("beneficiarioNombre", e.target.value)}
                  disabled={camposBloqueados}
                  className="mt-2 w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-amber-500 disabled:bg-slate-100 disabled:text-gray-500"
                  placeholder="Nombre completo"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-amber-900">
                  Cédula del Beneficiario
                </span>
                <input
                  type="text"
                  value={value.beneficiarioCedula ?? ""}
                  onChange={(e) => actualizarCampo("beneficiarioCedula", e.target.value)}
                  disabled={camposBloqueados}
                  maxLength={10}
                  className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-amber-500 disabled:bg-slate-100 disabled:text-gray-500 ${
                    beneficiarioCedulaInvalida ? "border-red-500" : "border-amber-300"
                  }`}
                  placeholder="Cédula"
                />
                {beneficiarioCedulaInvalida && (
                  <p className="mt-1 text-xs text-red-600">Cédula de beneficiario inválida</p>
                )}
              </label>

              {value.tipo === "DISCAPACIDAD" && (
                <label className="block">
                  <span className="text-sm font-medium text-amber-900">
                    Nro. Carnet CONADIS / Discapacidad
                  </span>
                  <input
                    type="text"
                    value={value.carnetDiscapacidad ?? ""}
                    onChange={(e) => actualizarCampo("carnetDiscapacidad", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-amber-500"
                    placeholder="Ej: 030491823-2"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

