<!-- IMPLEMENTACIÓN: Página de Historial de Compras del Cliente -->

# Historial de Compras - Guía de Implementación

## 📍 Ubicación
- **Página Principal**: `app/(dashboard)/cliente/historial/page.tsx` (Client Component)
- **Ruta de acceso**: `/cliente/historial` (sin query params, más seguro)
- **API Endpoint**: `/api/boletos/historial?usuarioId=<uuid>&estado=PAGADO&page=1`
- **Grupo de rutas**: `(dashboard)` - Estructura protegida para el dashboard

## 🏗️ Estructura de archivos creados

```
app/
├── api/
│   └── boletos/
│       └── historial/
│           └── route.ts         # 🔄 Nuevo endpoint (obtiene usuarioId de NextAuth)
│
├── (dashboard)/
│   ├── layout.tsx               # Layout base del dashboard
│   ├── cliente/
│   │   ├── layout.tsx           # Layout específico del cliente
│   │   └── historial/
│   │       ├── page.tsx         # 📄 Página principal (NOW: Client Component)
│   │       ├── boleto-card.tsx  # 🎴 Tarjeta de boleto (mejorada con botones)
│   │       ├── estado-badge.tsx # 🏷️ Badge de estado
│   │       ├── empty-state.tsx  # 📭 Estado vacío
│   │       ├── estado-filter.tsx # 🔍 Filtro de estados
│   │       ├── pagination.tsx   # 📄 Componente de paginación (NEW)
│   │       └── skeleton.tsx     # ⚡ Loading skeleton (NEW)
│
lib/
├── formatters.ts                # ✨ Funciones de formateo
└── constants.ts                 # 🎯 Constantes y configuraciones
```

## 🔄 Cambios principales

### 1. Nuevo Endpoint: `/api/boletos/historial`

**Ubicación**: `app/api/boletos/historial/route.ts`

```typescript
GET /api/boletos/historial?usuarioId=xxx&estado=PAGADO&page=1&limit=10
```

**Características**:
- ✅ Obtiene `usuarioId` de NextAuth (cuando esté configurado)
- ✅ Valida parámetros (page min 1, limit max 100)
- ✅ Retorna boletos con relaciones completas
- ✅ Incluye hora de salida desde `frecuencia.hora`
- ✅ Transform de Decimal a Number

**Response**:
```json
{
  "boletos": [{
    "id": "...",
    "estado": "PAGADO",
    "codigoQr": "...",
    "precioFinal": 15.50,
    "pasajeroNombre": "Juan Pérez",
    "ruta": {
      "origen": "Ambato",
      "destino": "Quito",
      "hora": "14:00",
      "busNumero": "01",
      "busPlaca": "TAA-0101"
    },
    "asiento": {
      "etiqueta": "2B",
      "categoria": "Normal",
      "posicion": "PASILLO"
    }
  }],
  "paginacion": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### 2. Page.tsx → Client Component

**Cambios**:
- ✅ Agregado `"use client"` al inicio
- ✅ Usa `useState` para estados: `boletos`, `paginacion`, `loading`, `error`
- ✅ Usa `useEffect` para cargar datos cuando cambian `estado` o `page`
- ✅ Manejo de errores con mensaje amigable
- ✅ Loading state con skeleton
- ✅ Integración con URL params mediante `useSearchParams` y `useRouter`

**Estados manejados**:
```typescript
const [boletos, setBoletos] = useState<Boleto[]>([]);
const [paginacion, setPaginacion] = useState<...>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### 3. BoletoCard mejorada

**Nuevos botones condicionales**:

| Estado | Botón | Acción |
|--------|-------|--------|
| **PENDIENTE** | "📄 Subir comprobante" | Abre modal (TODO: Sandro) |
| **PAGADO** o **ABORDADO** | "📱 Ver QR" | Muestra QR del boleto |
| **Otros** | "Ver boleto" | Navega a `/cliente/boletos/[id]` |

