"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { getNavItemsByRole } from "@/lib/navigation";

interface DashboardLayoutProps {
  rol: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  rol,
  children,
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItemsByRole(rol);

  const userName = session?.user?.name || "Usuario";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar
        rol={rol}
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          userName={userName}
          rol={rol}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
