"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Bus } from "lucide-react";
import { getRolColor, getRolLabel } from "@/lib/navigation";

interface SidebarProps {
  rol: string;
  navItems: any[];
  isOpen: boolean;
  onClose: () => void;
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

export default function Sidebar({
  rol,
  navItems,
  isOpen,
  onClose,
  config,
}: SidebarProps) {
  const pathname = usePathname();
  const colors = getRolColor(rol);

  const isActive = (href: string) => {
    if (href === `/${rol.toLowerCase()}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px]
          flex flex-col text-white shadow-xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: `linear-gradient(180deg, ${config.colorPrimario || "#0f172a"} 0%, ${config.colorSecundario || "#1e3a8a"} 100%)`,
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.nombreCooperativa || "Logo de la cooperativa"}
              className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-white"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Bus className="h-6 w-6 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="truncate text-sm font-bold">
              {config.nombreCooperativa || "Cooperativa de Transporte"}
            </h2>
            <p className="truncate text-xs text-white/70">
              Sistema de pasajes
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-white/10 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3">
          <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
            {getRolLabel(rol)}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? "bg-white text-slate-900 shadow-md"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        active ? "text-slate-900" : "text-white"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {active && (
                      <div
                        className="ml-auto h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            config.colorPrimario || "var(--cooperativa-primary)",
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-xs text-white/50">
            {config.nombreCooperativa || "Cooperativa"} · v0.0.1
          </p>
        </div>
      </aside>
    </>
  );
}