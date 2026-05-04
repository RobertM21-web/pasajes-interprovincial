"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { clienteNavItems } from "@/lib/navigation";

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout rol="CLIENTE" navItems={clienteNavItems}>
      {children}
    </DashboardLayout>
  );
}
