// ==============================================================================
// CONEXIÓN A BASE DE DATOS POSTGRESQL - AIVEN.IO
// ==============================================================================
// Utiliza node-postgres (pg) con Connection Pooling optimizado para Aiven.io.

import { Pool } from "pg";

const connectionString = process.env.AIVEN_DATABASE_URL || "";

const isAivenConfigured = Boolean(
  connectionString && 
  !connectionString.includes("placeholder") &&
  connectionString.startsWith("postgres")
);

// Configuración del Pool de conexiones para Aiven.io
let pool = null;

if (isAivenConfigured) {
  pool = new Pool({
    connectionString: connectionString,
    ssl: {
      // Aiven.io exige conexión cifrada TLS/SSL
      rejectUnauthorized: false,
    },
    max: 20, // Máximo de conexiones concurrentes en el pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on("error", (err) => {
    console.error("Error inesperado en el pool de Aiven PostgreSQL:", err);
  });
}

/**
 * Ejecuta una consulta SQL en la base de datos de Aiven.io
 * @param {string} text - Sentencia SQL parametrizada
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<QueryResult>}
 */
export async function query(text, params) {
  if (!isAivenConfigured || !pool) {
    console.warn("Aiven.io no configurado. Defina AIVEN_DATABASE_URL en las variables de entorno.");
    return { rows: [] };
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Aiven DB] Ejecutada consulta en ${duration}ms:`, { text, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error("[Aiven DB Error] Falló consulta SQL:", { text, error: error.message });
    throw error;
  }
}

/**
 * Obtiene un cliente dedicado del pool para transacciones (BEGIN, COMMIT, ROLLBACK)
 */
export async function getClient() {
  if (!isAivenConfigured || !pool) {
    throw new Error("Pool de Aiven no disponible. Verifique AIVEN_DATABASE_URL.");
  }
  return await pool.connect();
}

export { pool, isAivenConfigured };
