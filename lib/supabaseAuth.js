// ==============================================================================
// CLIENTE SUPABASE AUTH - ENFOCADO EXCLUSIVAMENTE EN AUTENTICACIÓN
// ==============================================================================
// Utiliza SUPABASE_URL y SUPABASE_ANON_KEY para verificación de sesiones,
// emisión y validación de tokens JWT. La data de negocio reside en Aiven.io.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isSupabaseAuthConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("placeholder") && 
  !supabaseAnonKey.includes("placeholder")
);

export const supabaseAuth = isSupabaseAuthConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createClient("https://placeholder-project.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder");

export { isSupabaseAuthConfigured };

/**
 * Valida un token JWT de Supabase Auth
 * @param {string} token - Token Bearer JWT recibido en las cabeceras
 * @returns {Promise<{ user: object | null, error: object | null }>}
 */
export async function verifySessionToken(token) {
  if (!token) {
    return { user: null, error: new Error("Token no suministrado") };
  }

  if (!isSupabaseAuthConfigured) {
    // Modo demostración / desarrollo si aún no se configuran variables reales
    if (token === "demo-admin-token" || token.length > 10) {
      return {
        user: {
          id: "usr-admin-demo",
          email: "admin@lume.com",
          role: "authenticated",
          user_metadata: { full_name: "Administrador Lumé" },
        },
        error: null,
      };
    }
    return { user: null, error: new Error("Supabase Auth no configurado") };
  }

  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    return { user, error };
  } catch (err) {
    return { user: null, error: err };
  }
}

/**
 * Inicia sesión con correo y contraseña en Supabase Auth
 */
export async function signInAdmin(email, password) {
  if (!isSupabaseAuthConfigured) {
    // Verificación de respaldo para demostración
    if ((email === "admin@lume.com" || email === "admin") && password === "admin123") {
      return {
        data: {
          user: { id: "usr-admin-master", email: "admin@lume.com", user_metadata: { full_name: "Administrador Lumé" } },
          session: { access_token: "demo-admin-token" },
        },
        error: null,
      };
    }
    return { data: null, error: { message: "Credenciales inválidas" } };
  }

  return await supabaseAuth.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password.trim(),
  });
}

/**
 * Registra un nuevo usuario en Supabase Auth
 */
export async function signUpAdmin(email, password, metadata = {}) {
  if (!isSupabaseAuthConfigured) {
    return {
      data: {
        user: { id: "usr-" + Date.now(), email, user_metadata: metadata },
      },
      error: null,
    };
  }

  return await supabaseAuth.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password.trim(),
    options: {
      data: metadata,
    },
  });
}

/**
 * Cierra la sesión activa en Supabase Auth
 */
export async function signOutAdmin() {
  if (!isSupabaseAuthConfigured) return { error: null };
  return await supabaseAuth.auth.signOut();
}
