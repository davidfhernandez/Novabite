import { NextRequest, NextResponse } from "next/server";

import { reclamarPuntosMiniJuego } from "@/lib/data";
import { miniGameClaimSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const payload = miniGameClaimSchema.parse(body);
    const result = await reclamarPuntosMiniJuego(id, payload);

    if (!result) {
      return NextResponse.json({ message: "Cuenta no encontrada" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error al reclamar los puntos del minijuego",
      },
      { status: 400 },
    );
  }
}
