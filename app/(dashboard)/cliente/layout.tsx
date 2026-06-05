import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDashboardPathForRole } from "@/lib/auth";

export default async function ClienteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.rol !== "CLIENTE") {
    redirect(getDashboardPathForRole(session.user.rol));
  }

  return (
    <DashboardLayout rol="CLIENTE">
      {children}
    </DashboardLayout>
  );
}
