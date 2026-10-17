"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowLeft
} from "lucide-react";

export default function AdminLoginPage() {
  const { loginWithCredentials, isAuthenticated } = useAuth();
  const { logoUrl, storeName } = useBranding();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Si ya está autenticado, enviar directamente al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Por favor ingresa tu usuario/correo y contraseña.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: loginError } = await loginWithCredentials(identifier, password);
      if (loginError) {
        setError(loginError.message || "Usuario o contraseña incorrectos.");
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("Error de autenticación. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const useDefaultCredentials = () => {
    setIdentifier("admin@lume.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 selection:bg-[#DAC594] selection:text-stone-900">
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-800">
        
        {/* Encabezado con Logo Dinámico */}
        <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 p-8 text-center text-white relative border-b border-stone-800">
          
          <div className="mb-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-stone-800">
              <img
                src={logoUrl || "/lume-logo.png"}
                alt={storeName || "Lumé"}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="font-editorial text-2xl font-bold tracking-widest text-white leading-tight">
            ACCESO ADMINISTRADOR
          </h2>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#DAC594] mt-1 font-semibold">
            {storeName} &bull; Panel de Control
          </p>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <div className="p-8 space-y-5">
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo Usuario / Email */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Usuario o Correo Electrónico
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@lume.com o admin"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Ingreso */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Tarjeta de ayuda con credenciales iniciales */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-[#9D7940]">
                <KeyRound className="w-3.5 h-3.5" />
                Credenciales Iniciales:
              </span>
              <button
                type="button"
                onClick={useDefaultCredentials}
                className="text-[11px] underline font-bold text-amber-800 hover:text-amber-950"
              >
                Autocompletar
              </button>
            </div>
            <p className="text-[11px] text-amber-800">
              <strong>Usuario:</strong> <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin@lume.com</code> (o <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin</code>)<br />
              <strong>Contraseña:</strong> <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin123</code>
            </p>
            <p className="text-[10px] text-amber-700 pt-0.5">
              💡 Dentro del panel podrás crear nuevos usuarios con sus contraseñas en la sección <strong>&quot;Usuarios y Accesos&quot;</strong>.
            </p>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la tienda pública</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
