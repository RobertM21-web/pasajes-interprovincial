/**
 * Layout para el área del Dashboard
 * Grupo de rutas protegidas para admin, oficinista y cliente
 *
 * Nota: Este es un layout base. En una implementación completa,
 * aquí iría la autenticación con NextAuth y redirección según rol.
 */

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Implementar protección con NextAuth
  // const session = await getServerSession(authOptions);
  // if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Agregar sidebar/navbar del dashboard */}
      <main className="w-full">{children}</main>
    </div>
  );
}
