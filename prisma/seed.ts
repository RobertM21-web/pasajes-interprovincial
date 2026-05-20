import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaMssql(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de datos...");

  // ============================================
  // 1. ROLES
  // ============================================
  const rolAdmin = await prisma.rol.create({
    data: {
      nombre: "ADMIN",
      descripcion: "Administrador general de la cooperativa. Acceso total al sistema.",
    },
  });

  const rolOficinista = await prisma.rol.create({
    data: {
      nombre: "OFICINISTA",
      descripcion: "Personal de ventanilla. Habilita rutas, vende boletos, valida pagos y QR.",
    },
  });

  const rolCliente = await prisma.rol.create({
    data: {
      nombre: "CLIENTE",
      descripcion: "Usuario final. Compra boletos en línea.",
    },
  });
  console.log("✅ Roles creados (ADMIN, OFICINISTA, CLIENTE)");

  // ============================================
  // 2. PERMISOS
  // ============================================
  const permisosData = [
    // Admin
    { clave: "gestionar_buses", nombre: "Gestionar buses", modulo: "admin", descripcion: "Crear, editar, eliminar y deshabilitar buses" },
    { clave: "gestionar_frecuencias", nombre: "Gestionar frecuencias", modulo: "admin", descripcion: "Crear, editar y deshabilitar frecuencias" },
    { clave: "gestionar_categorias_asiento", nombre: "Gestionar categorías de asiento", modulo: "admin", descripcion: "Crear y editar tipos de asiento por bus" },
    { clave: "gestionar_usuarios", nombre: "Gestionar usuarios", modulo: "admin", descripcion: "Crear, editar y deshabilitar usuarios del sistema" },
    { clave: "gestionar_roles", nombre: "Gestionar roles y permisos", modulo: "admin", descripcion: "Crear roles y asignar permisos" },
    { clave: "gestionar_configuracion", nombre: "Gestionar configuración", modulo: "config", descripcion: "Editar logo, colores, redes sociales, soporte" },
    // Oficinista
    { clave: "habilitar_rutas", nombre: "Habilitar rutas diarias", modulo: "oficinista", descripcion: "Asignar buses a frecuencias para crear rutas" },
    { clave: "gestionar_hoja_ruta", nombre: "Gestionar hoja de ruta", modulo: "oficinista", descripcion: "Crear y administrar hojas de ruta semanales/mensuales" },
    { clave: "vender_boletos", nombre: "Vender boletos", modulo: "oficinista", descripcion: "Vender boletos en ventanilla" },
    { clave: "validar_pagos", nombre: "Validar pagos", modulo: "oficinista", descripcion: "Aprobar o rechazar comprobantes de transferencia" },
    { clave: "validar_abordaje", nombre: "Validar abordaje", modulo: "oficinista", descripcion: "Escanear QR y registrar abordaje de pasajeros" },
    { clave: "reasignar_buses", nombre: "Reasignar buses", modulo: "oficinista", descripcion: "Sustituir buses dañados por disponibles en terminal" },
    // Cliente
    { clave: "buscar_rutas", nombre: "Buscar rutas", modulo: "cliente", descripcion: "Buscar destinos y frecuencias disponibles" },
    { clave: "comprar_boletos", nombre: "Comprar boletos", modulo: "cliente", descripcion: "Comprar boletos en línea" },
    { clave: "ver_historial", nombre: "Ver historial de compras", modulo: "cliente", descripcion: "Consultar boletos comprados" },
    { clave: "subir_comprobante", nombre: "Subir comprobante", modulo: "cliente", descripcion: "Adjuntar comprobante de transferencia" },
  ];

  const permisos: Record<string, { id: string }> = {};
  for (const p of permisosData) {
    const created = await prisma.permiso.create({ data: p });
    permisos[p.clave] = created;
  }
  console.log("✅ Permisos creados (16 permisos)");

  // ============================================
  // 3. ASIGNAR PERMISOS A ROLES
  // ============================================
  // Admin tiene TODOS los permisos
  for (const p of Object.values(permisos)) {
    await prisma.rolPermiso.create({
      data: { rolId: rolAdmin.id, permisoId: p.id },
    });
  }

  // Oficinista
  const permisosOficinista = [
    "habilitar_rutas", "gestionar_hoja_ruta", "vender_boletos",
    "validar_pagos", "validar_abordaje", "reasignar_buses",
  ];
  for (const clave of permisosOficinista) {
    await prisma.rolPermiso.create({
      data: { rolId: rolOficinista.id, permisoId: permisos[clave].id },
    });
  }

  // Cliente
  const permisosCliente = [
    "buscar_rutas", "comprar_boletos", "ver_historial", "subir_comprobante",
  ];
  for (const clave of permisosCliente) {
    await prisma.rolPermiso.create({
      data: { rolId: rolCliente.id, permisoId: permisos[clave].id },
    });
  }
  console.log("✅ Permisos asignados a roles");

  // ============================================
  // 4. CONFIGURACIÓN DE LA APLICACIÓN
  // ============================================
  await prisma.configuracion.create({
    data: {
      nombreCooperativa: "Cooperativa de Transportes Ejemplo",
      colorPrimario: "#1E40AF",
      colorSecundario: "#F59E0B",
      emailSoporte: "soporte@cooperativa.com",
      telefonoSoporte: "032-555-0100",
      direccion: "Terminal Terrestre de Ambato",
    },
  });
  console.log("✅ Configuración creada");

  // ============================================
  // 5. USUARIOS DE PRUEBA
  // ============================================
  await prisma.usuario.create({
    data: {
      nombre: "Administrador General",
      email: "admin@cooperativa.com",
      passwordHash: await bcrypt.hash("Admin123!", 10),
      cedula: "1800000001",
      rolId: rolAdmin.id,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre: "María López",
      email: "oficinista@cooperativa.com",
      passwordHash: await bcrypt.hash("Ofici123!", 10),
      cedula: "1800000002",
      rolId: rolOficinista.id,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre: "Juan Pérez",
      email: "cliente@ejemplo.com",
      passwordHash: await bcrypt.hash("Client123!", 10),
      cedula: "1800000003",
      rolId: rolCliente.id,
    },
  });
  console.log("✅ Usuarios creados (admin, oficinista, cliente)");

  // ============================================
  // 6. BUSES CON CATEGORÍAS Y ASIENTOS
  // ============================================
  const bus1 = await prisma.bus.create({
    data: {
      numero: "01",
      placa: "TAA-0101",
      marcaChasis: "Mercedes-Benz",
      marcaCarroceria: "Marcopolo",
      totalAsientos: 40,
      activo: true,
      enTerminal: true,
    },
  });

  const catNormal = await prisma.categoriaAsiento.create({
    data: {
      busId: bus1.id,
      nombre: "Normal",
      precioBase: 5.0,
      cantidad: 30,
      descripcion: "Asiento estándar",
    },
  });

  const catVIP = await prisma.categoriaAsiento.create({
    data: {
      busId: bus1.id,
      nombre: "VIP",
      precioBase: 8.5,
      cantidad: 8,
      descripcion: "Asiento reclinable con más espacio",
    },
  });

  const catDiscapacidad = await prisma.categoriaAsiento.create({
    data: {
      busId: bus1.id,
      nombre: "Discapacidad",
      precioBase: 5.0,
      cantidad: 2,
      descripcion: "Asiento con acceso preferencial",
    },
  });

  // Asientos normales
  let asientoNumero = 1;
  for (let fila = 3; fila <= 9; fila++) {
    const posiciones = ["VENTANA", "PASILLO", "PASILLO", "VENTANA"];
    const etiquetas = ["A", "B", "C", "D"];
    for (let col = 0; col < 4; col++) {
      if (asientoNumero > 30) break;
      await prisma.asiento.create({
        data: {
          categoriaId: catNormal.id,
          numero: asientoNumero,
          fila,
          posicion: posiciones[col],
          etiqueta: `${fila}${etiquetas[col]}`,
        },
      });
      asientoNumero++;
    }
  }

  // Asientos VIP
  asientoNumero = 31;
  for (let fila = 1; fila <= 2; fila++) {
    const posiciones = ["VENTANA", "PASILLO", "PASILLO", "VENTANA"];
    const etiquetas = ["A", "B", "C", "D"];
    for (let col = 0; col < 4; col++) {
      await prisma.asiento.create({
        data: {
          categoriaId: catVIP.id,
          numero: asientoNumero,
          fila,
          posicion: posiciones[col],
          etiqueta: `${fila}${etiquetas[col]}`,
        },
      });
      asientoNumero++;
    }
  }

  // Asientos discapacidad
  asientoNumero = 39;
  for (let col = 0; col < 2; col++) {
    await prisma.asiento.create({
      data: {
        categoriaId: catDiscapacidad.id,
        numero: asientoNumero,
        fila: 10,
        posicion: col === 0 ? "VENTANA" : "PASILLO",
        etiqueta: `10${col === 0 ? "A" : "B"}`,
      },
    });
    asientoNumero++;
  }
  console.log("✅ Bus 01 con 40 asientos creado");

  // Segundo bus
  const bus2 = await prisma.bus.create({
    data: {
      numero: "02",
      placa: "TAA-0202",
      marcaChasis: "Scania",
      marcaCarroceria: "Busscar",
      totalAsientos: 36,
      activo: true,
      enTerminal: true,
    },
  });

  await prisma.categoriaAsiento.create({
    data: { busId: bus2.id, nombre: "Normal", precioBase: 4.5, cantidad: 32 },
  });

  await prisma.categoriaAsiento.create({
    data: { busId: bus2.id, nombre: "VIP", precioBase: 7.5, cantidad: 4 },
  });
  console.log("✅ Bus 02 creado");

  // ============================================
  // 7. FRECUENCIAS CON PARADAS INTERMEDIAS
  // ============================================
  const freq1 = await prisma.frecuencia.create({
    data: {
      ciudadOrigen: "Ambato",
      ciudadDestino: "Quito",
      hora: "06:00",
      resolucionAnt: "RES-ANT-2024-001",
      esDirecta: true,
      activa: true,
    },
  });

  const freq2 = await prisma.frecuencia.create({
    data: {
      ciudadOrigen: "Ambato",
      ciudadDestino: "Guayaquil",
      hora: "08:00",
      resolucionAnt: "RES-ANT-2024-002",
      esDirecta: false,
      activa: true,
    },
  });

  await prisma.paradaIntermedia.createMany({
    data: [
      { frecuenciaId: freq2.id, ciudad: "Riobamba", orden: 1, precioTramo: 2.0, tiempoEstimado: 60 },
      { frecuenciaId: freq2.id, ciudad: "Pallatanga", orden: 2, precioTramo: 3.5, tiempoEstimado: 120 },
      { frecuenciaId: freq2.id, ciudad: "Bucay", orden: 3, precioTramo: 5.0, tiempoEstimado: 180 },
    ],
  });

  const freq3 = await prisma.frecuencia.create({
    data: {
      ciudadOrigen: "Ambato",
      ciudadDestino: "Puyo",
      hora: "07:00",
      resolucionAnt: "RES-ANT-2024-003",
      esDirecta: false,
      activa: true,
    },
  });

  await prisma.paradaIntermedia.createMany({
    data: [
      { frecuenciaId: freq3.id, ciudad: "Baños", orden: 1, precioTramo: 1.5, tiempoEstimado: 45 },
      { frecuenciaId: freq3.id, ciudad: "Shell", orden: 2, precioTramo: 3.0, tiempoEstimado: 90 },
    ],
  });

  await prisma.frecuencia.create({
    data: {
      ciudadOrigen: "Ambato",
      ciudadDestino: "Cuenca",
      hora: "10:00",
      resolucionAnt: "RES-ANT-2024-004",
      esDirecta: false,
      activa: false,
    },
  });
  console.log("✅ Frecuencias y paradas intermedias creadas");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📌 Credenciales de prueba:");
  console.log("   Admin:      admin@cooperativa.com / Admin123!");
  console.log("   Oficinista: oficinista@cooperativa.com / Ofici123!");
  console.log("   Cliente:    cliente@ejemplo.com / Client123!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
