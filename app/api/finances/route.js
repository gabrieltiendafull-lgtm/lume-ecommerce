import { NextResponse } from "next/server";
import { addExpense, addPurchase, getFinances } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const finances = await getFinances();
    return NextResponse.json(finances);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.type === "expense") return NextResponse.json(await addExpense(body.data), { status: 201 });
    if (body.type === "purchase") return NextResponse.json(await addPurchase(body.data), { status: 201 });
    return NextResponse.json({ error: "Tipo de movimiento inválido" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
