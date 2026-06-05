import { prisma } from "@/lib/prisma";
import SalesChart from "./SalesChart";
import { Bus, Ticket, DollarSign, PieChart } from "lucide-react";

export default async function AdminPage() {
  // 1. Total buses activos
  const busesActivos = await prisma.bus.count({
    where: { activo: true },
  });

  // 2. Boletos vendidos hoy
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const boletosHoy = await prisma.boleto.count({
    where: {
      createdAt: { gte: startOfToday },
      estado: { in: ['PAGADO', 'ABORDADO'] },
    },
  });

  // 3. Ingresos del mes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const ingresosMesResult = await prisma.boleto.aggregate({
    _sum: { precioFinal: true },
    where: {
      createdAt: { gte: startOfMonth },
      estado: { in: ['PAGADO', 'ABORDADO'] },
    },
  });
  const ingresosMes = Number(ingresosMesResult._sum.precioFinal || 0);

  // 4. Ocupacion promedio por ruta
  const rutasActivas = await prisma.ruta.findMany({
    where: { estado: { not: 'CANCELADA' } },
    include: {
      bus: true,
      _count: {
        select: { boletos: { where: { estado: { in: ['PAGADO', 'ABORDADO'] } } } },
      },
    },
  });

  let totalAsientos = 0;
  let totalBoletosVendidos = 0;

  for (const ruta of rutasActivas) {
    totalAsientos += ruta.bus.totalAsientos;
    totalBoletosVendidos += ruta._count.boletos;
  }

  const ocupacionPromedio = totalAsientos > 0 
    ? ((totalBoletosVendidos / totalAsientos) * 100).toFixed(1) 
    : "0.0";

  // 5. Gráfico de ventas por día (últimos 7 días)
  const startOf7Days = new Date();
  startOf7Days.setDate(startOf7Days.getDate() - 6);
  startOf7Days.setHours(0, 0, 0, 0);

  const boletosSemana = await prisma.boleto.findMany({
    where: {
      createdAt: { gte: startOf7Days },
      estado: { in: ['PAGADO', 'ABORDADO'] },
    },
    select: {
      createdAt: true,
      precioFinal: true,
    },
  });

  const ventasPorDiaMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' });
    ventasPorDiaMap.set(dayStr, { name: dayStr, total: 0, cantidad: 0 });
  }

  for (const boleto of boletosSemana) {
    const dayStr = boleto.createdAt.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit' });
    if (ventasPorDiaMap.has(dayStr)) {
      const stat = ventasPorDiaMap.get(dayStr);
      stat.total += Number(boleto.precioFinal);
      stat.cantidad += 1;
    }
  }

  const ventasPorDia = Array.from(ventasPorDiaMap.values());

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Administracion</h1>
        <p className="text-gray-500 mt-1">
          Resumen general y estadisticas de la cooperativa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Buses Activos" 
          value={busesActivos.toString()} 
          icon={<Bus className="h-6 w-6 text-blue-600" />} 
          trend="En operacion"
        />
        <DashboardCard 
          title="Boletos Hoy" 
          value={boletosHoy.toString()} 
          icon={<Ticket className="h-6 w-6 text-emerald-600" />} 
          trend="Ventas de hoy"
        />
        <DashboardCard 
          title="Ingresos del Mes" 
          value={`$${ingresosMes.toFixed(2)}`} 
          icon={<DollarSign className="h-6 w-6 text-amber-600" />} 
          trend="Total recaudado"
        />
        <DashboardCard 
          title="Ocupacion Promedio" 
          value={`${ocupacionPromedio}%`} 
          icon={<PieChart className="h-6 w-6 text-purple-600" />} 
          trend="Por ruta"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Ventas de los ultimos 7 dias</h2>
          <p className="text-sm text-gray-500">Ingresos generados por dia en la ultima semana.</p>
        </div>
        <SalesChart data={ventasPorDia} />
      </div>
    </section>
  );
}

function DashboardCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col justify-between hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500 flex items-center">
        {trend}
      </div>
    </div>
  );
}
