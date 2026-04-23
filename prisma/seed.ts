import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaMssql(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de datos...");

  // ============================================
  // 1. COOPERATIVA (configuración de la app)
  // ============================================
  const cooperativa = await prisma.cooperativa.create({
    data: {
      nombre: "Cooperativa de Transportes Ejemplo",
      colorPrimario: "#1E40AF",
      colorSecundario: "#F59E0B",
      emailSoporte: "soporte@cooperativa.com",
      telefonoSoporte: "032-555-0100",
      direccion: "Terminal Terrestre de Ambato",
    },
  });
  console.log("✅ Cooperativa creada");

  // ============================================
  // 2. USUARIOS DE PRUEBA
  // ============================================
  const admin = await prisma.usuario.create({
    data: {
      nombre: "Administrador General",
      email: "admin@cooperativa.com",
      passwordHash: await bcrypt.hash("Admin123!", 10),
      cedula: "1800000001",
      rol: "ADMIN",
    },
  });

  const oficinista = await prisma.usuario.create({
    data: {
      nombre: "María López",
      email: "oficinista@cooperativa.com",
      passwordHash: await bcrypt.hash("Ofici123!", 10),
      cedula: "1800000002",
      rol: "OFICINISTA",
    },
  });

  const cliente = await prisma.usuario.create({
    data: {
      nombre: "Juan Pérez",
      email: "cliente@ejemplo.com",
      passwordHash: await bcrypt.hash("Client123!", 10),
      cedula: "1800000003",
      rol: "CLIENTE",
    },
  });
  console.log("✅ Usuarios creados (admin, oficinista, cliente)");

  // ============================================
  // 3. BUSES CON CATEGORÍAS Y ASIENTOS
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

  // Categorías para bus 1
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

  // Generar asientos para cada categoría
  let asientoNumero = 1;

  // Asientos normales (filas 3-9, 4 por fila + 2 extra)
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

  // Asientos VIP (filas 1-2, 4 por fila)
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

  // Asientos discapacidad (fila 10, 2 asientos)
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
    data: {
      busId: bus2.id,
      nombre: "Normal",
      precioBase: 4.5,
      cantidad: 32,
    },
  });

  await prisma.categoriaAsiento.create({
    data: {
      busId: bus2.id,
      nombre: "VIP",
      precioBase: 7.5,
      cantidad: 4,
    },
  });

  console.log("✅ Bus 02 creado");

  // ============================================
  // 4. FRECUENCIAS CON PARADAS INTERMEDIAS
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

  // Paradas intermedias para Ambato-Guayaquil
  await prisma.paradaIntermedia.createMany({
    data: [
      {
        frecuenciaId: freq2.id,
        ciudad: "Riobamba",
        orden: 1,
        precioTramo: 2.0,
        tiempoEstimado: 60,
      },
      {
        frecuenciaId: freq2.id,
        ciudad: "Pallatanga",
        orden: 2,
        precioTramo: 3.5,
        tiempoEstimado: 120,
      },
      {
        frecuenciaId: freq2.id,
        ciudad: "Bucay",
        orden: 3,
        precioTramo: 5.0,
        tiempoEstimado: 180,
      },
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
      {
        frecuenciaId: freq3.id,
        ciudad: "Baños",
        orden: 1,
        precioTramo: 1.5,
        tiempoEstimado: 45,
      },
      {
        frecuenciaId: freq3.id,
        ciudad: "Shell",
        orden: 2,
        precioTramo: 3.0,
        tiempoEstimado: 90,
      },
    ],
  });

  // Frecuencia inactiva
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