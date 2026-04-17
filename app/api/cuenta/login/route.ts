import { NextRequest, NextResponse } from "next/server";

import { loginCliente } from "@/lib/data";
import { customerLoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = customerLoginSchema.parse(body);
    const customer = await loginCliente(payload);

    if (!customer) {
      return NextResponse.json(
        { message: "No encontramos una cuenta con esos datos." },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al iniciar sesión" },
      { status: 400 },
    );
  }
}
