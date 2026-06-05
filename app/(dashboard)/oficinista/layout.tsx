import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDashboardPathForRole } from "@/lib/auth";

export default async function OficinistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.rol !== "OFICINISTA") {
    redirect(getDashboardPathForRole(session.user.rol));
  }

  return (
    <DashboardLayout rol="OFICINISTA">
      {children}
    </DashboardLayout>
  );
}
