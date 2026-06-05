"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Bus } from "lucide-react";
import type { NavItem } from "@/lib/navigation";
import { getRolColor, getRolLabel } from "@/lib/navigation";

interface SidebarProps {
  rol: string;
  navItems: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ rol, navItems, isOpen, onClose }: SidebarProps) {
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
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] ${colors.bg} ${colors.text}
          flex flex-col shadow-xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo y nombre */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors.accent}`}>
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold truncate">Cooperativa de</h2>
            <h2 className="text-sm font-bold truncate">Transportes</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge de rol */}
        <div className="px-5 py-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
            {getRolLabel(rol)}
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
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
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? `${colors.accent} text-white shadow-md`
                          : `text-white/70 hover:text-white hover:bg-white/10`
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : ""}`} />
                    <span className="truncate">{item.label}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del sidebar */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-white/40">
            Sistema de Boletos v0.0.1
          </p>
        </div>
      </aside>
    </>
  );
}
