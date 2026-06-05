import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Debe seleccionar una imagen del bus." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten imagenes JPG, PNG, WebP o GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 5 MB." },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    const filename = `${crypto.randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "buses");
    const uploadPath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

    const relativeUrl = `/uploads/buses/${filename}`;
    const url = new URL(relativeUrl, request.nextUrl.origin).toString();

    return NextResponse.json({ url, relativeUrl });
  } catch (error) {
    console.error("Error al subir imagen del bus:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen del bus." },
      { status: 500 }
    );
  }
}
