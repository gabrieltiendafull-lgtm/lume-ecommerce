// ==============================================================================
// ALMACENAMIENTO CENTRALIZADO DEL SERVIDOR - LUMÉ E-COMMERCE
// ==============================================================================
// Gestiona la persistencia unificada para sincronizar celular, computadora y
// cualquier dispositivo en Render.
// 1. Si está configurado PostgreSQL (Aiven.io), consulta directamente la BD relacional.
// 2. Si no está configurado, persiste en un archivo JSON central en el servidor de Render,
//    garantizando que todos los clientes vean la misma información en tiempo real.
// ==============================================================================

import fs from "fs";
import path from "path";
import { query, isAivenConfigured } from "./db";
import { MOCK_PRODUCTS } from "./mockData";

const STORE_PATH = path.join(process.cwd(), "data", "lume_store.json");

const DEFAULT_STORE = {
  products: MOCK_PRODUCTS,
  branding: {
    logo_url: "/lume-logo.svg",
    store_name: "Lumé Home & Scents",
    brand_tagline: "Luz, calma y esencias puras para tu espacio",
    actualizado_en: new Date().toISOString()
  },
  orders: [
    {
      id: "v-101",
      fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
      total: 71.30,
      estado: "pendiente",
      clientes: { nombre: "Valentina Morales", telefono: "+54 9 11 4455-6677", direccion: "Palermo Soho, CABA" },
      items_count: 2,
      notas: "Entregar por la tarde"
    },
    {
      id: "v-100",
      fecha: new Date(Date.now() - 3600000 * 24).toISOString(),
      total: 35.00,
      estado: "completado",
      clientes: { nombre: "Esteban Quiroga", telefono: "+54 9 11 9988-7766", direccion: "Recoleta, CABA" },
      items_count: 1,
      notas: ""
    }
  ],
  clients: [
    { id: "cl-1", nombre: "Valentina Morales", email: "valentina@gmail.com", telefono: "+54 9 11 4455-6677", direccion: "Palermo Soho, CABA", creado_en: "2026-09-12" },
    { id: "cl-2", nombre: "Esteban Quiroga", email: "esteban.q@outlook.com", telefono: "+54 9 11 9988-7766", direccion: "Recoleta, CABA", creado_en: "2026-09-20" },
    { id: "cl-3", nombre: "Camila Benítez", email: "cami.benitez@yahoo.com", telefono: "+54 9 11 3322-1100", direccion: "Belgrano, CABA", creado_en: "2026-10-01" }
  ],
  users: [
    {
      id: "usr-admin-master",
      nombre: "Administrador Lumé",
      email: "admin@lume.com",
      usuario: "admin",
      password: "admin123",
      rol: "Administrador General",
      creado_en: "2026-10-01T00:00:00Z",
      esMaster: true
    }
  ],
  gastos: [
    { id: "g-1", concepto: "Renta de Taller y Almacén Lumé", monto: 350.00, categoria: "Operativo", fecha: "2026-10-01" },
    { id: "g-2", concepto: "Cajas de Envío y Papel Seda Personalizado Lumé", monto: 120.00, categoria: "Empaque", fecha: "2026-10-05" },
    { id: "g-3", concepto: "Campaña Publicitaria Meta / Instagram Ads", monto: 90.00, categoria: "Marketing", fecha: "2026-10-08" }
  ],
  compras: [
    { id: "c-1", proveedor: "EcoSoy Supplies Co.", concepto: "Cera de soja en escamas 50kg y mechas de madera", monto: 280.00, fecha: "2026-10-02" },
    { id: "c-2", proveedor: "AromaLab Esencias", concepto: "Aceites esenciales botánicos puros", monto: 195.00, fecha: "2026-10-06" },
    { id: "c-3", proveedor: "Cerámicas Del Valle", concepto: "50 Cuencos de cerámica mate para velas Lumé", monto: 160.00, fecha: "2026-10-09" }
  ]
};

// ==============================================================================
// FUNCIONES DE ARCHIVO CENTRAL LOCAL (FALLBACK INMEDIATO PARA RENDER)
// ==============================================================================
async function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const dataDir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
      return JSON.parse(JSON.stringify(DEFAULT_STORE));
    }
    const content = fs.readFileSync(STORE_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("[ServerStore] Error al leer archivo central:", err.message);
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }
}

async function writeStore(data) {
  try {
    const dataDir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[ServerStore] Error al guardar archivo central:", err.message);
    return false;
  }
}

