import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;
    if (!identifier || !password) {
      return NextResponse.json({ error: "Usuario/correo y contraseña son obligatorios." }, { status: 400 });
    }

    const user = await authenticateUser(identifier, password);
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas. Verifica tu usuario y contraseña." }, { status: 401 });
    }

    return NextResponse.json({ user, success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
