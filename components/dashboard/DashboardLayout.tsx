"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { getNavItemsByRole } from "@/lib/navigation";

interface DashboardConfig {
  nombreCooperativa: string;
  logoUrl: string;
  colorPrimario: string;
  colorSecundario: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  emailSoporte?: string;
  telefonoSoporte?: string;
  direccion?: string;
  nombreBanco?: string;
  numeroCuenta?: string;
  titularCuenta?: string;
  rucCooperativa?: string;
}

interface DashboardLayoutProps {
  rol: string;
  children: React.ReactNode;
  config: DashboardConfig;
}

export default function DashboardLayout({
  rol,
  children,
  config,
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItemsByRole(rol);

  const userName = session?.user?.name || "Usuario";

  useEffect(() => {
  document.title =
    config?.nombreCooperativa || "Sistema de Pasajes - Cooperativa";
}, [config?.nombreCooperativa]);

  return (
    <div
      className="flex h-screen overflow-hidden bg-slate-50"
      style={
        {
          "--cooperativa-primary": config.colorPrimario || "#0f172a",
          "--cooperativa-secondary": config.colorSecundario || "#1d4ed8",
        } as React.CSSProperties
      }
    >
      <Sidebar
        rol={rol}
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        config={config}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          userName={userName}
          rol={rol}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          config={config}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}