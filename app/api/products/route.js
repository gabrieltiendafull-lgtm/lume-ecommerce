import { NextResponse } from "next/server";
import { getAllProducts, addProduct, editProduct, removeProduct } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const created = await addProduct(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });
    const updated = await editProduct(id, data);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });
    const res = await removeProduct(id);
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