```typescript
{boleto.estado === "PAGADO" || boleto.estado === "ABORDADO" ? (
  <button className="bg-green-600">📱 Ver QR</button>
) : (
  <Link href={`/cliente/boletos/${boleto.id}`}>Ver boleto</Link>
)}

{boleto.estado === "PENDIENTE" && (
  <button className="bg-amber-600">📄 Subir comprobante</button>
)}
```

### 4. Nuevos componentes

#### Pagination
**Archivo**: `pagination.tsx`
- Botones "Anterior" y "Siguiente"
- Muestra "Página X de Y"
- Deshabilitados en bordes
- Actualiza URL al hacer click

#### Skeleton
**Archivo**: `skeleton.tsx`
- `BoletoCardSkeleton` - Tarjeta de carga individual
- `BoletoListSkeleton` - Grid de 3 tarjetas de carga
- Animación `animate-pulse`

## 🔐 TODO: Integración NextAuth

En `page.tsx` línea ~82 y en `route.ts` línea ~26:

```typescript
// TODO: Obtener de NextAuth session
const usuarioId = searchParams.get("usuarioId"); // Temporal

// CAMBIAR A:
import { getServerSession } from "next-auth";
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}
const usuarioId = session.user.id;
```

## 📊 Flujo de datos (mejorado)

```
URL: /cliente/historial?estado=PAGADO&page=2
           ↓
    [Client Component]
           ↓
    useSearchParams() → estado, page
    useEffect(() => fetch('/api/boletos/historial?...'))
           ↓
    [API Route]
           ↓
    Obtiene usuarioId de NextAuth (o query param temporal)
    Construye WHERE, SKIP, TAKE
    Ejecuta Prisma findMany + count
           ↓
    [SQL Server]
           ↓
    Retorna JSON con boletos + paginación
           ↓
    State update: setBoletos, setPaginacion
           ↓
    [Re-render: Grid + Pagination]
```

## ✨ Características finales

✅ **Client Component** - Interactividad completa en el navegador  
✅ **Filtros interactivos** - Tabs de estado actualizan URL  
✅ **Paginación** - Botones Anterior/Siguiente  
✅ **Contador visual** - "Mostrando X de Y boletos"  
✅ **Loading states** - Skeleton mientras carga  
✅ **Error handling** - Mensaje amigable + botón retry  
✅ **Botones condicionales** - Según estado del boleto  
✅ **Empty state** - Cuando no hay boletos  
✅ **Responsive** - Mobile-first design  
✅ **TypeScript** - Tipado estricto  
✅ **Seguridad** - usuarioId desde NextAuth (pendiente)  

## 🎯 Ejemplo de uso

```
1. Usuario abre: /cliente/historial
2. Página carga boletos de `/api/boletos/historial?usuarioId=xxx`
3. Muestra grid con tarjetas
4. Usuario hace click en tab "PAGADO"
5. URL cambia a: /cliente/historial?estado=PAGADO&page=1
6. useEffect se dispara → fetch nuevos datos
7. Grid se actualiza con solo boletos PAGADO
8. Usuario hace click en "Anterior/Siguiente"
9. URL: /cliente/historial?estado=PAGADO&page=2
10. Se cargan boletos de página 2
```

## 📝 Notas de implementación

1. **`usuarioId` temporal** - Está hardcodeado como `"test-user-id"` ahora, cambiará cuando NextAuth esté listo
2. **Fetch en cliente** - Es seguro porque NextAuth valida en el servidor
3. **URL sync** - Los filtros y página se guardan en la URL, permitiendo compartir/guardar links
4. **Borrar query params** - Al borrar estado, automáticamente va a página 1
5. **Skeleton loading** - Muestra 3 tarjetas mientras carga
6. **TODOs deixados** - "Ver QR" y "Subir comprobante" (para implementar después)

## 🚀 Próximos pasos

- [ ] Configurar NextAuth y obtener `usuarioId` de sesión
- [ ] Implementar modal "Ver QR"
- [ ] Implementar modal "Subir comprobante" (con Sandro)
- [ ] Crear página de detalle `/cliente/boletos/[id]`
- [ ] Agregar búsqueda por nombre/cédula
- [ ] Agregar filtro de fechas
- [ ] Exportar a PDF/Excel

