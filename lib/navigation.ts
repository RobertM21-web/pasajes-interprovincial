import {
  LayoutDashboard,
  Bus,
  Clock,
  Armchair,
  Users,
  Shield,
  Settings,
  FileText,
  Ticket,
  CreditCard,
  QrCode,
  Search,
  History,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: NavItem[] = [
  { label: "Inicio", href: "/admin", icon: LayoutDashboard },
  { label: "Buses", href: "/admin/buses", icon: Bus },
  { label: "Frecuencias", href: "/admin/frecuencias", icon: Clock },
  { label: "Categorías de Asiento", href: "/admin/categorias-asiento", icon: Armchair },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Roles y Permisos", href: "/admin/roles", icon: Shield },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export const oficinistaNavItems: NavItem[] = [
  { label: "Inicio", href: "/oficinista", icon: LayoutDashboard },
  { label: "Hojas de Ruta", href: "/oficinista/hoja-ruta", icon: FileText },
  { label: "Vender Boletos", href: "/oficinista/venta", icon: Ticket },
  { label: "Validar Pagos", href: "/oficinista/validar-pagos", icon: CreditCard },
  { label: "Validar Abordaje", href: "/oficinista/validar-abordaje", icon: QrCode },
];

export const clienteNavItems: NavItem[] = [
  { label: "Inicio", href: "/cliente", icon: LayoutDashboard },
  { label: "Comprar Pasajes", href: "/cliente/compra-online", icon: Search },
  { label: "Historial", href: "/cliente/historial", icon: History },
];

export function getNavItemsByRole(rol: string): NavItem[] {
  switch (rol) {
    case "ADMIN":
      return adminNavItems;
    case "OFICINISTA":
      return oficinistaNavItems;
    case "CLIENTE":
      return clienteNavItems;
    default:
      return [];
  }
}

export function getRolLabel(rol: string): string {
  switch (rol) {
    case "ADMIN":
      return "Administrador";
    case "OFICINISTA":
      return "Oficinista";
    case "CLIENTE":
      return "Cliente";
    default:
      return rol;
  }
}

export function getRolColor(rol: string): {
  bg: string;
  text: string;
  accent: string;
  accentHover: string;
  badge: string;
} {
  return {
    bg: "bg-slate-800",
    text: "text-white",
    accent: "bg-blue-600",
    accentHover: "hover:bg-blue-700",
    badge: "bg-blue-50 text-blue-700",
  };
}
