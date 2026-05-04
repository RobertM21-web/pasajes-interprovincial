import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas protegidas por rol
const roleRoutes: Record<string, string> = {
  ADMIN: "/admin",
  OFICINISTA: "/oficinista",
  CLIENTE: "/cliente",
};

// Rutas públicas que no necesitan autenticación
const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Usar getToken de NextAuth para desencriptar correctamente la cookie JWE
  const token = await getToken({ req: request });
  const rol = token?.rol as string | undefined;
  const isAuthenticated = !!token;

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
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
