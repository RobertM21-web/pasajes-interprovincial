import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await prisma.configuracion.findFirst();

  return {
    title: config?.nombreCooperativa || "Sistema de Pasajes - Cooperativa de Transporte",
    description: "Sistema de gestión y venta de pasajes interprovincial",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await prisma.configuracion.findFirst();

  const colorPrimario = config?.colorPrimario || "#2563eb";
  const colorSecundario = config?.colorSecundario || "#1d4ed8";

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={
          {
            ["--color-primary" as string]: colorPrimario,
            ["--color-secondary" as string]: colorSecundario,
          } as React.CSSProperties
        }
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}