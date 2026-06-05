import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const config = await prisma.configuracion.findFirst();

  const nombreCooperativa = config?.nombreCooperativa || "Cooperativa";
  const logoUrl = config?.logoUrl || "";
  const colorPrimario = config?.colorPrimario || "#0f172a";
  const colorSecundario = config?.colorSecundario || "#1d4ed8";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          background: colorPrimario,
          color: "white",
          borderBottom: `4px solid ${colorSecundario}`,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={nombreCooperativa}
              style={{
                width: "44px",
                height: "44px",
                objectFit: "cover",
                borderRadius: "10px",
                background: "white",
                padding: "4px",
              }}
            />
          ) : null}

          <div>
            <div style={{ fontSize: "18px", fontWeight: 800 }}>
              {nombreCooperativa}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>
              Panel de administración
            </div>
          </div>
        </div>
      </header>

      <main className="w-full">{children}</main>
    </div>
  );
}