// ==============================================================================
// MIDDLEWARE DE AUTENTICACIÓN - SUPABASE JWT AUTH (EXPRESS / NODE.JS)
// ==============================================================================
// Intercepta las solicitudes administrativas, extrae el token Bearer JWT de
// Supabase Auth, lo valida y protege el acceso a la base de datos de Aiven.io.

import { verifySessionToken } from "./lib/supabaseAuth.js";

/**
 * Middleware para Express.js
 * Uso: app.use("/api/admin", authMiddleware);
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers["Authorization"];

    // 1. Validar presencia del header Authorization
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Acceso denegado. No se proporcionó la cabecera Authorization.",
      });
    }

    // 2. Extraer el token Bearer
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({
        success: false,
        error: "Formato de autorización inválido. Debe ser: 'Bearer <token>'.",
      });
    }

    const token = parts[1];

    // 3. Validar token JWT con Supabase Auth
    const { user, error } = await verifySessionToken(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Sesión inválida o token expirado. Por favor inicie sesión nuevamente.",
        details: error?.message || null,
      });
    }

    // 4. Adjuntar datos del usuario validado a la solicitud
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || "authenticated",
      metadata: user.user_metadata || {},
    };

    // Continuar con la consulta o transacción hacia Aiven.io
    next();
  } catch (err) {
    console.error("[Auth Middleware Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Error interno verificando la autenticación del usuario.",
    });
  }
}

/**
 * Helper para Next.js App Router (Route Handlers /api/...)
 * Uso: const user = await requireAuth(request);
 */
export async function requireAuth(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      user: null,
      error: "Token Bearer no proporcionado en la cabecera",
      status: 401,
    };
  }

  const token = authHeader.split(" ")[1];
  const { user, error } = await verifySessionToken(token);

  if (error || !user) {
    return {
      user: null,
      error: "Token de Supabase inválido o expirado",
      status: 401,
    };
  }

  return { user, error: null, status: 200 };
}

export default authMiddleware;
