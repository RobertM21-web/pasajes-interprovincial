"use client";

import { useSession } from "next-auth/react";
import StatCard from "@/components/dashboard/StatCard";
import { Ticket, MapPin, Clock, Search, Upload, History } from "lucide-react";

export default function ClientePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="animate-fade-in">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Bienvenido, {session.user?.name}
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Portal del cliente. Busca rutas, compra boletos y gestiona tus viajes.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Mis Boletos"
          value="—"
          icon={Ticket}
          variant="amber"
          description="Boletos activos"
        />
        <StatCard
          title="Próximo Viaje"
          value="—"
          icon={MapPin}
          variant="blue"
          description="Destino más próximo"
        />
        <StatCard
          title="Pagos Pendientes"
          value="—"
          icon={Clock}
          variant="rose"
          description="Comprobantes por validar"
        />
      </div>

      {/* Accesos rápidos */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          ¿Qué deseas hacer?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Buscar Rutas",
              description: "Encuentra destinos, horarios y precios disponibles",
              icon: Search,
              href: "/cliente/buscar-rutas",
              color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
              iconColor: "text-blue-600",
            },
            {
              title: "Mis Boletos",
              description: "Consulta tus boletos activos y descarga tu QR",
              icon: Ticket,
              href: "/cliente/mis-boletos",
              color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
              iconColor: "text-amber-600",
            },
            {
              title: "Subir Comprobante",
              description: "Adjunta el comprobante de transferencia o depósito",
              icon: Upload,
              href: "/cliente/subir-comprobante",
              color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
              iconColor: "text-emerald-600",
            },
            {
              title: "Historial de Compras",
              description: "Revisa tu historial completo de viajes y boletos",
              icon: History,
              href: "/cliente/historial",
              color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
              iconColor: "text-purple-600",
            },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${item.color}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {item.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Información de contacto */}
      <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          ¿Necesitas ayuda?
        </h3>
        <p className="text-xs text-blue-700">
          Contacta a nuestro equipo de soporte en{" "}
          <span className="font-medium">soporte@cooperativa.com</span> o al{" "}
          <span className="font-medium">032-555-0100</span>
        </p>
      </div>
    </div>
  );
}
