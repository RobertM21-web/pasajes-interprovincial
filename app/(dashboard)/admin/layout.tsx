"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminNavItems } from "@/lib/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout rol="ADMIN" navItems={adminNavItems}>
      {children}
    </DashboardLayout>
  );
}
