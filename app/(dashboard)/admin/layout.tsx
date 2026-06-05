import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDashboardPathForRole } from "@/lib/auth";
import { getConfiguracionCooperativa } from "@/lib/configuracion";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.rol !== "ADMIN") {
    redirect(getDashboardPathForRole(session.user.rol));
  }

  const config = await getConfiguracionCooperativa();

  return (
    <DashboardLayout rol="ADMIN" config={config}>
      {children}
    </DashboardLayout>
  );
}
