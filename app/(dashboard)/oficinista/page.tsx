"use client";

import { useSession } from "next-auth/react";
import StatCard from "@/components/dashboard/StatCard";
import { Route, Ticket, CreditCard, QrCode, FileText, Bus } from "lucide-react";

export default function OficinistaPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
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
          Panel del oficinista. Habilita rutas, vende boletos y valida pagos y abordajes.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Rutas del Día"
          value="—"
          icon={Route}
          variant="emerald"
          description="Habilitadas para hoy"
        />
        <StatCard
          title="Boletos Vendidos"
          value="—"
          icon={Ticket}
          variant="blue"
          description="Vendidos hoy"
        />
        <StatCard
          title="Pagos Pendientes"
          value="—"
          icon={CreditCard}
          variant="amber"
          description="Por validar"
        />
        <StatCard
          title="Abordajes"
          value="—"
          icon={QrCode}
          variant="purple"
          description="Registrados hoy"
        />
      </div>

      {/* Accesos rápidos */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Hojas de Ruta",
              description: "Crear y gestionar hojas de ruta semanales o mensuales",
              icon: FileText,
              href: "/oficinista/hojas-ruta",
              color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
              iconColor: "text-emerald-600",
            },
            {
              title: "Habilitar Rutas",
              description: "Asignar buses a frecuencias para crear rutas del día",
              icon: Route,
              href: "/oficinista/habilitar-rutas",
              color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
              iconColor: "text-blue-600",
            },
            {
              title: "Vender Boletos",
              description: "Vender boletos en ventanilla con selección de asientos",
              icon: Ticket,
              href: "/oficinista/vender-boletos",
              color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
              iconColor: "text-amber-600",
            },
            {
              title: "Validar Pagos",
              description: "Revisar y aprobar comprobantes de transferencia",
              icon: CreditCard,
              href: "/oficinista/validar-pagos",
              color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
              iconColor: "text-purple-600",
            },
            {
              title: "Validar Abordaje",
              description: "Escanear código QR y registrar abordaje de pasajeros",
              icon: QrCode,
              href: "/oficinista/validar-abordaje",
              color: "bg-rose-50 border-rose-200 hover:bg-rose-100",
              iconColor: "text-rose-600",
            },
            {
              title: "Reasignar Buses",
              description: "Sustituir buses dañados por disponibles en terminal",
              icon: Bus,
              href: "/oficinista/habilitar-rutas",
              color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
              iconColor: "text-cyan-600",
            },
          ].map((item) => (
            <a
              key={item.title}
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
    </div>
  );
}
