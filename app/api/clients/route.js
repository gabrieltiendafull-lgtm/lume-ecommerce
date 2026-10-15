import { NextResponse } from "next/server";
import { getAllClients } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clients = await getAllClients();
    return NextResponse.json(clients);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
