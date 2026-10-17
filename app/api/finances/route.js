import { NextResponse } from "next/server";
import {
  getFinances,
  addGasto,
  removeGasto,
  addCompra,
  removeCompra,
  addExpense,
  addPurchase
} from "@/lib/serverStore";

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
    const type = (body.type || (body.proveedor ? "compra" : "gasto")).toLowerCase();
    const payload = body.data || body;

    if (type === "compra" || type === "purchase") {
      const nuevaCompra = await addCompra({
        proveedor: payload.proveedor,
        concepto: payload.concepto,
        monto: payload.monto,
        fecha: payload.fecha
      });
      return NextResponse.json({ success: true, item: nuevaCompra, data: nuevaCompra, type: "compra" }, { status: 201 });
    } else {
      const nuevoGasto = await addGasto({
        concepto: payload.concepto,
        monto: payload.monto,
        categoria: payload.categoria,
        fecha: payload.fecha
      });
      return NextResponse.json({ success: true, item: nuevoGasto, data: nuevoGasto, type: "gasto" }, { status: 201 });
    }
  } catch (err) {
    console.error("Error en POST /api/finances:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const rawType = (searchParams.get("type") || "gasto").toLowerCase();
    const isPurchase = rawType === "compra" || rawType === "purchase";

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
    }

    if (isPurchase) {
      await removeCompra(id);
    } else {
      await removeGasto(id);
    }

    return NextResponse.json({ success: true, id, type: isPurchase ? "compra" : "gasto" });
  } catch (err) {
    console.error("Error en DELETE /api/finances:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
