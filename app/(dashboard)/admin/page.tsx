"use client";

import { useSession } from "next-auth/react";
import StatCard from "@/components/dashboard/StatCard";
import { Bus, Clock, Users, Ticket, Settings, Shield } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
          Panel de administración de la cooperativa. Gestiona buses, frecuencias, usuarios y configuración.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Buses Activos"
          value="—"
          icon={Bus}
          variant="blue"
          description="Total registrados"
        />
        <StatCard
          title="Frecuencias"
          value="—"
          icon={Clock}
          variant="amber"
          description="Aprobadas por la ANT"
        />
        <StatCard
          title="Usuarios"
          value="—"
          icon={Users}
          variant="emerald"
          description="Registrados en el sistema"
        />
        <StatCard
          title="Boletos Hoy"
          value="—"
          icon={Ticket}
          variant="purple"
          description="Vendidos en el día"
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
              title: "Gestionar Buses",
              description: "Crear, editar y administrar la flota de buses",
              icon: Bus,
              href: "/admin/buses",
              color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
              iconColor: "text-blue-600",
            },
            {
              title: "Gestionar Frecuencias",
              description: "Administrar las frecuencias aprobadas por la ANT",
              icon: Clock,
              href: "/admin/frecuencias",
              color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
              iconColor: "text-amber-600",
            },
            {
              title: "Gestionar Usuarios",
              description: "Administrar usuarios, roles y permisos del sistema",
              icon: Users,
              href: "/admin/usuarios",
              color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
              iconColor: "text-emerald-600",
            },
            {
              title: "Roles y Permisos",
              description: "Configurar roles y asignar permisos",
              icon: Shield,
              href: "/admin/roles",
              color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
              iconColor: "text-purple-600",
            },
            {
              title: "Configuración",
              description: "Logo, colores, redes sociales y datos de soporte",
              icon: Settings,
              href: "/admin/configuracion",
              color: "bg-rose-50 border-rose-200 hover:bg-rose-100",
              iconColor: "text-rose-600",
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
    </div>
  );
}
