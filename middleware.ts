import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas protegidas por rol
const roleRoutes: Record<string, string> = {
  ADMIN: "/admin",
  OFICINISTA: "/oficinista",
  CLIENTE: "/cliente",
};

// Rutas públicas que no necesitan autenticación
const publicRoutes = ["/login"];

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Esto es un check optimista (client-side) — la verificación
 * real de la firma la hace NextAuth en el servidor.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Obtiene el rol del usuario desde la cookie de sesión de NextAuth.
 * NextAuth almacena el JWT en la cookie "next-auth.session-token"
 * (o "__Secure-next-auth.session-token" en producción con HTTPS).
 */
function getUserRolFromRequest(request: NextRequest): string | null {
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  return (payload.rol as string) || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rol = getUserRolFromRequest(request);
  const isAuthenticated = !!rol;

  // 1. Ruta raíz "/" → redirigir según autenticación
  if (pathname === "/") {
    if (isAuthenticated && rol && roleRoutes[rol]) {
      return NextResponse.redirect(new URL(roleRoutes[rol], request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Rutas públicas (login) → si ya está autenticado, ir a su dashboard
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated && rol && roleRoutes[rol]) {
      return NextResponse.redirect(new URL(roleRoutes[rol], request.url));
    }
    return NextResponse.next();
  }

  // 3. Rutas protegidas → verificar autenticación y rol
  for (const [roleKey, basePath] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(basePath)) {
      // No autenticado → login
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Autenticado pero rol incorrecto → redirigir a su dashboard
      if (rol !== roleKey) {
        const correctPath = roleRoutes[rol!];
        if (correctPath) {
          return NextResponse.redirect(new URL(correctPath, request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Rol correcto → continuar
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Matcher: ejecutar middleware solo en rutas relevantes
// Excluye: API routes, archivos estáticos, imágenes, favicon
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
