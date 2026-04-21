import { NextResponse } from "next/server";

import { getClientePerfil, updateClientePerfil } from "@/lib/data";
import { customerProfileSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const profile = await getClientePerfil(id);

    if (!profile) {
      return NextResponse.json({ message: "Cuenta no encontrada" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al obtener la cuenta" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const payload = customerProfileSchema.parse(body);
    const customer = await updateClientePerfil(id, payload);

    if (!customer) {
      return NextResponse.json({ message: "Cuenta no encontrada" }, { status: 404 });
    }

    const profile = await getClientePerfil(id);
    return NextResponse.json(profile ?? customer);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al actualizar la cuenta" },
      { status: 400 },
    );
  }
}
