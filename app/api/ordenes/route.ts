import { NextRequest, NextResponse } from "next/server";

import { createOrden, getOrdenes } from "@/lib/data";
import { orderSchema } from "@/lib/validators";

export async function GET() {
  try {
    const orders = await getOrdenes();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al obtener órdenes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = orderSchema.parse(body);
    const result = await createOrden(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al crear la orden" },
      { status: 400 },
    );
  }
}
