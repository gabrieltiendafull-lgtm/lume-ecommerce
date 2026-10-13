"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Sparkles, Loader2 } from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [loading, isAuthenticated, pathname, router]);

  // Si estamos en la página de login, renderizar sin la sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Pantalla de carga mientras se verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9D7940] to-[#E8DCBE] flex items-center justify-center shadow-lg animate-pulse">
          <Sparkles className="w-6 h-6 text-stone-900" />
        </div>
        <p className="text-xs uppercase tracking-widest text-[#DAC594] font-semibold">
          Verificando credenciales de Lume...
        </p>
      </div>
    );
  }

  // Si no está autenticado, no renderizar el contenido protegido
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
