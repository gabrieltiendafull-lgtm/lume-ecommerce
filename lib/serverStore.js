// ==============================================================================
// ALMACENAMIENTO CENTRALIZADO DEL SERVIDOR - LUMÉ E-COMMERCE
// ==============================================================================
// Joyas, Pulseras, Cadenitas y Accesorios de Mujer Delicados.
// Persistencia unificada para sincronizar celular, computadora y cualquier
// dispositivo en Render.
// ==============================================================================

import { query, isAivenConfigured } from "./db";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "./mockData";

const DEFAULT_STORE = {
  categories: MOCK_CATEGORIES,
  products: MOCK_PRODUCTS,
  branding: {
    logo_url: "/lume-logo.png",
    store_name: "Lumé Joyas & Accesorios",
    brand_tagline: "Joyas, pulseras y cadenitas delicadas para mujer",
    whatsapp_phone: "+54 9 11 2233-4455",
    whatsapp_button_text: "Enviar Confirmación por WhatsApp",
    whatsapp_custom_msg: "¡Hola Lumé! Quiero confirmar mi pedido realizado en la tienda online.",
    actualizado_en: new Date().toISOString()
  },
  orders: [
    {
      id: "v-101",
      fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
      total: 53.50,
      estado: "pendiente",
      clientes: { nombre: "Valentina Morales", telefono: "+54 9 11 4455-6677", direccion: "Palermo Soho, CABA" },
      items_count: 2,
      notas: "Para regalo en caja de terciopelo"
    },
    {
      id: "v-100",
      fecha: new Date(Date.now() - 3600000 * 24).toISOString(),
      total: 28.00,
      estado: "completado",
      clientes: { nombre: "Lucía Fernández", telefono: "+54 9 11 9988-7766", direccion: "Recoleta, CABA" },
      items_count: 1,
      notas: ""
    }
  ],
  clients: [
    { id: "cl-1", nombre: "Valentina Morales", email: "valentina@gmail.com", telefono: "+54 9 11 4455-6677", direccion: "Palermo Soho, CABA", creado_en: "2026-09-12" },
    { id: "cl-2", nombre: "Lucía Fernández", email: "lucia.f@outlook.com", telefono: "+54 9 11 9988-7766", direccion: "Recoleta, CABA", creado_en: "2026-09-20" },
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
    { id: "g-1", concepto: "Estuches y Cajas Joyeras de Terciopelo Lumé", monto: 180.00, categoria: "Empaque", fecha: "2026-10-01" },
    { id: "g-2", concepto: "Campaña Publicitaria Instagram & TikTok Joyas", monto: 120.00, categoria: "Marketing", fecha: "2026-10-05" },
    { id: "g-3", concepto: "Fotografía Profesional de Joyas y Modelos", monto: 200.00, categoria: "Contenido", fecha: "2026-10-08" }
  ],
  compras: [
    { id: "c-1", proveedor: "Silversmith & Co.", concepto: "Partida de Cadenitas y Dijes Plata 925", monto: 450.00, fecha: "2026-10-02" },
    { id: "c-2", proveedor: "Gems & Gold Plating Labs", concepto: "Baño en Oro 18k y Circonitas Cúbicas AAA", monto: 320.00, fecha: "2026-10-06" },
    { id: "c-3", proveedor: "Pearl River Cultured", concepto: "Lote de Perlas de Río Naturales Cultivadas", monto: 210.00, fecha: "2026-10-09" }
  ]
};

// ==============================================================================
// Render descarta el sistema de archivos al reiniciar. No se permite un respaldo
// local: toda lectura y escritura de producción debe llegar a Supabase.
// ==============================================================================
async function readStore() {
  throw new Error("No hay respaldo local. Configura SUPABASE_DB_URL para usar Supabase.");
}

async function writeStore() {
  throw new Error("No hay respaldo local. Configura SUPABASE_DB_URL para usar Supabase.");
}

