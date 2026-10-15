import { NextResponse } from "next/server";
import { getFinances } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const finances = await getFinances();
    return NextResponse.json(finances);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