// ==============================================================================
// 1. PRODUCTOS
// ==============================================================================
export async function getAllProducts() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT * FROM productos ORDER BY creado_en DESC");
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(row => ({
          ...row,
          precio: parseFloat(row.precio),
          precio_oferta: row.precio_oferta ? parseFloat(row.precio_oferta) : null,
          stock: parseInt(row.stock, 10)
        }));
      }
    } catch (e) {
      console.warn("[ServerStore] PostgreSQL query error, usando store central:", e.message);
    }
  }

  const store = await readStore();
  return store.products || MOCK_PRODUCTS;
}

export async function addProduct(productData) {
  const newProduct = {
    id: "prod-" + Date.now(),
    nombre: productData.nombre,
    descripcion: productData.descripcion || "",
    precio: parseFloat(productData.precio) || 0,
    precio_oferta: productData.precio_oferta ? parseFloat(productData.precio_oferta) : null,
    es_oferta: Boolean(productData.es_oferta),
    stock: parseInt(productData.stock, 10) || 0,
    categoria: productData.categoria || "Velas Aromáticas",
    imagen_url: productData.imagen_url || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    creado_en: new Date().toISOString()
  };

  if (isAivenConfigured) {
    try {
      const sql = `
        INSERT INTO productos (nombre, descripcion, precio, precio_oferta, es_oferta, stock, imagen_url, categoria)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const values = [
        newProduct.nombre,
        newProduct.descripcion,
        newProduct.precio,
        newProduct.precio_oferta,
        newProduct.es_oferta,
        newProduct.stock,
        newProduct.imagen_url,
        newProduct.categoria
      ];
      const res = await query(sql, values);
      if (res && res.rows && res.rows[0]) {
        return res.rows[0];
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo insert PostgreSQL, guardando en store local:", e.message);
    }
  }

  const store = await readStore();
  store.products = [newProduct, ...(store.products || [])];
  await writeStore(store);
  return newProduct;
}

export async function editProduct(id, productData) {
  if (isAivenConfigured) {
    try {
      const sql = `
        UPDATE productos
        SET nombre = $1, descripcion = $2, precio = $3, precio_oferta = $4,
            es_oferta = $5, stock = $6, imagen_url = $7, categoria = $8
        WHERE id = $9
        RETURNING *;
      `;
      const values = [
        productData.nombre,
        productData.descripcion || "",
        parseFloat(productData.precio) || 0,
        productData.precio_oferta ? parseFloat(productData.precio_oferta) : null,
        Boolean(productData.es_oferta),
        parseInt(productData.stock, 10) || 0,
        productData.imagen_url,
        productData.categoria || "Velas Aromáticas",
        id
      ];
      const res = await query(sql, values);
      if (res && res.rows && res.rows[0]) {
        return res.rows[0];
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo update PostgreSQL, modificando store local:", e.message);
    }
  }

  const store = await readStore();
  store.products = (store.products || []).map(p => {
    if (p.id === id) {
      return {
        ...p,
        ...productData,
        precio: parseFloat(productData.precio !== undefined ? productData.precio : p.precio),
        precio_oferta: productData.precio_oferta !== undefined ? (productData.precio_oferta ? parseFloat(productData.precio_oferta) : null) : p.precio_oferta,
        stock: parseInt(productData.stock !== undefined ? productData.stock : p.stock, 10)
      };
    }
    return p;
  });
  await writeStore(store);
  return store.products.find(p => p.id === id);
}

export async function removeProduct(id) {
  if (isAivenConfigured) {
    try {
      await query("DELETE FROM productos WHERE id = $1", [id]);
    } catch (e) {
      console.warn("[ServerStore] Fallo delete PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  store.products = (store.products || []).filter(p => p.id !== id);
  await writeStore(store);
  return { success: true };
}

// ==============================================================================
// 2. BRANDING Y LOGO
// ==============================================================================
export async function getBranding() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT clave, valor FROM configuracion");
      if (res && res.rows && res.rows.length > 0) {
        const configMap = {};
        res.rows.forEach(r => { configMap[r.clave] = r.valor; });
        return {
          logo_url: configMap.logo_url || "/lume-logo.svg",
          store_name: configMap.store_name || "Lumé Home & Scents",
          brand_tagline: configMap.brand_tagline || "Luz, calma y esencias puras para tu espacio"
        };
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo select configuracion PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  return store.branding || DEFAULT_STORE.branding;
}

export async function setBranding({ logo_url, store_name, brand_tagline }) {
  const updated = {
    logo_url: logo_url || "/lume-logo.svg",
    store_name: store_name || "Lumé Home & Scents",
    brand_tagline: brand_tagline || "Luz, calma y esencias puras para tu espacio",
    actualizado_en: new Date().toISOString()
  };

  if (isAivenConfigured) {
    try {
      const sql = `
        INSERT INTO configuracion (clave, valor)
        VALUES ('logo_url', $1), ('store_name', $2), ('brand_tagline', $3)
        ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado_en = NOW();
      `;
      await query(sql, [updated.logo_url, updated.store_name, updated.brand_tagline]);
    } catch (e) {
      console.warn("[ServerStore] Fallo upsert configuracion PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  store.branding = updated;
  await writeStore(store);
  return updated;
}

// ==============================================================================
// 3. PEDIDOS Y VENTAS (CON DESCUENTO DE STOCK)
// ==============================================================================
export async function getAllOrders() {
  if (isAivenConfigured) {
    try {
      const sql = `
        SELECT v.id, v.total, v.fecha, v.estado,
               c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.direccion AS cliente_direccion,
               COUNT(dv.id) AS items_count
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        LEFT JOIN detalle_ventas dv ON v.id = dv.venta_id
        GROUP BY v.id, v.total, v.fecha, v.estado, c.nombre, c.telefono, c.direccion
        ORDER BY v.fecha DESC;
      `;
      const res = await query(sql);
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          total: parseFloat(r.total),
          fecha: r.fecha,
          estado: r.estado,
          clientes: {
            nombre: r.cliente_nombre || "Cliente Anónimo",
            telefono: r.cliente_telefono || "",
            direccion: r.cliente_direccion || ""
          },
          items_count: parseInt(r.items_count, 10) || 1
        }));
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo select ventas PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  return store.orders || DEFAULT_STORE.orders;
}

export async function addOrder({ customer, items, total, notas = "" }) {
  const orderId = "ord-" + Date.now();
  const parsedTotal = parseFloat(total) || 0;

  if (isAivenConfigured) {
    try {
      // Registrar cliente si no existe
      let clienteId = null;
      if (customer && customer.email) {
        const clientRes = await query("SELECT id FROM clientes WHERE email = $1", [customer.email]);
        if (clientRes.rows.length > 0) {
          clienteId = clientRes.rows[0].id;
        }
      }
      if (!clienteId && customer) {
        const newClientRes = await query(
          "INSERT INTO clientes (nombre, telefono, email, direccion) VALUES ($1, $2, $3, $4) RETURNING id",
          [customer.nombre, customer.telefono, customer.email, customer.direccion]
        );
        clienteId = newClientRes.rows[0].id;
      }

      // Insertar venta
      const ventaRes = await query(
        "INSERT INTO ventas (cliente_id, total, estado) VALUES ($1, $2, 'pendiente') RETURNING id",
        [clienteId, parsedTotal]
      );
      const insertedVentaId = ventaRes.rows[0].id;

      // Insertar detalle_ventas (dispara el trigger de descuento de stock de PostgreSQL)
      for (const item of items) {
        const itemPrice = parseFloat(item.precio_oferta || item.precio) || 0;
        const itemQty = parseInt(item.quantity, 10) || 1;
        const subtotal = itemPrice * itemQty;
        await query(
          "INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)",
          [insertedVentaId, item.id, itemQty, itemPrice, subtotal]
        );
      }

      return { orderId: insertedVentaId, success: true };
    } catch (e) {
      console.warn("[ServerStore] Fallo addOrder PostgreSQL, registrando en store local:", e.message);
    }
  }

  // Fallback: Store central en Render + Descuento atómico de stock
  const store = await readStore();
  const newOrder = {
    id: orderId,
    fecha: new Date().toISOString(),
    total: parsedTotal,
    estado: "pendiente",
    clientes: customer || { nombre: "Cliente", telefono: "", direccion: "" },
    items_count: (items || []).reduce((acc, it) => acc + (it.quantity || 1), 0),
    items: items || [],
    notas
  };

  // Descontar existencias en el store central
  if (items && Array.isArray(items)) {
    store.products = (store.products || []).map(p => {
      const match = items.find(it => it.id === p.id);
      if (match) {
        const newStock = Math.max(0, (parseInt(p.stock, 10) || 0) - (parseInt(match.quantity, 10) || 1));
        return { ...p, stock: newStock };
      }
      return p;
    });
  }

  store.orders = [newOrder, ...(store.orders || [])];
  await writeStore(store);
  return { orderId, success: true };
}

export async function updateOrderStatus(orderId, nuevoEstado) {
  if (isAivenConfigured) {
    try {
      await query("UPDATE ventas SET estado = $1 WHERE id = $2", [nuevoEstado, orderId]);
    } catch (e) {
      console.warn("[ServerStore] Fallo updateOrderStatus PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  store.orders = (store.orders || []).map(o => o.id === orderId ? { ...o, estado: nuevoEstado } : o);
  await writeStore(store);
  return { success: true };
}

// ==============================================================================
// 4. GESTIÓN DE USUARIOS ADMINISTRADORES
// ==============================================================================
export async function getAllUsers() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT id, nombre, email, usuario, rol, activo, creado_en FROM usuarios_admin ORDER BY creado_en DESC");
      if (res && res.rows && res.rows.length > 0) {
        return res.rows;
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo select usuarios_admin PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  return (store.users || DEFAULT_STORE.users).map(u => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    usuario: u.usuario,
    rol: u.rol,
    creado_en: u.creado_en,
    esMaster: u.esMaster || false
  }));
}

export async function addUser({ nombre, email, password, rol = "Administrador" }) {
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

  if (isAivenConfigured) {
    try {
      const sql = `
        INSERT INTO usuarios_admin (nombre, email, usuario, password, rol, activo)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING id, nombre, email, usuario, rol, creado_en;
      `;
      const res = await query(sql, [newUser.nombre, newUser.email, newUser.usuario, newUser.password, newUser.rol]);
      if (res && res.rows && res.rows[0]) {
        return res.rows[0];
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo addUser PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  store.users = [...(store.users || []), newUser];
  await writeStore(store);
  return {
    id: newUser.id,
    nombre: newUser.nombre,
    email: newUser.email,
    usuario: newUser.usuario,
    rol: newUser.rol,
    creado_en: newUser.creado_en
  };
}

export async function removeUser(id) {
  if (id === "usr-admin-master") {
    throw new Error("No se puede eliminar el usuario administrador maestro.");
  }

  if (isAivenConfigured) {
    try {
      await query("DELETE FROM usuarios_admin WHERE id = $1", [id]);
    } catch (e) {
      console.warn("[ServerStore] Fallo delete usuario PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  store.users = (store.users || []).filter(u => u.id !== id);
  await writeStore(store);
  return { success: true };
}

export async function authenticateUser(identifier, password) {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  if (isAivenConfigured) {
    try {
      const sql = `
        SELECT id, nombre, email, usuario, rol, activo
        FROM usuarios_admin
        WHERE (LOWER(email) = $1 OR LOWER(usuario) = $1)
          AND password = $2
          AND activo = true;
      `;
      const res = await query(sql, [cleanId, cleanPass]);
      if (res && res.rows && res.rows.length > 0) {
        return res.rows[0];
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo auth PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  const found = (store.users || []).find(
    u => (u.email?.toLowerCase() === cleanId || u.usuario?.toLowerCase() === cleanId) && u.password === cleanPass
  );

  if (found) {
    return {
      id: found.id,
      nombre: found.nombre,
      email: found.email,
      usuario: found.usuario,
      rol: found.rol
    };
  }
  return null;
}

// ==============================================================================
// 5. FINANZAS Y CLIENTES
// ==============================================================================
export async function getFinances() {
  if (isAivenConfigured) {
    try {
      const gastosRes = await query("SELECT * FROM gastos ORDER BY fecha DESC");
      const comprasRes = await query("SELECT * FROM compras ORDER BY fecha DESC");
      return {
        gastos: gastosRes.rows.map(g => ({ ...g, monto: parseFloat(g.monto) })),
        compras: comprasRes.rows.map(c => ({ ...c, monto: parseFloat(c.monto) }))
      };
    } catch (e) {
      console.warn("[ServerStore] Fallo finances PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  return {
    gastos: store.gastos || DEFAULT_STORE.gastos,
    compras: store.compras || DEFAULT_STORE.compras
  };
}

export async function getAllClients() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT * FROM clientes ORDER BY creado_en DESC");
      if (res && res.rows) return res.rows;
    } catch (e) {
      console.warn("[ServerStore] Fallo clients PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  return store.clients || DEFAULT_STORE.clients;
}
