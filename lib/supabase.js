// ==============================================================================
// CLIENTE Y SERVICIOS DE SUPABASE - LUME E-COMMERCE
// ==============================================================================
// Conexión con PostgreSQL, Row Level Security y Supabase Auth (Google OAuth).

import { createClient } from "@supabase/supabase-js";
import { MOCK_PRODUCTS } from "./mockData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = 
  Boolean(supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes("placeholder-project") && 
  !supabaseAnonKey.includes("placeholder"));

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder-project.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder");

export { isConfigured };

// ==============================================================================
// 1. AUTENTICACIÓN ADMIN CON GOOGLE OAUTH
// ==============================================================================

/**
 * Inicia sesión utilizando Google OAuth (Google Identity) vía Supabase Auth
 */
export async function signInWithGoogle() {
  if (!isConfigured) {
    // Modo demostración local si aún no se han configurado credenciales reales
    const mockUser = {
      id: "admin-demo-id",
      email: "admin@lume.com",
      user_metadata: {
        full_name: "Administrador Lume",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
      }
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("lume_admin_session", JSON.stringify(mockUser));
    }
    return { data: { user: mockUser }, error: null };
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/admin`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  return { data, error };
}

/**
 * Cierra la sesión activa del usuario administrador
 */
export async function signOutAdmin() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lume_admin_session");
  }
  if (!isConfigured) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Obtiene el usuario actual (o de demostración)
 */
export async function getCurrentUser() {
  if (typeof window !== "undefined") {
    const demo = localStorage.getItem("lume_admin_session");
    if (demo) return JSON.parse(demo);
  }
  if (!isConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ==============================================================================
// 2. PRODUCTOS (CATÁLOGO & ADMINISTRACIÓN)
// ==============================================================================

export async function getProducts() {
  if (!isConfigured) {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("lume_custom_products");
      if (local) return JSON.parse(local);
    }
    return MOCK_PRODUCTS;
  }

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    console.warn("Error cargando productos de Supabase, usando respaldo:", error.message);
    return MOCK_PRODUCTS;
  }

  return data && data.length > 0 ? data : MOCK_PRODUCTS;
}

export async function createProduct(productData) {
  if (!isConfigured) {
    const newProd = {
      ...productData,
      id: "prod-" + Date.now(),
      creado_en: new Date().toISOString()
    };
    if (typeof window !== "undefined") {
      const current = await getProducts();
      const updated = [newProd, ...current];
      localStorage.setItem("lume_custom_products", JSON.stringify(updated));
    }
    return { data: newProd, error: null };
  }

  const { data, error } = await supabase
    .from("productos")
    .insert([productData])
    .select()
    .single();

  return { data, error };
}

export async function updateProduct(id, productData) {
  if (!isConfigured) {
    if (typeof window !== "undefined") {
      const current = await getProducts();
      const updated = current.map(p => p.id === id ? { ...p, ...productData } : p);
      localStorage.setItem("lume_custom_products", JSON.stringify(updated));
    }
    return { error: null };
  }

  const { data, error } = await supabase
    .from("productos")
    .update(productData)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteProduct(id) {
  if (!isConfigured) {
    if (typeof window !== "undefined") {
      const current = await getProducts();
      const updated = current.filter(p => p.id !== id);
      localStorage.setItem("lume_custom_products", JSON.stringify(updated));
    }
    return { error: null };
  }

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id);

  return { error };
}

// ==============================================================================
// 3. CHECKOUT, CLIENTES Y VENTAS
// ==============================================================================

/**
 * Registra un nuevo pedido completo: crea/actualiza cliente, registra venta y detalle.
 * El trigger de PostgreSQL se encarga automáticamente de descontar el stock.
 */
export async function createOrder({ customer, items, total, notas = "" }) {
  if (!isConfigured) {
    const simulatedOrderId = "ord-" + Math.random().toString(36).substring(2, 9);
    const newOrder = {
      id: simulatedOrderId,
      cliente: customer,
      items,
      total,
      fecha: new Date().toISOString(),
      estado: "pendiente",
      notas
    };

    if (typeof window !== "undefined") {
      const existingOrders = JSON.parse(localStorage.getItem("lume_orders") || "[]");
      localStorage.setItem("lume_orders", JSON.stringify([newOrder, ...existingOrders]));
    }

    return { orderId: simulatedOrderId, error: null };
  }

  try {
    // 1. Registrar o recuperar cliente
    let clienteId = null;
    if (customer.email) {
      const { data: existingClient } = await supabase
        .from("clientes")
        .select("id")
        .eq("email", customer.email)
        .maybeSingle();

      if (existingClient) {
        clienteId = existingClient.id;
      }
    }

    if (!clienteId) {
      const { data: newClient, error: clientErr } = await supabase
        .from("clientes")
        .insert([{
          nombre: customer.nombre,
          telefono: customer.telefono,
          email: customer.email,
          direccion: customer.direccion
        }])
        .select()
        .single();

      if (clientErr) throw clientErr;
      clienteId = newClient.id;
    }

    // 2. Insertar en tabla ventas
    const { data: venta, error: ventaErr } = await supabase
      .from("ventas")
      .insert([{
        cliente_id: clienteId,
        total: total,
        estado: "pendiente",
        notas: notas
      }])
      .select()
      .single();

    if (ventaErr) throw ventaErr;

    // 3. Insertar detalle_ventas (dispara el trigger de descuento de stock)
    const detalleRows = items.map(item => ({
      venta_id: venta.id,
      producto_id: item.id,
      cantidad: item.quantity,
      precio_unitario: item.precio_oferta || item.precio,
      subtotal: (item.precio_oferta || item.precio) * item.quantity
    }));

    const { error: detalleErr } = await supabase
      .from("detalle_ventas")
      .insert(detalleRows);

    if (detalleErr) throw detalleErr;

    return { orderId: venta.id, error: null };
  } catch (err) {
    console.error("Error registrando pedido en Supabase:", err);
    return { orderId: null, error: err.message || err };
  }
}

export async function getSales() {
  if (!isConfigured) {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("lume_orders") || "[]");
      if (orders.length > 0) return orders;
    }
    return [
      {
        id: "v-101",
        fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
        total: 71.30,
        estado: "pendiente",
        clientes: { nombre: "Valentina Morales", telefono: "+54 9 11 4455-6677", direccion: "Palermo Soho, CABA" },
        items_count: 2
      },
      {
        id: "v-100",
        fecha: new Date(Date.now() - 3600000 * 24).toISOString(),
        total: 35.00,
        estado: "completado",
        clientes: { nombre: "Esteban Quiroga", telefono: "+54 9 11 9988-7766", direccion: "Recoleta, CABA" },
        items_count: 1
      }
    ];
  }

  const { data, error } = await supabase
    .from("ventas")
    .select(`
      id,
      total,
      fecha,
      estado,
      notas,
      clientes (id, nombre, telefono, email, direccion),
      detalle_ventas (
        id,
        cantidad,
        precio_unitario,
        subtotal,
        productos (id, nombre, imagen_url)
      )
    `)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener ventas:", error);
    return [];
  }
  return data;
}

export async function updateSaleStatus(saleId, nuevoEstado) {
  if (!isConfigured) {
    if (typeof window !== "undefined") {
      const orders = JSON.parse(localStorage.getItem("lume_orders") || "[]");
      const updated = orders.map(o => o.id === saleId ? { ...o, estado: nuevoEstado } : o);
      localStorage.setItem("lume_orders", JSON.stringify(updated));
    }
    return { error: null };
  }

  const { error } = await supabase
    .from("ventas")
    .update({ estado: nuevoEstado })
    .eq("id", saleId);

  return { error };
}

// ==============================================================================
// 4. GASTOS Y COMPRAS (MÓDULO FINANCIERO)
// ==============================================================================

export async function getExpenses() {
  if (!isConfigured) {
    return [
      { id: "g-1", concepto: "Renta de Taller", monto: 350.00, categoria: "Operativo", fecha: "2026-10-01" },
      { id: "g-2", concepto: "Cajas de Envío y Papel Seda Lume", monto: 120.00, categoria: "Empaque", fecha: "2026-10-05" },
      { id: "g-3", concepto: "Publicidad Instagram Ads", monto: 90.00, categoria: "Marketing", fecha: "2026-10-08" },
    ];
  }

  const { data, error } = await supabase
    .from("gastos")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) return [];
  return data;
}

export async function addExpense(expenseData) {
  if (!isConfigured) return { data: expenseData, error: null };
  return await supabase.from("gastos").insert([expenseData]).select().single();
}

export async function getPurchases() {
  if (!isConfigured) {
    return [
      { id: "c-1", proveedor: "EcoSoy Supplies Co.", concepto: "Cera de soja en escamas 50kg", monto: 280.00, fecha: "2026-10-02" },
      { id: "c-2", proveedor: "AromaLab Esencias", concepto: "Aceites esenciales botánicos puros", monto: 195.00, fecha: "2026-10-06" },
      { id: "c-3", proveedor: "Cerámicas Del Valle", concepto: "50 Cuencos de cerámica mate", monto: 160.00, fecha: "2026-10-09" },
    ];
  }

  const { data, error } = await supabase
    .from("compras")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) return [];
  return data;
}

export async function addPurchase(purchaseData) {
  if (!isConfigured) return { data: purchaseData, error: null };
  return await supabase.from("compras").insert([purchaseData]).select().single();
}

// ==============================================================================
// 5. CLIENTES
// ==============================================================================

export async function getClients() {
  if (!isConfigured) {
    return [
      { id: "cl-1", nombre: "Valentina Morales", email: "valentina@gmail.com", telefono: "+54 9 11 4455-6677", direccion: "Palermo Soho, CABA", creado_en: "2026-09-12" },
      { id: "cl-2", nombre: "Esteban Quiroga", email: "esteban.q@outlook.com", telefono: "+54 9 11 9988-7766", direccion: "Recoleta, CABA", creado_en: "2026-09-20" },
      { id: "cl-3", nombre: "Camila Benítez", email: "cami.benitez@yahoo.com", telefono: "+54 9 11 3322-1100", direccion: "Belgrano, CABA", creado_en: "2026-10-01" },
    ];
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) return [];
  return data;
}
