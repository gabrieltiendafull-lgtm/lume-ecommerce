// ==============================================================================
// MIDDLEWARE DE AUTENTICACIÓN - SUPABASE JWT AUTH (EXPRESS / NODE.JS)
// ==============================================================================

import { verifySessionToken } from "../lib/supabaseAuth.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers["Authorization"];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Acceso denegado. No se proporcionó la cabecera Authorization.",
      });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({
        success: false,
        error: "Formato de autorización inválido. Debe ser: 'Bearer <token>'.",
      });
    }

    const token = parts[1];
    const { user, error } = await verifySessionToken(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Sesión inválida o token expirado. Por favor inicie sesión nuevamente.",
        details: error?.message || null,
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || "authenticated",
      metadata: user.user_metadata || {},
    };

    next();
  } catch (err) {
    console.error("[Auth Middleware Error]:", err);
    return res.status(500).json({
      success: false,
      error: "Error interno verificando la autenticación del usuario.",
    });
  }
}

export default authMiddleware;
