"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Bus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const rol = session?.user?.rol;

    if (rol === "ADMIN") router.push("/admin");
    else if (rol === "OFICINISTA") router.push("/oficinista");
    else if (rol === "CLIENTE") router.push("/cliente");
    else router.push("/");
  };

  const fillCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Panel izquierdo — Decorativo (solo desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#1E40AF]" />

        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(245,158,11,0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 animate-fade-in-left">
          {/* Logo grande */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F59E0B] shadow-lg">
              <Bus className="w-9 h-9 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cooperativa de</h1>
              <h1 className="text-2xl font-bold text-[#FCD34D]">Transportes</h1>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Sistema de Gestión
            <br />
            <span className="text-[#FCD34D]">de Pasajes</span>
          </h2>

          <p className="text-lg text-blue-200/80 max-w-md leading-relaxed mb-10">
            Plataforma integral para la gestión y venta de boletos de transporte interprovincial.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              "Venta de boletos en línea y ventanilla",
              "Selección visual de asientos",
              "Boleto digital con código QR",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F59E0B]/20">
                  <svg className="w-3.5 h-3.5 text-[#FCD34D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-blue-100/90 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Panel derecho — Formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#1E40AF] shadow-md">
              <Bus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">Cooperativa de Transportes</h1>
              <p className="text-xs text-[var(--text-muted)]">Sistema de Pasajes</p>
            </div>
          </div>

          {/* Encabezado del form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div
                className={`flex items-center gap-2 bg-[var(--error-light)] border border-red-200 text-[var(--error)] px-4 py-3 rounded-lg text-sm ${
                  shakeError ? "animate-shake" : ""
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1E40AF] text-white py-3 rounded-lg font-semibold hover:bg-[#1E3A8A] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Credenciales de prueba */}
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="flex items-center justify-between w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <span>Credenciales de prueba</span>
              {showCredentials ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showCredentials && (
              <div className="mt-3 space-y-2 animate-fade-in">
                {[
                  { label: "Admin", email: "admin@cooperativa.com", password: "Admin123!", color: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
                  { label: "Oficinista", email: "oficinista@cooperativa.com", password: "Ofici123!", color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
                  { label: "Cliente", email: "cliente@ejemplo.com", password: "Client123!", color: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
                ].map((cred) => (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => fillCredentials(cred.email, cred.password)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${cred.color}`}
                  >
                    <span className="font-semibold text-[var(--text-primary)]">{cred.label}:</span>{" "}
                    <span className="text-[var(--text-secondary)]">{cred.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
