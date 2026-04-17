import { NextRequest, NextResponse } from "next/server";

import { getOrdenPorId, updateOrdenEstado } from "@/lib/data";
import { orderStatusSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const order = await getOrdenPorId(id);
    if (!order) {
      return NextResponse.json({ message: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al obtener la orden" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const payload = orderStatusSchema.parse(body);
    const order = await updateOrdenEstado(id, payload.estado);

    if (!order) {
      return NextResponse.json({ message: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al actualizar la orden" },
      { status: 400 },
    );
  }
}
