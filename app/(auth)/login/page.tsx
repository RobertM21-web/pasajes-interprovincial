"use client";

import { useState } from "react";
import { 
  Bus, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  Info
} from "lucide-react";

// Resolución dinámica de módulos para evitar que falle el compilador estático del Canvas.
// En tu entorno local de Next.js, estas asignaciones importarán automáticamente tus paquetes reales.
const { signIn } = (() => {
  try {
    return require("next-auth/react");
  } catch (e) {
    return { signIn: () => Promise.resolve({ error: "No disponible en vista previa" }) };
  }
})();

const { useRouter } = (() => {
  try {
    return require("next/navigation");
  } catch (e) {
    return { useRouter: () => ({ push: () => {} }) };
  }
})();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Flujo real de NextAuth
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("El correo o la contraseña son incorrectos. Por favor, verifica tus datos.");
      setLoading(false);
      return;
    }

    try {
      // Obtener los datos reales de la sesión para enrutar según el rol de SQL Server
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const rol = session?.user?.rol;

      if (rol === "ADMIN") router.push("/admin");
      else if (rol === "OFICINISTA") router.push("/oficinista");
      else if (rol === "CLIENTE") router.push("/cliente");
      else router.push("/");
    } catch (err) {
      setError("Ocurrió un error al verificar tu sesión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-gray-50 text-gray-900 font-sans">
      
      {/* COLUMNA IZQUIERDA: Panel de Marca (Oculto en móviles, visible en pantallas grandes) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Adorno visual de fondo */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>

        {/* Logo / Cabecera de la Marca */}
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-wider">Cooperativa Fantasma</span>
        </div>

        {/* Mensaje de bienvenida central */}
        <div className="my-auto z-10 max-w-sm">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Viaja cómodo, viaja seguro.
          </h2>
          <p className="mt-4 text-blue-100/90 leading-relaxed text-sm">
            Gestión inteligente de frecuencias, rutas y pasajes interprovinciales en tiempo real. Accede para controlar las operaciones de la cooperativa.
          </p>
        </div>

        {/* Footer del panel izquierdo */}
        <div className="text-xs text-blue-200/60 z-10">
          © 2026 Cooperativa Fantasma S.A. Todos los derechos reservados.
        </div>
      </div>

      {/* COLUMNA DERECHA: El Formulario de Login */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:col-span-7">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 sm:p-10">
          
          {/* Encabezado del Formulario */}
          <div className="mb-8">
            <div className="lg:hidden flex items-center space-x-2 text-blue-600 mb-6">
              <Bus className="h-6 w-6" />
              <span className="font-bold text-lg tracking-wider">Cooperativa Fantasma</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Ingresa tus credenciales autorizadas para acceder al sistema.
            </p>
          </div>

          {/* Formulario principal */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mensaje de Alerta si hay Error */}
            {error && (
              <div className="flex items-start space-x-2.5 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Input de Correo */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@cooperativa.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Input de Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Sección de credenciales de prueba */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-blue-800 font-semibold text-xs mb-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0" />
                <span>ACCESOS RÁPIDOS DE PRUEBA (DEV)</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between border-b border-blue-100/40 pb-1">
                  <span className="font-medium text-gray-500">Admin:</span>
                  <span className="font-mono text-gray-700">admin@cooperativa.com / Admin123!</span>
                </div>
                <div className="flex justify-between border-b border-blue-100/40 pb-1">
                  <span className="font-medium text-gray-500">Oficinista:</span>
                  <span className="font-mono text-gray-700">oficinista@cooperativa.com / Ofici123!</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Cliente:</span>
                  <span className="font-mono text-gray-700">cliente@ejemplo.com / Client123!</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}