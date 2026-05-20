"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { oficinistaNavItems } from "@/lib/navigation";

export default function OficinistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout rol="OFICINISTA" navItems={oficinistaNavItems}>
      {children}
    </DashboardLayout>
  );
}
