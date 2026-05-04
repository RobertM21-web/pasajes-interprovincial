"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.rol !== "CLIENTE") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Portal del Cliente</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{session.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-lg text-sm transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
      <main className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenido, {session.user?.name}</h2>
        <p className="text-gray-600">Portal del cliente. Aquí puedes buscar rutas, comprar boletos y ver tu historial.</p>
      </main>
    </div>
  );
}
