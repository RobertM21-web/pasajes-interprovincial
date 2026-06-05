"use client";

import type { Pasajero } from "@/types/pasajero";

type ResumenPasajerosProps = {
  titular: Pasajero;
  acompanantes: Pasajero[];
};

const etiquetasTipo: Record<Pasajero["tipo"], string> = {
  ADULTO: "Adulto",
  MENOR_EDAD: "Menor de edad",
  TERCERA_EDAD: "Tercera edad",
  DISCAPACIDAD: "Discapacidad",
};

export default function ResumenPasajeros({
  titular,
  acompanantes,
}: ResumenPasajerosProps) {
  const pasajeros = [titular, ...acompanantes];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        Resumen de pasajeros
      </h2>

      <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)]">
        <div className="hidden grid-cols-[100px_1.5fr_1fr_1fr_1fr_1.5fr] bg-slate-100 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] md:grid">
          <span>Rol</span>
          <span>Nombre</span>
          <span>Cédula</span>
          <span>Email</span>
          <span>Tipo / Descuento</span>
          <span>Beneficiario / Documentos</span>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {pasajeros.map((pasajero, index) => {
            const hasDiscount = pasajero.tipo !== "ADULTO";
            const discountLabel =
              pasajero.tipo === "MENOR_EDAD"
                ? "25%"
                : hasDiscount
                ? "50%"
                : "0%";

            return (
              <div
                key={pasajero.id ?? "titular"}
                className="grid gap-2 px-4 py-4 text-sm text-[var(--text-secondary)] md:grid-cols-[100px_1.5fr_1fr_1fr_1fr_1.5fr] md:items-center"
              >
                <span className="font-semibold text-[var(--text-primary)]">
                  {index === 0 ? "Titular" : `Acomp. ${index}`}
                </span>
                <span className="truncate">{pasajero.nombre || "Pendiente"}</span>
                <span>{pasajero.cedula || "Pendiente"}</span>
                <span className="truncate">{pasajero.email || "-"}</span>
                <span className="flex items-center gap-1.5">
                  <span>{etiquetasTipo[pasajero.tipo]}</span>
                  {hasDiscount && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                      -{discountLabel}
                    </span>
                  )}
                </span>
                <div>
                  {hasDiscount ? (
                    <div className="flex flex-col text-[11px] text-amber-700 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 gap-0.5">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-amber-800">
                        Beneficiario:
                      </span>
                      <span className="truncate">
                        {pasajero.beneficiarioNombre || "Pendiente"}
                      </span>
                      <span>
                        C.I: {pasajero.beneficiarioCedula || "Pendiente"}
                      </span>
                      {pasajero.tipo === "DISCAPACIDAD" && (
                        <span>
                          Carnet: {pasajero.carnetDiscapacidad || "No registrado"}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 font-medium">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

