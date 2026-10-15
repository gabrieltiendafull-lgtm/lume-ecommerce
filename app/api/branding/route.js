import { NextResponse } from "next/server";
import { getBranding, setBranding } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const branding = await getBranding();
    return NextResponse.json(branding);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const updated = await setBranding(body);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
