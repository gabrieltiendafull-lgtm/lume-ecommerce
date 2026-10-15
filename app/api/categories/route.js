import { NextResponse } from "next/server";
import { getAllCategories, addCategory, editCategory, removeCategory } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre } = body;
    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre de la categoría es requerido." }, { status: 400 });
    }
    const categories = await addCategory(nombre.trim());
    return NextResponse.json({ categories, success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { oldNombre, newNombre } = body;
    if (!oldNombre || !newNombre) {
      return NextResponse.json({ error: "oldNombre y newNombre son requeridos." }, { status: 400 });
    }
    const categories = await editCategory(oldNombre, newNombre);
    return NextResponse.json({ categories, success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let nombre = searchParams.get("nombre");
    if (!nombre) {
      try {
        const body = await request.json();
        nombre = body.nombre;
      } catch (e) {}
    }

    if (!nombre) {
      return NextResponse.json({ error: "Nombre de categoría requerido." }, { status: 400 });
    }

    const categories = await removeCategory(nombre);
    return NextResponse.json({ categories, success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
