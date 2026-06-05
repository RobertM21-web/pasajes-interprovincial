import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validarPlacaEcuador } from "@/lib/validaciones";

// Schema para crear bus con sus categorías
const busCreateSchema = z.object({
  numero: z.string().min(1, "Número de bus obligatorio"),
  placa: z
    .string()
    .min(1, "Placa obligatoria")
    .transform((v) => v.toUpperCase().trim())
    .refine(validarPlacaEcuador, {
      message: "Formato de placa inválido. Use: ABC-123 o ABC-1234",
    }),
  marcaChasis: z.string().min(2, "Marca del chasis obligatoria"),
  marcaCarroceria: z.string().min(2, "Marca de carrocería obligatoria"),
  fotografiaUrl: z.string().url().optional().or(z.literal("")),
  totalAsientos: z
    .number()
    .int()
    .min(1, "Debe tener al menos 1 asiento")
    .max(50, "Máximo 50 asientos permitidos por bus"),
  enTerminal: z.boolean().default(true),
  categorias: z
    .array(
      z.object({
        nombre: z.string().min(1, "Nombre de categoría obligatorio"),
        precioBase: z.number().positive("Precio debe ser positivo"),
        cantidad: z
          .number()
          .int()
          .min(1, "Mínimo 1 asiento")
          .max(50, "Máximo 50 asientos permitidos"),
        descripcion: z.string().optional(),
      })
    )
    .min(1, "Debe tener al menos una categoría"),
});

// GET - Listar todos los buses con sus categorías
export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      where: { activo: true },
      include: {
        categorias: {
          include: {
            asientos: {
              orderBy: [{ fila: "asc" }, { numero: "asc" }],
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(buses);
  } catch (error) {
    console.error("Error al obtener buses:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de buses" },
      { status: 500 }
    );
  }
}

// POST - Crear bus con categorías y asientos generados automáticamente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = busCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { categorias, ...busData } = validation.data;
    
    // Verificar que la suma de asientos por categoría coincida con totalAsientos
    const sumaCategorias = categorias.reduce((sum, cat) => sum + cat.cantidad, 0);
    if (sumaCategorias !== busData.totalAsientos) {
      return NextResponse.json(
        { 
          error: `La suma de asientos por categoría (${sumaCategorias}) no coincide con totalAsientos (${busData.totalAsientos})` 
        },
        { status: 400 }
      );
    }

    // Crear el bus con sus categorías y asientos en una transacción
    const bus = await prisma.$transaction(async (tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
      // 1. Crear el bus
      const nuevoBus = await tx.bus.create({
        data: {
          ...busData,
          activo: true,
        },
      });

      // 2. Crear categorías y sus asientos
      let asientoGlobal = 0;
      
      for (const categoria of categorias) {
        const nuevaCategoria = await tx.categoriaAsiento.create({
          data: {
            busId: nuevoBus.id,
            nombre: categoria.nombre,
            precioBase: categoria.precioBase,
            cantidad: categoria.cantidad,
            descripcion: categoria.descripcion,
          },
        });

        // 3. Generar asientos para esta categoría
        const asientos = [];
        const asientosPorFila = 4; // 4 asientos por fila (2 ventana, 2 pasillo)
        
        for (let i = 0; i < categoria.cantidad; i++) {
          asientoGlobal++;
          const fila = Math.ceil(asientoGlobal / asientosPorFila);
          const posicionFila = asientoGlobal % asientosPorFila || asientosPorFila;
          
          // Determinar posición y etiqueta
          let posicion: string;
          switch (posicionFila) {
            case 1: posicion = "VENTANA"; break;
            case 2: posicion = "PASILLO"; break;
            case 3: posicion = "PASILLO"; break;
            case 4: posicion = "VENTANA"; break;
            default: posicion = "PASILLO";
          }
          
          const letra = String.fromCharCode(64 + posicionFila); // A, B, C, D
          const etiqueta = `${fila}${letra}`;
          
          asientos.push({
            categoriaId: nuevaCategoria.id,
            numero: asientoGlobal,
            fila,
            posicion,
            etiqueta,
          });
        }
        
        // Crear todos los asientos de esta categoría
        await tx.asiento.createMany({
          data: asientos,
        });
      }

      // 4. Retornar el bus completo
      return await tx.bus.findUnique({
        where: { id: nuevoBus.id },
        include: {
          categorias: {
            include: {
              asientos: {
                orderBy: [{ fila: "asc" }, { numero: "asc" }],
              },
            },
          },
        },
      });
    });

    return NextResponse.json(bus, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear bus:", error);
    
    // Manejar errores de unicidad
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un bus con ese número o placa" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al crear el bus y sus asientos" },
      { status: 500 }
    );
  }
}