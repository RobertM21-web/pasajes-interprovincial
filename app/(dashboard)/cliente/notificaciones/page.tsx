"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Ticket,
  Clock,
  RefreshCw,
  AlertCircle
} from "lucide-react";

// Interfaz basada en el modelo de Prisma de Enrique
interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: string; // "INFO", "ALERTA", "EXITO", "RECORDATORIO"
  leida: boolean;
  createdAt: string;
}

interface PaginacionInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export default function NotificacionesClientePage() {
  const [session, setSession] = useState<any>(null);
  const usuarioId = session?.user?.id || "cliente-demo-123"; // Fallback seguro

  // Estados de datos
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [paginacion, setPaginacion] = useState<PaginacionInfo | null>(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtroLeidas, setFiltroLeidas] = useState<"TODAS" | "NO_LEIDAS">("TODAS");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data && data.user) setSession(data);
        else setSession({ user: { id: "cliente-demo-123" } });
      })
      .catch(() => setSession({ user: { id: "cliente-demo-123" } }));
  }, []);

  // Cargar notificaciones (GET)
  const cargarNotificaciones = async (pagina: number = 1, append: boolean = false) => {
    if (pagina === 1) setLoading(true);
    else setLoadingMore(true);
    setError("");

    try {
      // Construir URL con parámetros para Enrique's API
      let url = `/api/cliente/notificaciones?usuarioId=${usuarioId}&page=${pagina}&limit=10`;
      if (filtroLeidas === "NO_LEIDAS") {
        url += `&leida=false`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al obtener las notificaciones.");
      
      const data = await res.json();
      
      if (append) {
        setNotificaciones(prev => [...prev, ...data.notificaciones]);
      } else {
        setNotificaciones(data.notificaciones);
      }
      
      setNoLeidas(data.noLeidas);
      setPaginacion(data.paginacion);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Recargar cuando cambie el filtro
  useEffect(() => {
    cargarNotificaciones(1, false);
  }, [filtroLeidas]);

  // Marcar como leída (PUT)
  const handleMarcarLeida = async (id: string) => {
    try {
      // Actualización optimista en la UI
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));

      const res = await fetch(`/api/cliente/notificaciones/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error();
    } catch (err) {
      // Revertir si falla
      cargarNotificaciones(1, false);
    }
  };

  // Eliminar notificación (DELETE)
  const handleEliminar = async (id: string) => {
    const notificacionAEliminar = notificaciones.find(n => n.id === id);
    
    try {
      // Actualización optimista
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      if (notificacionAEliminar && !notificacionAEliminar.leida) {
        setNoLeidas(prev => Math.max(0, prev - 1));
      }

      const res = await fetch(`/api/cliente/notificaciones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch (err) {
      // Revertir si falla
      cargarNotificaciones(1, false);
    }
  };

  // Función para formatear fechas de manera amigable ("Hace 2 horas", "Ayer")
  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const difMs = ahora.getTime() - fecha.getTime();
    const difMinutos = Math.floor(difMs / 60000);
    const difHoras = Math.floor(difMinutos / 60);
    const difDias = Math.floor(difHoras / 24);

    if (difMinutos < 1) return "Justo ahora";
    if (difMinutos < 60) return `Hace ${difMinutos} min`;
    if (difHoras < 24) return `Hace ${difHoras} ${difHoras === 1 ? 'hora' : 'horas'}`;
    if (difDias === 1) return "Ayer";
    if (difDias < 7) return `Hace ${difDias} días`;
    
    return fecha.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  };

  // Obtener Icono y Color según el tipo de notificación
  const getIconoTipo = (tipo: string) => {
    switch (tipo.toUpperCase()) {
      case "EXITO": return { Icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" };
      case "ALERTA": return { Icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" };
      case "RECORDATORIO": return { Icon: Clock, color: "text-purple-600", bg: "bg-purple-100" };
      case "TICKET": return { Icon: Ticket, color: "text-indigo-600", bg: "bg-indigo-100" };
      default: return { Icon: Info, color: "text-blue-600", bg: "bg-blue-100" };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 font-sans">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="bg-blue-600 p-3 rounded-xl text-white">
              <Bell className="h-6 w-6" />
            </div>
            {noLeidas > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white border-2 border-white shadow-sm">
                {noLeidas > 99 ? '99+' : noLeidas}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis Notificaciones</h1>
            <p className="text-sm text-slate-500">Mantente al tanto de tus viajes y promociones.</p>
          </div>
        </div>

        <button 
          onClick={() => cargarNotificaciones(1, false)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
          title="Actualizar bandeja"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-2.5 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Contenedor Principal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Pestañas de Filtro */}
        <div className="flex border-b border-slate-200 px-2 bg-slate-50/50">
          <button
            onClick={() => setFiltroLeidas("TODAS")}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
              filtroLeidas === "TODAS" 
                ? "border-blue-600 text-blue-700" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Bandeja de Entrada
          </button>
          <button
            onClick={() => setFiltroLeidas("NO_LEIDAS")}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
              filtroLeidas === "NO_LEIDAS" 
                ? "border-blue-600 text-blue-700" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>No Leídas</span>
            {noLeidas > 0 && (
              <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px]">
                {noLeidas}
              </span>
            )}
          </button>
        </div>

        {/* Lista de Notificaciones */}
        <div className="divide-y divide-slate-100">
          {loading && notificaciones.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-sm">Cargando bandeja...</p>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Bandeja Vacía</h3>
              <p className="text-sm text-slate-500">No tienes notificaciones {filtroLeidas === "NO_LEIDAS" ? "nuevas" : "en este momento"}.</p>
            </div>
          ) : (
            notificaciones.map((notif) => {
              const { Icon, color, bg } = getIconoTipo(notif.tipo);
              const isUnread = !notif.leida;

              return (
                <div 
                  key={notif.id} 
                  className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row gap-4 relative hover:bg-slate-50 group ${
                    isUnread ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  {/* Punto Azul de No Leída */}
                  {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                  )}

                  {/* Icono Principal */}
                  <div className="shrink-0 flex items-start pt-1">
                    <div className={`${bg} ${color} p-2.5 rounded-full`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Contenido (Título, Mensaje, Fecha) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm truncate ${isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                        {notif.titulo}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-full">
                        {formatearFecha(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed line-clamp-2 ${isUnread ? "text-slate-700" : "text-slate-500"}`}>
                      {notif.mensaje}
                    </p>
                  </div>

                  {/* Botones de Acción (Visibles en desktop al pasar el mouse, siempre en móvil) */}
                  <div className="flex sm:flex-col sm:justify-start gap-2 shrink-0 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:pl-2">
                    {isUnread && (
                      <button
                        onClick={() => handleMarcarLeida(notif.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        title="Marcar como leída"
                      >
                        <Check className="h-4 w-4" />
                        <span className="sm:hidden">Leída</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(notif.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-1 p-2 text-xs font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sm:hidden">Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Paginación / Cargar Más */}
        {paginacion?.hasMore && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <button
              onClick={() => cargarNotificaciones(paginacion.page + 1, true)}
              disabled={loadingMore}
              className="px-6 py-2 bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition disabled:opacity-50 inline-flex items-center space-x-2"
            >
              {loadingMore ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Cargando...</span>
                </>
              ) : (
                <span>Cargar notificaciones anteriores</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}