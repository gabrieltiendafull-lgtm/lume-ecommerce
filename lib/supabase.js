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
// 1. AUTENTICACIÓN ADMIN CON CREDENCIALES (USUARIO Y CONTRASEÑA)
// ==============================================================================

const DEFAULT_ADMIN_USERS = [
  {
    id: "usr-admin-master",
    nombre: "Administrador Principal",
    email: "admin@lume.com",
    usuario: "admin",
    password: "admin123",
    rol: "Administrador General",
    creado_en: "2026-10-01T00:00:00Z"
  }
];

/**
 * Inicia sesión utilizando credenciales (Email/Usuario y Contraseña)
 */
export async function signInWithCredentials(identifier, password) {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  // 1. Primero consultar en Supabase Auth si está configurado
  if (isConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password: cleanPass,
      });

      if (!error && data?.user) {
        const adminSession = {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.full_name || cleanId,
          rol: "Administrador General",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("lume_admin_session", JSON.stringify(adminSession));
        }
        return { data: { user: adminSession }, error: null };
      }
    } catch (e) {
      console.warn("Supabase auth check:", e.message);
    }

    // 2. Intentar en tabla personalizada 'usuarios_admin' en Supabase
    try {
      const { data: dbUser, error: dbError } = await supabase
        .from("usuarios_admin")
        .select("*")
        .or(`email.ilike.${cleanId},usuario.ilike.${cleanId}`)
        .eq("password", cleanPass)
        .eq("activo", true)
        .maybeSingle();

      if (!dbError && dbUser) {
        const adminSession = {
          id: dbUser.id,
          email: dbUser.email,
          nombre: dbUser.nombre,
          rol: dbUser.rol || "Administrador",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("lume_admin_session", JSON.stringify(adminSession));
        }
        return { data: { user: adminSession }, error: null };
      }
    } catch (e) {
      console.warn("Tabla usuarios_admin check:", e.message);
    }
  }

  // 3. Verificación con usuarios locales / de respaldo (para uso inmediato en Render)
  let allUsers = [...DEFAULT_ADMIN_USERS];
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("lume_admin_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        allUsers = [...allUsers, ...parsed];
      } catch (e) {}
    }
  }

  const foundUser = allUsers.find(
    (u) =>
      (u.email?.toLowerCase() === cleanId || u.usuario?.toLowerCase() === cleanId) &&
      u.password === cleanPass
  );

  if (foundUser) {
    const sessionData = {
      id: foundUser.id,
      email: foundUser.email,
      nombre: foundUser.nombre,
      rol: foundUser.rol || "Administrador",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("lume_admin_session", JSON.stringify(sessionData));
    }
    return { data: { user: sessionData }, error: null };
  }

  return {
    data: null,
    error: { message: "Credenciales inválidas. Verifica tu usuario/correo y contraseña." },
  };
}

/**
 * Inicia sesión utilizando Google OAuth (opcional / complementario)
 */
export async function signInWithGoogle() {
  if (!isConfigured) {
    return signInWithCredentials("admin@lume.com", "admin123");
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/admin`,
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
 * Obtiene el usuario actual
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

// ==============================================================================
// 6. GESTIÓN DE USUARIOS ADMINISTRADORES (CREAR USUARIOS Y CONTRASEÑAS)
// ==============================================================================

export async function getAdminUsers() {
  const defaultList = [
    {
      id: "usr-admin-master",
      nombre: "Administrador Principal",
      email: "admin@lume.com",
      usuario: "admin",
      rol: "Administrador General",
      creado_en: "2026-10-01T00:00:00Z",
      esMaster: true
    }
  ];

  let localUsers = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("lume_admin_users");
      if (stored) localUsers = JSON.parse(stored);
    } catch (e) {}
  }

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from("usuarios_admin")
        .select("id, nombre, email, usuario, rol, activo, creado_en")
        .order("creado_en", { ascending: false });

      if (!error && data && data.length > 0) {
        return [...defaultList, ...data.filter(u => u.id !== "usr-admin-master")];
      }
    } catch (e) {
      console.warn("Consulta a usuarios_admin:", e);
    }
  }

  return [...defaultList, ...localUsers];
}

export async function createAdminUser({ nombre, email, password, rol = "Administrador" }) {
  const newUser = {
    id: "usr-" + Date.now(),
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    usuario: email.split("@")[0].toLowerCase(),
    password: password.trim(),
    rol,
    activo: true,
    creado_en: new Date().toISOString()
  };

  // Guardar en localStorage para disponibilidad inmediata en Render
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem("lume_admin_users") || "[]");
    localStorage.setItem("lume_admin_users", JSON.stringify([...existing, newUser]));
  }

  // Si Supabase está conectado, guardar en base de datos
  if (isConfigured) {
    try {
      await supabase.from("usuarios_admin").insert([{
        nombre: newUser.nombre,
        email: newUser.email,
        usuario: newUser.usuario,
        password: newUser.password,
        rol: newUser.rol,
        activo: true
      }]);
    } catch (e) {
      console.warn("Error guardando en Supabase usuarios_admin:", e);
    }
  }

  return { data: newUser, error: null };
}

export async function deleteAdminUser(id) {
  if (id === "usr-admin-master") {
    return { error: { message: "No se puede eliminar el usuario administrador maestro." } };
  }

  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem("lume_admin_users") || "[]");
    const updated = existing.filter(u => u.id !== id);
    localStorage.setItem("lume_admin_users", JSON.stringify(updated));
  }

  if (isConfigured) {
    try {
      await supabase.from("usuarios_admin").delete().eq("id", id);
    } catch (e) {}
  }

  return { error: null };
}

// ==============================================================================
// 7. CONFIGURACIÓN Y BRANDING (LOGO DINÁMICO DE EMPRESA)
// ==============================================================================

export async function getBrandingConfig() {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("lume_branding");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
  }

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from("configuracion")
        .select("clave, valor");

      if (!error && data) {
        const configMap = {};
        data.forEach(item => {
          configMap[item.clave] = item.valor;
        });
        return configMap;
      }
    } catch (e) {}
  }

  return {
    logo_url: "/lume-logo.svg",
    store_name: "Lume Home & Scents",
    brand_tagline: "Luz, calma y esencias puras para tu espacio"
  };
}

export async function saveBrandingConfig({ logo_url, store_name, brand_tagline }) {
  const config = {
    logo_url: logo_url || "/lume-logo.svg",
    store_name: store_name || "Lume Home & Scents",
    brand_tagline: brand_tagline || "Luz, calma y esencias puras para tu espacio",
    actualizado_en: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("lume_branding", JSON.stringify({
      logoUrl: config.logo_url,
      storeName: config.store_name,
      brandTagline: config.brand_tagline
    }));
  }

  if (isConfigured) {
    try {
      const upserts = [
        { clave: "logo_url", valor: config.logo_url },
        { clave: "store_name", valor: config.store_name },
        { clave: "brand_tagline", valor: config.brand_tagline },
      ];
      await supabase.from("configuracion").upsert(upserts, { onConflict: "clave" });
    } catch (e) {
      console.warn("Error guardando en tabla configuracion de Supabase:", e);
    }
  }

  return { data: config, error: null };
}
