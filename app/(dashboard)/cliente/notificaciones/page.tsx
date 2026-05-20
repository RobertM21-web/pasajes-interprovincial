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
      </div>
    </div>
  );
}