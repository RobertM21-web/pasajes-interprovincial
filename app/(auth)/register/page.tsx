"use client";

import { useState, useCallback } from "react";
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
  Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { validarCampo, validarCedulaEcuador } from "@/lib/validaciones";

// ─── helpers de estilo reutilizables ───────────────────────
function inputClasses(error: string, valid: boolean): string {
  const base =
    "w-full pl-10 pr-4 py-2.5 rounded-xl outline-none transition text-sm focus:bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 border";
  if (error)
    return `${base} border-red-500 bg-red-50/30 focus:ring-red-500/20 focus:border-red-500`;
  if (valid)
    return `${base} border-emerald-400 bg-emerald-50/20 focus:ring-emerald-500/20 focus:border-emerald-500`;
  return `${base} border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:ring-blue-500/20 focus:border-blue-500`;
}

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] font-medium text-red-600 mt-1 animate-fade-in">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

function FieldSuccess({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1 animate-fade-in">
      <Check className="h-3 w-3 shrink-0" />
      Válido
    </p>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  // ─── valores del formulario ───────────────────────────────
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ─── errores inline por campo ─────────────────────────────
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  // ─── ui ──────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ─── email async ─────────────────────────────────────────
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [emailDisponible, setEmailDisponible] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState("");

  // ─── validación por campo al escribir ─────────────────────
  const validarCampoDinamico = useCallback(
    (campo: string, valor: string) => {
      let msg = "";
      switch (campo) {
        case "nombre":
          msg = validarCampo.nombre(valor);
          break;
        case "cedula":
          msg = validarCampo.cedula(valor);
          break;
        case "telefono":
          msg = validarCampo.telefono(valor);
          break;
        case "email":
          msg = validarCampo.email(valor);
          break;
        case "password":
          msg = validarCampo.password(valor);
          break;
        case "confirmPassword":
          msg =
            valor !== password ? "Las contraseñas no coinciden" : "";
          break;
      }
      setErrores((prev) => ({ ...prev, [campo]: msg }));
    },
    [password]
  );

  const marcarTocado = (campo: string) =>
    setTocados((prev) => ({ ...prev, [campo]: true }));

  const isValid = (campo: string, valor: string) =>
    tocados[campo] && !errores[campo] && valor.length > 0;

  // ─── verificación async de email duplicado ─────────────────
  const verificarCorreoExistente = async (correo: string) => {
    const emailLimpio = correo.trim();
    if (!emailLimpio || validarCampo.email(emailLimpio)) return;

    setVerificandoEmail(true);
    setEmailError("");
    setEmailDisponible(null);

    try {
      const res = await fetch(
        `/api/auth/check-email?email=${encodeURIComponent(emailLimpio)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.disponible === false) {
        setEmailDisponible(false);
        setEmailError("Este correo ya está registrado en la cooperativa.");
      } else {
        setEmailDisponible(true);
        setEmailError("");
      }
    } catch {
      setEmailError("No se pudo verificar la disponibilidad del correo.");
      setEmailDisponible(null);
    } finally {
      setVerificandoEmail(false);
    }
  };

  // ─── medidor de fuerza de contraseña ──────────────────────
  const obtenerFuerzaPassword = (pass: string) => {
    if (!pass)
      return {
        score: 0,
        label: "Sin contraseña",
        color: "bg-gray-200",
        textColor: "text-gray-400",
        width: "w-0",
      };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 2)
      return {
        score,
        label: "Débil",
        color: "bg-red-500",
        textColor: "text-red-500",
        width: "w-1/3",
      };
    if (score <= 4)
      return {
        score,
        label: "Media",
        color: "bg-amber-500",
        textColor: "text-amber-500",
        width: "w-2/3",
      };
    return {
      score,
      label: "Fuerte",
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      width: "w-full",
    };
  };

  const fuerza = obtenerFuerzaPassword(password);

  // ─── hay algún error de campo o el email no está disponible ─
  const hayErroresCampos =
    Object.values(errores).some((e) => e !== "") ||
    emailDisponible === false;

  // ─── submit ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Marcar todos los campos como tocados para mostrar errores
    const todosTocados = {
      nombre: true,
      cedula: true,
      telefono: true,
      email: true,
      password: true,
      confirmPassword: true,
    };
    setTocados(todosTocados);

    // Calcular errores para todos los campos
    const nuevosErrores: Record<string, string> = {
      nombre: validarCampo.nombre(nombre),
      cedula: validarCampo.cedula(cedula),
      telefono: validarCampo.telefono(telefono),
      email: validarCampo.email(email),
      password: validarCampo.password(password),
      confirmPassword:
        confirmPassword !== password ? "Las contraseñas no coinciden" : "",
    };
    setErrores(nuevosErrores);

    const tieneErrores = Object.values(nuevosErrores).some((e) => e !== "");
    if (tieneErrores) {
      setSubmitError(
        "Por favor corrige los errores marcados antes de continuar."
      );
      return;
    }

    if (emailDisponible === false) {
      setSubmitError(
        "No puedes registrarte con un correo que ya existe en la base de datos."
      );
      return;
    }

    if (fuerza.score < 5) {
      setSubmitError(
        "La contraseña no cumple con todos los criterios de seguridad."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          cedula,
          telefono,
          email,
          password,
          rolId: "c10373a9-cb16-4200-b8c0-1038edd93079",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al registrar el usuario.");
      }

      setSuccess(true);
      setLoading(false);

      setNombre(""); setCedula(""); setTelefono("");
      setEmail(""); setPassword(""); setConfirmPassword("");

      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setSubmitError(err.message || "Hubo un problema de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-gray-50 text-gray-900 font-sans">

      {/* COLUMNA IZQUIERDA */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="flex items-center space-x-3 z-10">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-wider">Cooperativa Fantasma</span>
        </div>

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
            {[
              { icon: Ticket, title: "Reserva tus Asientos con Anticipación", desc: "Elige tu ubicación, hora y destino" },
              { icon: CreditCard, title: "Pagos Rápidos y Seguros", desc: "Sube tus comprobantes de transferencia directa." },
              { icon: ShieldCheck, title: "Boletos Digitales con QR", desc: "Súbete al bus escaneando tu código desde el celular." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start space-x-4">
                <div className="bg-white/10 p-2 rounded-lg shrink-0">
                  <Icon className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <p className="text-xs text-blue-200 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-blue-200/60 z-10">
          © 2026 Cooperativa Fantasma. Todos los derechos reservados.
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:col-span-7 overflow-y-auto">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 sm:p-10 my-6">

          <div className="mb-6">
            <div className="lg:hidden flex items-center space-x-2 text-blue-600 mb-6">
              <Bus className="h-6 w-6" />
              <span className="font-bold text-lg tracking-wider">Cooperativa Fantasma</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Crear Cuenta</h1>
            <p className="text-sm text-gray-500 mt-2">
              Regístrate para comprar pasajes en línea y gestionar tus viajes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* ── Banner errores al submit ── */}
            {submitError && (
              <div className="flex items-start space-x-2.5 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-start space-x-2.5 animate-fade-in">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">¡Registro Exitoso!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...
                  </p>
                </div>
              </div>
            )}

            {/* ── Fila 1: Nombre y Cédula ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      validarCampoDinamico("nombre", e.target.value);
                    }}
                    onBlur={() => marcarTocado("nombre")}
                    placeholder="Ej. Juan Pérez"
                    className={inputClasses(tocados.nombre ? errores.nombre : "", isValid("nombre", nombre))}
                  />
                </div>
                {tocados.nombre && errores.nombre
                  ? <FieldError msg={errores.nombre} />
                  : <FieldSuccess show={isValid("nombre", nombre)} />
                }
              </div>

              {/* Cédula */}
              <div className="space-y-1.5">
                <label htmlFor="cedula" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Cédula Ecuatoriana <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <input
                    id="cedula"
                    type="text"
                    maxLength={10}
                    value={cedula}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setCedula(val);
                      validarCampoDinamico("cedula", val);
                    }}
                    onBlur={() => marcarTocado("cedula")}
                    placeholder="Ej. 1801234567"
                    className={`font-mono ${inputClasses(tocados.cedula ? errores.cedula : "", isValid("cedula", cedula))}`}
                  />
                </div>
                {tocados.cedula && errores.cedula
                  ? <FieldError msg={errores.cedula} />
                  : <FieldSuccess show={isValid("cedula", cedula)} />
                }
              </div>
            </div>

            {/* ── Fila 2: Teléfono y Correo ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Teléfono */}
              <div className="space-y-1.5">
                <label htmlFor="telefono" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Celular de Contacto <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="telefono"
                    type="tel"
                    maxLength={10}
                    value={telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setTelefono(val);
                      validarCampoDinamico("telefono", val);
                    }}
                    onBlur={() => marcarTocado("telefono")}
                    placeholder="Ej. 0998765432"
                    className={`font-mono ${inputClasses(tocados.telefono ? errores.telefono : "", isValid("telefono", telefono))}`}
                  />
                </div>
                {tocados.telefono && errores.telefono
                  ? <FieldError msg={errores.telefono} />
                  : <FieldSuccess show={isValid("telefono", telefono)} />
                }
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email Personal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validarCampoDinamico("email", e.target.value);
                      setEmailDisponible(null);
                      setEmailError("");
                    }}
                    onBlur={() => {
                      marcarTocado("email");
                      verificarCorreoExistente(email);
                    }}
                    placeholder="ejemplo@correo.com"
                    className={inputClasses(
                      tocados.email && (errores.email || emailError) ? errores.email || emailError : "",
                      !!emailDisponible && !errores.email
                    )}
                  />
                  {verificandoEmail && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>
                {tocados.email && errores.email
                  ? <FieldError msg={errores.email} />
                  : emailError
                  ? <FieldError msg={emailError} />
                  : emailDisponible === true
                  ? <p className="text-[11px] font-medium text-emerald-600 mt-1 animate-fade-in flex items-center gap-1">
                      <Check className="h-3 w-3" /> Correo disponible
                    </p>
                  : null
                }
              </div>
            </div>

            {/* ── Fila 3: Contraseñas ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Contraseña */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validarCampoDinamico("password", e.target.value);
                      // Revalidar confirmación si ya fue tocada
                      if (tocados.confirmPassword) {
                        setErrores((prev) => ({
                          ...prev,
                          confirmPassword:
                            confirmPassword !== e.target.value
                              ? "Las contraseñas no coinciden"
                              : "",
                        }));
                      }
                    }}
                    onBlur={() => marcarTocado("password")}
                    placeholder="Mín. 8 caracteres (A, a, 1, #)"
                    className={`w-full px-4 pr-10 py-2.5 border rounded-xl outline-none transition text-sm placeholder:text-xs placeholder:text-gray-400 text-gray-900 ${
                      tocados.password && errores.password
                        ? "border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-500/20"
                        : isValid("password", password)
                        ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {tocados.password && errores.password && <FieldError msg={errores.password} />}

                {/* Medidor de fuerza */}
                {password && (
                  <div className="mt-2.5 space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center text-[10px] font-semibold tracking-wider">
                      <span className="text-gray-400 uppercase">Seguridad:</span>
                      <span className={fuerza.textColor}>{fuerza.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${fuerza.color} transition-all duration-300 ease-out ${fuerza.width}`} />
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[9px] text-gray-400 font-medium">
                      <span className={password.length >= 8 ? "text-emerald-600 font-bold" : ""}>• 8+ Carac.</span>
                      <span className={/[A-Z]/.test(password) ? "text-emerald-600 font-bold" : ""}>• Mayúsc.</span>
                      <span className={/[0-9]/.test(password) ? "text-emerald-600 font-bold" : ""}>• Números</span>
                      <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-600 font-bold" : ""}>• Espec.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validarCampoDinamico("confirmPassword", e.target.value);
                    }}
                    onBlur={() => marcarTocado("confirmPassword")}
                    placeholder="Repite tu contraseña"
                    className={`w-full px-4 pr-10 py-2.5 border rounded-xl outline-none transition text-sm text-gray-900 placeholder:text-gray-400 ${
                      tocados.confirmPassword && errores.confirmPassword
                        ? "border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-500/20"
                        : isValid("confirmPassword", confirmPassword) && confirmPassword === password
                        ? "border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {tocados.confirmPassword && errores.confirmPassword
                  ? <FieldError msg={errores.confirmPassword} />
                  : tocados.confirmPassword && confirmPassword === password && confirmPassword
                  ? <FieldSuccess show />
                  : null
                }
              </div>
            </div>

            {/* ── Términos ── */}
            <div className="flex items-start space-x-2 pt-1 text-xs text-gray-500 leading-relaxed">
              <input type="checkbox" required className="mt-0.5 border-gray-300 rounded text-blue-600 focus:ring-blue-500" />
              <span>
                Acepto los términos de servicio, política de privacidad y autorizo el tratamiento seguro de mis datos personales.
              </span>
            </div>

            {/* ── Botón submit ── */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 text-white h-12 rounded-xl font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition duration-200 flex items-center justify-center overflow-hidden disabled:opacity-90 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center w-full relative">
                  <div className="relative w-40 h-5 overflow-hidden flex items-center justify-start">
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] border-b border-dashed border-white/50" />
                    <Bus className="h-4 w-4 text-white absolute bottom-[2px] animate-bus-drive" />
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes una cuenta registrada?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:text-blue-800 font-semibold transition hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}