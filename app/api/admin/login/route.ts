import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { validateAdminCredentials } from "@/lib/admin-auth";

const adminLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = adminLoginSchema.parse(body);
    const admin = await validateAdminCredentials(payload.email, payload.password);

    if (!admin) {
      return NextResponse.json(
        { message: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    return NextResponse.json(admin);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al iniciar sesión" },
      { status: 400 },
    );
  }
}
