"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import { getRolLabel, getRolColor } from "@/lib/navigation";

interface HeaderProps {
  userName: string;
  rol: string;
  onToggleSidebar: () => void;
}

export default function Header({ userName, rol, onToggleSidebar }: HeaderProps) {
  const colors = getRolColor(rol);

  // Obtener iniciales del nombre
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-[var(--border)] shadow-[var(--shadow-sm)]">
      {/* Lado izquierdo: Hamburguesa + Título */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {getRolLabel(rol) === "Administrador"
              ? "Panel de Administración"
              : getRolLabel(rol) === "Oficinista"
              ? "Panel de Oficinista"
              : "Portal del Cliente"}
          </h1>
        </div>
      </div>

      {/* Lado derecho: Usuario + Cerrar sesión */}
      <div className="flex items-center gap-3">
        {/* Info del usuario */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-9 h-9 rounded-full ${colors.accent} text-white text-sm font-semibold`}>
            {initials || <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">
              {userName}
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-tight">
              {getRolLabel(rol)}
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="hidden sm:block w-px h-8 bg-[var(--border)]" />

        {/* Botón cerrar sesión */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
