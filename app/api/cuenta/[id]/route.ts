import { NextResponse } from "next/server";

import { getClientePerfil } from "@/lib/data";

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
