"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isConfigured, signInWithGoogle, signOutAdmin, getCurrentUser } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Error al inicializar sesión:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    const { data, error } = await signInWithGoogle();
    if (data?.user) {
      setUser(data.user);
    }
    setLoading(false);
    return { data, error };
  };

  const logout = async () => {
    setLoading(true);
    await signOutAdmin();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