// ==============================================================================
// 1. GESTIÓN DE CATEGORÍAS (AGREGAR, MODIFICAR, ELIMINAR)
// ==============================================================================

export async function getAllCategories() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT nombre FROM categorias ORDER BY nombre ASC");
      if (res && res.rows) return res.rows.map(r => r.nombre);
    } catch (e) {
      console.warn("[ServerStore] Tabla categorias no disponible en Postgres:", e.message);
    }
  }

  const store = await readStore();
  return store.categories || MOCK_CATEGORIES;
}

export async function addCategory(nombre) {
  const cleanName = (nombre || "").trim();
  if (!cleanName) throw new Error("El nombre de la categoría no puede estar vacío.");

  if (isAivenConfigured) {
    try {
      await query("INSERT INTO categorias (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING", [cleanName]);
      return getAllCategories();
    } catch (e) {
      console.warn("[ServerStore] Fallo insert categoria Postgres:", e.message);
    }
  }

  const store = await readStore();
  if (!store.categories) store.categories = [...MOCK_CATEGORIES];
  if (!store.categories.includes(cleanName)) {
    store.categories.push(cleanName);
    await writeStore(store);
  }
  return store.categories;
}

export async function editCategory(oldNombre, newNombre) {
  const cleanOld = (oldNombre || "").trim();
  const cleanNew = (newNombre || "").trim();
  if (!cleanOld || !cleanNew) throw new Error("Nombres inválidos para editar categoría.");

  if (isAivenConfigured) {
    try {
      await query("UPDATE categorias SET nombre = $1 WHERE nombre = $2", [cleanNew, cleanOld]);
      await query("UPDATE productos SET categoria = $1 WHERE categoria = $2", [cleanNew, cleanOld]);
      return getAllCategories();
    } catch (e) {
      console.warn("[ServerStore] Fallo update categoria Postgres:", e.message);
    }
  }

  const store = await readStore();
  store.categories = (store.categories || MOCK_CATEGORIES).map(c => c === cleanOld ? cleanNew : c);
  // Actualizar también en los productos asociados
  store.products = (store.products || []).map(p => p.categoria === cleanOld ? { ...p, categoria: cleanNew } : p);
  await writeStore(store);
  return store.categories;
}

export async function removeCategory(nombre) {
  const cleanName = (nombre || "").trim();
  if (!cleanName) throw new Error("Nombre de categoría requerido para eliminar.");

  if (isAivenConfigured) {
    try {
      await query("DELETE FROM categorias WHERE nombre = $1", [cleanName]);
      await query("UPDATE productos SET categoria = 'Accesorios de Mujer' WHERE categoria = $1", [cleanName]);
      return getAllCategories();
    } catch (e) {
      console.warn("[ServerStore] Fallo delete categoria Postgres:", e.message);
    }
  }

  const store = await readStore();
  store.categories = (store.categories || MOCK_CATEGORIES).filter(c => c !== cleanName);
  // Reasignar productos huérfanos a la primera categoría disponible
  const fallbackCat = store.categories[0] || "Accesorios de Mujer";
  store.products = (store.products || []).map(p => p.categoria === cleanName ? { ...p, categoria: fallbackCat } : p);
  await writeStore(store);
  return store.categories;
}

// ==============================================================================
// 2. PRODUCTOS (JOYAS Y ACCESORIOS)
// ==============================================================================

