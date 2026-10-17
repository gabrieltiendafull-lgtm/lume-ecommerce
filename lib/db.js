// Conexión de servidor a PostgreSQL administrado por Supabase.
// Render nunca debe usar localhost ni su disco efímero como base de datos.
import { Pool } from "pg";

// En Supabase usa la URI de "Connection pooling" en modo Session.
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "";
const isSupabaseDatabaseConfigured = Boolean(
  connectionString &&
  !connectionString.includes("placeholder") &&
  connectionString.startsWith("postgres")
);

const pool = isSupabaseDatabaseConfigured
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : null;

if (pool) {
  pool.on("error", (error) => {
    console.error("Error inesperado en el pool de Supabase:", error.message);
  });
}

export async function query(text, params) {
  if (!pool) {
    throw new Error("Supabase no está configurado. Define SUPABASE_DB_URL en Render.");
  }
  return pool.query(text, params);
}

export async function getClient() {
  if (!pool) {
    throw new Error("Supabase no está configurado. Define SUPABASE_DB_URL en Render.");
  }
  return pool.connect();
}

export { pool, isSupabaseDatabaseConfigured };
// Compatibilidad temporal con las rutas existentes; no representa Aiven.
export { isSupabaseDatabaseConfigured as isAivenConfigured };
