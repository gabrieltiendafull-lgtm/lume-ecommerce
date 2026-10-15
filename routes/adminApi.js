// ==============================================================================
// RUTAS DE EJEMPLO EXPRESS - INTEGRACIÓN SUPABASE AUTH + AIVEN.IO POSTGRESQL
// ==============================================================================
// Protegidas por authMiddleware (valida JWT de Supabase Auth antes de consultar Aiven)

import express from "express";
import { query, getClient } from "../lib/db.js";
import { authMiddleware } from "../authMiddleware.js";

const router = express.Router();

/**
 * 1. LISTAR PRODUCTOS (Desde Aiven.io)
 * Ruta protegida para administradores
 */
router.get("/productos", authMiddleware, async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM productos ORDER BY creado_en DESC"
    );
    res.json({ success: true, data: result.rows, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. CREAR PRODUCTO (En Aiven.io con imagen_url pública)
 * Ruta protegida para administradores
 */
router.post("/productos", authMiddleware, async (req, res) => {
  const { nombre, descripcion, precio, precio_oferta, es_oferta, stock, imagen_url, categoria } = req.body;

  try {
    const result = await query(
      `INSERT INTO productos 
       (nombre, descripcion, precio, precio_oferta, es_oferta, stock, imagen_url, categoria)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nombre, descripcion, precio, precio_oferta || null, es_oferta || false, stock || 0, imagen_url, categoria || "Velas Aromáticas"]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. REGISTRAR VENTA (Dispara el TRIGGER en Aiven.io que descuenta stock)
 */
router.post("/ventas", async (req, res) => {
  const { cliente_id, items, total, notas } = req.body;
  const client = await getClient();

  try {
    await client.query("BEGIN"); // Inicio de transacción atómica

    // 1. Insertar venta
    const ventaRes = await client.query(
      `INSERT INTO ventas (cliente_id, total, estado)
       VALUES ($1, $2, 'pendiente')
       RETURNING id`,
      [cliente_id || null, total]
    );
    const ventaId = ventaRes.rows[0].id;

    // 2. Insertar cada detalle de venta (el Trigger de Aiven descontará el stock)
    for (const item of items) {
      await client.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [ventaId, item.producto_id, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]
      );
    }

    await client.query("COMMIT"); // Confirmar transacción

    res.status(201).json({ success: true, venta_id: ventaId, message: "Venta registrada y stock descontado por trigger." });
  } catch (error) {
    await client.query("ROLLBACK"); // Revertir en caso de error (ej. stock insuficiente)
    res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

/**
 * 4. BALANCE FINANCIERO (Ventas vs Egresos en Aiven.io)
 * Ruta protegida para administradores
 */
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const ventasRes = await query("SELECT COALESCE(SUM(total), 0) as total_ventas FROM ventas WHERE estado != 'cancelado'");
    const gastosRes = await query("SELECT COALESCE(SUM(monto), 0) as total_gastos FROM gastos");
    const comprasRes = await query("SELECT COALESCE(SUM(monto), 0) as total_compras FROM compras");

    const totalVentas = parseFloat(ventasRes.rows[0].total_ventas);
    const totalGastos = parseFloat(gastosRes.rows[0].total_gastos);
    const totalCompras = parseFloat(comprasRes.rows[0].total_compras);
    const totalEgresos = totalGastos + totalCompras;
    const gananciaNeta = totalVentas - totalEgresos;

    res.json({
      success: true,
      data: {
        total_ventas: totalVentas,
        total_gastos: totalGastos,
        total_compras: totalCompras,
        total_egresos: totalEgresos,
        ganancia_neta: gananciaNeta,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
