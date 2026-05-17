"use client";

import { useState } from "react";
import { 
  Bus, 
  Lock, 
  Mail, 
  User, 
  Check, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Ticket
} from "lucide-react";

// Resolución dinámica de módulos para evitar que falle el compilador estático del Canvas.
const { useRouter } = (() => {
  try {
    return require("next/navigation");
  } catch (e) {
    return { useRouter: () => ({ push: () => {} }) };
  }
})();

export default function RegisterPage() {
  const router = useRouter();
  
  // Estados del Formulario
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados de interfaz
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  //validacion de cedula 
    const validarCedulaEcuatoriana = (num: string) => {
    const digitos = num.trim();
    if (digitos.length !== 10) return false;
    
    // Verificación rápida de patrón numérico
    if (!/^\d+$/.test(digitos)) return false;

    // Algoritmo de verificación de cédula ecuatoriana (Método de los coeficientes 2.1.2.1)
    const provincia = parseInt(digitos.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(digitos[2], 10);
    if (tercerDigito >= 6) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(digitos[i], 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }

    const digitoVerificador = parseInt(digitos[9], 10);
    const decenaSuperior = Math.ceil(suma / 10) * 10;
    let resultado = decenaSuperior - suma;
    if (resultado === 10) resultado = 0;

    return resultado === digitoVerificador;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Validaciones del lado del cliente antes de enviar a la Base de Datos
    if (nombre.trim().length < 4) {
      setError("Por favor, ingresa tu nombre y apellido completo.");
      setLoading(false);
      return;
    }

    if (!validarCedulaEcuatoriana(cedula)) {
      setError("El número de cédula ingresado no es válido para Ecuador (debe tener 10 dígitos numéricos válidos).");
      setLoading(false);
      return;
    }

    if (telefono.trim().length < 9 || !/^\d+$/.test(telefono)) {
      setError("Por favor, ingresa un número de teléfono celular válido (Ej. 0998765432).");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      setLoading(false);
      return;
    }

    // Reglas de Contraseña Fuertes (Estándar de Seguridad)
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneMinuscula = /[a-z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    const tieneEspecial = /[^A-Za-z0-9]/.test(password); // Carácter que no sea número ni letra

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres de longitud.");
      setLoading(false);
      return;
    }

    if (!tieneMayuscula || !tieneMinuscula || !tieneNumero || !tieneEspecial) {
      setError(
        "La contraseña es demasiado débil. Debe contener obligatoriamente al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (ej. !@#$*)."
      );
      setLoading(false);
      return;
    }
  };



  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-gray-50 text-gray-900 font-sans">
      
      {/* COLUMNA IZQUIERDA: Beneficios del Pasajero (Oculto en móviles) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>

        {/* Logo */}
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-wider">Cooperativa Fantasma
          </span>
        </div>

        {/* Beneficios de registrarse */}
        <div className="my-auto z-10 space-y-8 max-w-sm">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Únete como Pasajero
            </h2>
            <p className="mt-3 text-blue-100 text-sm leading-relaxed">
              Crea tu cuenta personal en pocos pasos y accede a una nueva experiencia de viaje interprovincial.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg shrink-0">
                <Ticket className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Reserva tus Asientos con Anticipación</h4>
                <p className="text-xs text-blue-200 mt-1">Elige tu ubicación, hora y destino</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg shrink-0">
                <CreditCard className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Pagos Rápidos y Seguros</h4>
                <p className="text-xs text-blue-200 mt-1">Sube tus comprobantes de transferencia directa y viaja sin complicaciones.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg shrink-0">
                <ShieldCheck className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Boletos Digitales con QR</h4>
                <p className="text-xs text-blue-200 mt-1">Recibe tus pasajes en formato digital. Súbete al bus escaneando tu código desde el celular.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-blue-200/60 z-10">
          © 2026 Cooperativa Trans-Eclipse S.A. Todos los derechos reservados.
        </div>
      </div>

      {/* COLUMNA DERECHA: El Formulario de Registro */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:col-span-7 overflow-y-auto">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 sm:p-10 my-6">
          
          {/* Encabezado */}
          <div className="mb-6">
            <div className="lg:hidden flex items-center space-x-2 text-blue-600 mb-6">
              <Bus className="h-6 w-6" />
              <span className="font-bold text-lg tracking-wider">TRANS-ECLIPSE</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Crear Cuenta
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Regístrate para comprar pasajes en línea y gestionar tus viajes de manera inteligente.
            </p>
          </div>

          {/* Formulario principal */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Mensajes de Alerta */}
            {error && (
              <div className="flex items-start space-x-2.5 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-start space-x-2.5 animate-fade-in">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">¡Registro Exitoso!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Tu cuenta de Pasajero ha sido creada con éxito. Redirigiendo al inicio de sesión...</p>
                </div>
              </div>
            )}

            {/* Fila 1: Nombre y Cédula */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cedula" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Cédula Ecuatoriana
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4.5 w-4.5" /> {/* Reemplazo temporal si CheckId no está en lucide */}
                  </div>
                  <input
                    id="cedula"
                    type="text"
                    maxLength={10}
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))} // Solo números
                    required
                    placeholder="Ej. 1801234567"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Teléfono y Correo */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="telefono" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Celular de Contacto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="telefono"
                    type="tel"
                    maxLength={15}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} // Solo números
                    required
                    placeholder="Ej. 0998765432"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email Personal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Fila 3: Contraseña y Confirmación */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mín. 8 caracteres (A, a, 1, #)"
                    className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-xs placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repite tu contraseña"
                    className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de envío con autobús animado global de globals.css */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 text-white h-12 rounded-xl font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition duration-200 flex items-center justify-center overflow-hidden disabled:opacity-90 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center w-full relative">
                  <div className="relative w-40 h-5 overflow-hidden flex items-center justify-start">
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] border-b border-dashed border-white/50"></div>
                    <Bus className="h-4.5 w-4.5 text-white absolute bottom-[2px] animate-bus-drive" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-200 mt-1 animate-pulse">
                    Registrando Pasajero...
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Completar Registro</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>


        </div>
      </div>

    </div>
  );
}