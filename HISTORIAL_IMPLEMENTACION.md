<!-- IMPLEMENTACIÓN: Página de Historial de Compras del Cliente -->

# Historial de Compras - Guía de Implementación

## 📍 Ubicación
- **Página Principal**: `app/(dashboard)/cliente/historial/page.tsx`
- **Ruta de acceso**: `/cliente/historial?usuarioId=<uuid>`
- **Grupo de rutas**: `(dashboard)` - Estructure protegida para el dashboard

## 🏗️ Estructura de archivos creados

```
app/
├── (dashboard)/                    # Grupo de rutas protegidas
│   ├── layout.tsx                 # Layout base del dashboard
│   ├── cliente/
│   │   ├── layout.tsx             # Layout específico del cliente
│   │   └── historial/
│   │       ├── page.tsx           # 📄 Página principal (Server Component)
│   │       ├── boleto-card.tsx    # 🎴 Componente de tarjeta de boleto
│   │       ├── estado-badge.tsx   # 🏷️ Badge de estado
│   │       ├── empty-state.tsx    # 📭 Estado vacío
│   │       └── estado-filter.tsx  # 🔍 Filtro de estados (Client Component)
│
lib/
├── formatters.ts                  # ✨ Funciones de formateo (fechas, moneda, horas)
└── constants.ts                   # 🎯 Constantes y configuraciones
```

## 🔧 Helpers y utilidades creadas

### `lib/formatters.ts`
Funciones para formatear datos al español (Ecuador):
- `formatFecha(date)` → "20 de mayo de 2026"
- `formatFechaCorta(date)` → "20/05/2026"
- `formatHora(time)` → "14:00"
- `formatMoneda(amount)` → "$15.50"
- `diasTranscurridos(from, to)` → número de días
- `formatDuracion(minutes)` → "2h 30m"
- `formatFechaHora(date)` → "20 de mayo de 2026, 14:00"

### `lib/constants.ts`
Configuración centralizada:
- `BOLETO_ESTADOS` - Estados con estilos Tailwind
  - PENDIENTE → amarillo
  - PAGADO → verde claro
  - ABORDADO → azul
  - CANCELADO → rojo
  - NO_ABORDADO → naranja
- `TIPOS_PASAJERO` - Tipos de pasajeros
- `METODOS_PAGO` - Métodos de pago
- `CANALES_VENTA` - Canales de venta
- `POSICIONES_ASIENTO` - Posiciones de asiento

## 🎨 Componentes reutilizables

### `BoletoCard`
**Tarjeta individual de boleto**
- Muestra origen → destino
- Información del bus
- Fecha de compra
- Número y categoría de asiento
- Nombre del pasajero
- Precio pagado
- Estado con badge
- Botón "Ver boleto" (navega a `/cliente/boletos/[id]`)

### `EstadoBadge`
**Badge de estado con color dinámico**
- Usa configuración de `BOLETO_ESTADOS`
- Colores automáticos según estado
- Reutilizable en cualquier contexto

### `EmptyState`
**Estado vacío personalizable**
- Ícono sugestivo
- Mensaje personalizable
- Botón CTA a búsqueda de pasajes

### `EstadoFilter`
**Filtro de estados (Client Component)**
- Tabs de estados disponibles
- Mantiene otros query params
- Botón "Todos"
- Reset a página 1 al cambiar filtro

## 📊 Flujo de datos

```
Usuario → Query /api/cliente/historial?usuarioId=xxx&estado=PAGADO
                         ↓
                   [Server Component]
                         ↓
                   Obtiene boletos con:
                   - include: { ruta.frecuencia, asiento.categoria }
                   - orderBy: { createdAt: 'desc' }
                   - where: { estado, createdAt }
                         ↓
              [Renderiza BoletoCard x N]
```

## 🚀 Cómo usar

### Acceso a la página
```
GET /cliente/historial?usuarioId=550e8400-e29b-41d4-a716-446655440000
```

**Parámetros opcionales**:
- `estado` - Filtrar por estado (PAGADO, CANCELADO, PENDIENTE, ABORDADO, NO_ABORDADO)
- `page` - Número de página (default: 1)

### Ejemplos
```
/cliente/historial?usuarioId=xxx
/cliente/historial?usuarioId=xxx&estado=PAGADO
/cliente/historial?usuarioId=xxx&estado=CANCELADO&page=2
```

## 🔐 TODO: Integración con NextAuth

En producción, reemplazar:

```typescript
const usuarioId = params.usuarioId || "";
```

Con:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  redirect("/auth/login");
}
const usuarioId = session.user.id;
```

También validar el rol CLIENTE en `app/(dashboard)/cliente/layout.tsx`.

## 🎯 Características implementadas

✅ **Server Component** - Obtiene datos en el servidor
✅ **Relaciones Prisma** - Incluye ruta, frecuencia, asiento, categoría
✅ **Filtro por estado** - Tabs interactivos
✅ **Paginación** - Info de páginas
✅ **Empty state** - Mensaje cuando sin boletos
✅ **Responsive design** - Grid adaptable (1 col mobile, 2 tablet, 3 desktop)
✅ **Formateo de datos** - Fechas y moneda localizadas
✅ **Suspense + Loading** - Placeholder mientras carga
✅ **Error handling** - Manejo de errores API
✅ **Badges de estado** - Colores según estado
✅ **TypeScript** - Tipado estricto
✅ **Componentes reutilizables** - Fácil de mantener
✅ **Estilos Tailwind** - Consistentes con el proyecto

## 🔗 Relaciones con otros archivos

- **API**: `app/api/cliente/historial/route.ts` - Endpoint que obtiene los boletos
- **Prisma**: `prisma/schema.prisma` - Modelos Boleto, Ruta, Frecuencia, Asiento, Categoria
- **Layout root**: `app/layout.tsx` - Variables CSS y configuración global
- **Globals**: `app/globals.css` - Estilos globales Tailwind

## 📝 Notas de implementación

1. **Sin estilos inline** - Todo con clases Tailwind
2. **Componentes modularizados** - Cada componente es independiente y reutilizable
3. **Patrón de colores dinámico** - Los badges usan colores desde `BOLETO_ESTADOS`
4. **Fetch con revalidación** - Cache de 60 segundos para rendimiento
5. **Placeholder skeleton** - Suspense con 3 tarjetas de carga
6. **Responsive** - Mobile-first, tablet y desktop
7. **Accesibilidad** - HTML semántico, buen contraste

## 🧪 Testing manual

1. Accede a `/cliente/historial?usuarioId=<uuid-valido>`
2. Verifica que se muestren los boletos
3. Prueba filtro por estado (tabs)
4. Verifica empty state si no hay boletos
5. Comprueba formateo de fechas y moneda
6. Haz click en "Ver boleto" (irá a `/cliente/boletos/[id]` - falta implementar)

## 🔮 Próximos pasos

- [ ] Implementar autenticación con NextAuth
- [ ] Crear página de detalle de boleto (`/cliente/boletos/[id]`)
- [ ] Agregar descarga de comprobante/QR
- [ ] Agregar búsqueda por pasajero, código, etc.
- [ ] Implementar paginación con botones Anterior/Siguiente
- [ ] Agregar ordenamiento (fecha, precio, estado)
- [ ] Exportar a PDF/Excel
