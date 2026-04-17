import { NextRequest, NextResponse } from "next/server";

import { createProducto, getProductos } from "@/lib/data";
import { productSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const categoria = request.nextUrl.searchParams.get("categoria") ?? undefined;
    const products = await getProductos(categoria);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al obtener productos" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = productSchema.parse(body);
    const product = await createProducto(payload);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al crear producto" },
      { status: 400 },
    );
  }
}
