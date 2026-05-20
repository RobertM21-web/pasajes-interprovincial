/**
 * Layout para el portal del cliente
 * Rutas protegidas al rol CLIENTE
 */

export default function ClienteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Validar que el usuario autenticado tenga rol CLIENTE
  // const session = await getServerSession(authOptions);
  // if (session?.user?.rol !== "CLIENTE") redirect("/auth/login");

  return <>{children}</>;
}
