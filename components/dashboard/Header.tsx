"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import { getRolLabel, getRolColor } from "@/lib/navigation";

interface HeaderProps {
  userName: string;
  rol: string;
  onToggleSidebar: () => void;
  config: {
  nombreCooperativa: string;
  logoUrl: string;
  colorPrimario: string;
  colorSecundario: string;
  direccion?: string;
  nombreBanco?: string;
  numeroCuenta?: string;
  titularCuenta?: string;
  rucCooperativa?: string;
}
}

export default function Header({
  userName,
  rol,
  onToggleSidebar,
  config,
}: HeaderProps) {
  const colors = getRolColor(rol);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const panelTitle =
    getRolLabel(rol) === "Administrador"
      ? "Panel de Administración"
      : getRolLabel(rol) === "Oficinista"
      ? "Panel de Oficinista"
      : "Portal del Cliente";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.nombreCooperativa || "Logo de la cooperativa"}
              className="h-10 w-10 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-semibold"
              style={{ backgroundColor: "var(--cooperativa-primary)" }}
            >
              {(config.nombreCooperativa || "C").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 hidden sm:block">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--cooperativa-primary)" }}
            >
              {config.nombreCooperativa || "Cooperativa"}
            </p>
            <h1 className="truncate text-base font-medium text-slate-700">
              {panelTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full ${colors.accent} text-white text-sm font-semibold`}
          >
            {initials || <User className="w-4 h-4" />}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">
              {userName}
            </p>
            <p className="text-xs text-slate-500 leading-tight">
              {getRolLabel(rol)}
            </p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-slate-200" />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}