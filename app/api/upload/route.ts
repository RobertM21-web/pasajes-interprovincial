import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se envió archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "choferes");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/choferes/${fileName}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Error al subir:", error);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}