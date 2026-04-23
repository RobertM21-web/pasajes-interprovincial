# 🚌 Sistema de Gestión y Venta de Pasajes

Sistema web para la gestión y venta de pasajes de transporte interprovincial en Ecuador.

**Materia:** Manejo y Configuración de Software  
**Universidad:** Universidad Técnica de Ambato - FISEI  
**Carrera:** Ingeniería en Software

---

## 📋 Descripción

Aplicación web que permite a una cooperativa de transporte interprovincial gestionar sus frecuencias, rutas, buses y la venta de boletos tanto en ventanilla como en línea.

### Roles del Sistema

| Rol | Funciones principales |
|-----|----------------------|
| **Admin** | Gestión total: buses, frecuencias, categorías de asientos, configuración de la app |
| **Oficinista** | Habilitar rutas diarias, vender boletos, validar pagos, validar QR de abordaje |
| **Cliente** | Buscar rutas, comprar boletos online, subir comprobante, ver historial |

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (fullstack)
- **Base de datos:** SQL Server
- **ORM:** Prisma 7
- **Driver:** @prisma/adapter-mssql (tedious)
- **Autenticación:** NextAuth.js
- **UI:** Tailwind CSS + Radix UI
- **QR:** qrcode (generación)
- **Contenedores:** Docker + Docker Compose

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 20+
- SQL Server (Developer o Express) con TCP/IP habilitado en puerto 1433
- Git

### Desarrollo local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU-USUARIO/pasajes-interprovincial.git
cd pasajes-interprovincial

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de SQL Server

# 4. Crear la base de datos
sqlcmd -S localhost -U sa -P TU_PASSWORD -Q "CREATE DATABASE pasajes_db"

# 5. Generar cliente Prisma y crear tablas
npx prisma generate
npx prisma db push

# 6. Cargar datos iniciales
npx tsx prisma/seed.ts

# 7. Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@cooperativa.com | Admin123! |
| Oficinista | oficinista@cooperativa.com | Ofici123! |
| Cliente | cliente@ejemplo.com | Client123! |

---

## 📁 Estructura del Proyecto

```
pasajes-interprovincial/
├── .github/
│   ├── ISSUE_TEMPLATE/         # Plantillas de issues
│   └── PULL_REQUEST_TEMPLATE/  # Plantilla de PRs
├── docker/
│   └── Dockerfile
├── prisma/
│   ├── schema.prisma           # Esquema de BD
│   └── seed.ts                 # Datos iniciales
├── public/                     # Archivos estáticos
├── app/                        # Rutas y páginas (App Router)
│   ├── api/                    # API Routes
│   ├── (auth)/                 # Páginas de login/registro
│   └── (dashboard)/            # Páginas protegidas
│       ├── admin/              # Panel del admin
│       ├── oficinista/         # Panel del oficinista
│       └── cliente/            # Panel del cliente
├── components/                 # Componentes reutilizables
│   ├── ui/                     # Componentes base (botones, inputs)
│   ├── asientos/               # Selector visual de asientos
│   ├── boletos/                # Componentes de boletos/QR
│   └── rutas/                  # Componentes de rutas
├── lib/                        # Utilidades y configuración
│   └── prisma.ts               # Cliente Prisma singleton
├── hooks/                      # Custom hooks
├── types/                      # Tipos TypeScript
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🌿 Flujo de Trabajo Git (Gitflow)

### Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Producción estable |
| `develop` | Integración de features |
| `feature/*` | Nuevas funcionalidades |
| `hotfix/*` | Correcciones urgentes |
| `release/*` | Preparación de releases |

### Convención de Commits

```
tipo(módulo): descripción breve

Tipos: feat, fix, docs, style, refactor, test, chore
Módulos: auth, admin, oficinista, cliente, db, config, docker
```

**Ejemplos:**
```
feat(auth): implementar login con NextAuth y roles
fix(oficinista): corregir validación de asiento duplicado
docs(readme): agregar instrucciones de instalación
feat(cliente): agregar selector visual de asientos
chore(docker): configurar docker-compose con SQL Server
```

### Flujo de trabajo

1. Crear issue en GitHub usando la plantilla correspondiente
2. Crear rama `feature/nombre-descriptivo` desde `develop`
3. Desarrollar y hacer commits lógicos
4. Crear Pull Request hacia `develop` usando la plantilla
5. Revisión por al menos 1 compañero
6. Merge a `develop`

---

## 👥 Equipo

| Integrante | Rol principal | Responsabilidad |
|-----------|---------------|-----------------|
| Robert | Backend Lead | API de rutas, frecuencias, hoja de ruta |
| Sandro | Backend | API de boletos, ventas, QR, pagos |
| Shantal | Frontend Lead | Dashboard admin, CRUDs, configuración |
| Alan | Frontend | Flujo de compra, selector de asientos, cliente |
| Enrique | BD / DevOps | Schema, Docker, despliegue |
| Korayma | Docs / Jira | Issues, PRs, documentación |

**Comité de control de cambio:** Robert + Korayma

---

## 📄 Licencia

Proyecto académico - Universidad Técnica de Ambato, 2026.