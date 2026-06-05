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
  switch (rol) {
    case "ADMIN":
      return {
        bg: "bg-[#0F172A]",
        text: "text-white",
        accent: "bg-blue-600",
        accentHover: "hover:bg-blue-500",
        badge: "bg-blue-500/20 text-blue-300",
      };
    case "OFICINISTA":
      return {
        bg: "bg-emerald-900",
        text: "text-white",
        accent: "bg-emerald-600",
        accentHover: "hover:bg-emerald-500",
        badge: "bg-emerald-500/20 text-emerald-300",
      };
    case "CLIENTE":
      return {
        bg: "bg-amber-900",
        text: "text-white",
        accent: "bg-amber-600",
        accentHover: "hover:bg-amber-500",
        badge: "bg-amber-500/20 text-amber-300",
      };
    default:
      return {
        bg: "bg-gray-900",
        text: "text-white",
        accent: "bg-gray-600",
        accentHover: "hover:bg-gray-500",
        badge: "bg-gray-500/20 text-gray-300",
      };
  }
}
