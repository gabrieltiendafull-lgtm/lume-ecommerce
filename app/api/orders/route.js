import { NextResponse } from "next/server";
import { getAllOrders, addOrder, updateOrderStatus } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await addOrder(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { orderId, estado } = body;
    if (!orderId || !estado) {
      return NextResponse.json({ error: "orderId y estado son requeridos" }, { status: 400 });
    }
    const result = await updateOrderStatus(orderId, estado);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