export async function getAllProducts() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT * FROM productos ORDER BY creado_en DESC");
      if (res && res.rows) {
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
    categoria: productData.categoria || "Cadenitas y Gargantillas",
    imagen_url: productData.imagen_url || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
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
        productData.categoria || "Cadenitas y Gargantillas",
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
      return { success: true };
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
// 3. BRANDING, LOGO Y CONFIGURACIÓN DE WHATSAPP
// ==============================================================================

export async function getBranding() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT clave, valor FROM configuracion");
      if (res && res.rows) {
        const configMap = {};
        res.rows.forEach(r => { configMap[r.clave] = r.valor; });
        const resolvedLogo = (!configMap.logo_url || configMap.logo_url === "/lume-logo.svg" || configMap.logo_url.startsWith("blob:"))
          ? "/lume-logo.png"
          : configMap.logo_url;
        return {
          logo_url: resolvedLogo,
          store_name: configMap.store_name || "Lumé Joyas & Accesorios",
          brand_tagline: configMap.brand_tagline || "Joyas, pulseras y cadenitas delicadas para mujer",
          whatsapp_phone: configMap.whatsapp_phone || "+54 9 11 2233-4455",
          whatsapp_button_text: configMap.whatsapp_button_text || "Enviar Confirmación por WhatsApp",
          whatsapp_custom_msg: configMap.whatsapp_custom_msg || ""
        };
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo select configuracion PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  const branding = store.branding || DEFAULT_STORE.branding;
  if (!branding.logo_url || branding.logo_url === "/lume-logo.svg" || branding.logo_url.startsWith("blob:")) {
    branding.logo_url = "/lume-logo.png";
  }
  return branding;
}

export async function setBranding({
  logo_url,
  store_name,
  brand_tagline,
  whatsapp_phone,
  whatsapp_button_text,
  whatsapp_custom_msg
}) {
  const current = await getBranding();

  const updated = {
    logo_url: logo_url !== undefined ? logo_url : current.logo_url,
    store_name: store_name !== undefined ? store_name : current.store_name,
    brand_tagline: brand_tagline !== undefined ? brand_tagline : current.brand_tagline,
    whatsapp_phone: whatsapp_phone !== undefined ? whatsapp_phone : current.whatsapp_phone,
    whatsapp_button_text: whatsapp_button_text !== undefined ? whatsapp_button_text : current.whatsapp_button_text,
    whatsapp_custom_msg: whatsapp_custom_msg !== undefined ? whatsapp_custom_msg : current.whatsapp_custom_msg,
    actualizado_en: new Date().toISOString()
  };

  if (isAivenConfigured) {
    try {
      const entries = Object.entries(updated).filter(([k]) => k !== "actualizado_en");
      for (const [clave, valor] of entries) {
        const sql = `
          INSERT INTO configuracion (clave, valor)
          VALUES ($1, $2)
          ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado_en = NOW();
        `;
        await query(sql, [clave, valor || ""]);
      }
      return updated;
    } catch (e) {
      console.warn("[ServerStore] Fallo upsert configuracion PostgreSQL:", e.message);
    }
  }

  store.branding = updated;
  await writeStore(store);
  return updated;
}

// ==============================================================================
// 4. PEDIDOS Y VENTAS (CON DESCUENTO DE STOCK)
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
      if (res && res.rows) {
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

      const ventaRes = await query(
        "INSERT INTO ventas (cliente_id, total, estado) VALUES ($1, $2, 'pendiente') RETURNING id",
        [clienteId, parsedTotal]
      );
      const insertedVentaId = ventaRes.rows[0].id;

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
      return { success: true };
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
// 5. GESTIÓN DE USUARIOS ADMINISTRADORES
// ==============================================================================

export async function getAllUsers() {
  if (isAivenConfigured) {
    try {
      const res = await query("SELECT id, nombre, email, usuario, rol, activo, creado_en FROM usuarios_admin ORDER BY creado_en DESC");
      if (res && res.rows) {
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
      return { success: true };
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
      if (res && res.rows) return res.rows[0] || null;
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
// 6. FINANZAS Y CLIENTES
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

export async function addGasto({ concepto, monto, categoria = "Operativo", fecha }) {
  const cleanConcepto = (concepto || "").trim();
  const numMonto = parseFloat(monto);
  const cleanCat = (categoria || "Operativo").trim();
  const cleanFecha = fecha ? new Date(fecha).toISOString() : new Date().toISOString();

  if (!cleanConcepto) throw new Error("El concepto del gasto es obligatorio.");
  if (isNaN(numMonto) || numMonto <= 0) throw new Error("El monto del gasto debe ser mayor a 0.");

  if (isAivenConfigured) {
    try {
      const sql = `
        INSERT INTO gastos (concepto, monto, categoria, fecha)
        VALUES ($1, $2, $3, $4)
        RETURNING id, concepto, monto, categoria, fecha;
      `;
      const res = await query(sql, [cleanConcepto, numMonto, cleanCat, cleanFecha]);
      if (res && res.rows && res.rows[0]) {
        const row = res.rows[0];
        return { ...row, monto: parseFloat(row.monto) };
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo insert gasto PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  const newGasto = {
    id: "g-" + Date.now(),
    concepto: cleanConcepto,
    monto: numMonto,
    categoria: cleanCat,
    fecha: cleanFecha
  };
  store.gastos = [newGasto, ...(store.gastos || [])];
  await writeStore(store);
  return newGasto;
}

export const addExpense = addGasto;

export async function removeGasto(id) {
  if (!id) throw new Error("ID de gasto requerido.");

  if (isAivenConfigured) {
    try {
      await query("DELETE FROM gastos WHERE id = $1", [id]);
      return { success: true };
    } catch (e) {
      console.warn("[ServerStore] Fallo delete gasto PostgreSQL:", e.message);
      throw e;
    }
  }

  const store = await readStore();
  store.gastos = (store.gastos || []).filter(g => g.id !== id);
  await writeStore(store);
  return { success: true };
}

export const removeExpense = removeGasto;
export const deleteExpense = removeGasto;

export async function addCompra({ proveedor, concepto, monto, fecha }) {
  const cleanProv = (proveedor || "").trim();
  const cleanConcepto = (concepto || "").trim();
  const numMonto = parseFloat(monto);
  const cleanFecha = fecha ? new Date(fecha).toISOString() : new Date().toISOString();

  if (!cleanProv) throw new Error("El proveedor es obligatorio.");
  if (!cleanConcepto) throw new Error("El concepto de compra es obligatorio.");
  if (isNaN(numMonto) || numMonto <= 0) throw new Error("El monto de la compra debe ser mayor a 0.");

  if (isAivenConfigured) {
    try {
      const sql = `
        INSERT INTO compras (proveedor, concepto, monto, fecha)
        VALUES ($1, $2, $3, $4)
        RETURNING id, proveedor, concepto, monto, fecha;
      `;
      const res = await query(sql, [cleanProv, cleanConcepto, numMonto, cleanFecha]);
      if (res && res.rows && res.rows[0]) {
        const row = res.rows[0];
        return { ...row, monto: parseFloat(row.monto) };
      }
    } catch (e) {
      console.warn("[ServerStore] Fallo insert compra PostgreSQL:", e.message);
    }
  }

  const store = await readStore();
  const newCompra = {
    id: "c-" + Date.now(),
    proveedor: cleanProv,
    concepto: cleanConcepto,
    monto: numMonto,
    fecha: cleanFecha
  };
  store.compras = [newCompra, ...(store.compras || [])];
  await writeStore(store);
  return newCompra;
}

export const addPurchase = addCompra;

export async function removeCompra(id) {
  if (!id) throw new Error("ID de compra requerido.");

  if (isAivenConfigured) {
    try {
      await query("DELETE FROM compras WHERE id = $1", [id]);
      return { success: true };
    } catch (e) {
      console.warn("[ServerStore] Fallo delete compra PostgreSQL:", e.message);
      throw e;
    }
  }

  const store = await readStore();
  store.compras = (store.compras || []).filter(c => c.id !== id);
  await writeStore(store);
  return { success: true };
}

export const removePurchase = removeCompra;
export const deletePurchase = removeCompra;

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
