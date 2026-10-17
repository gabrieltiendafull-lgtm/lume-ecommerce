"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingDown,
  Users,
  ExternalLink,
  LogOut,
  Sparkles,
  KeyRound,
  Palette
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { logoUrl, storeName } = useBranding();

  const navItems = [
    { name: "Dashboard Financiero", href: "/admin", icon: LayoutDashboard },
    { name: "Gestión de Productos", href: "/admin/productos", icon: Package },
    { name: "Ventas y POS", href: "/admin/ventas", icon: ShoppingBag },
    { name: "Gastos y Compras", href: "/admin/finanzas", icon: TrendingDown },
    { name: "Clientes", href: "/admin/clientes", icon: Users },
    { name: "Usuarios y Accesos", href: "/admin/usuarios", icon: KeyRound },
    { name: "Configuración & Logo", href: "/admin/configuracion", icon: Palette },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col flex-shrink-0 min-h-screen border-r border-stone-800">
      
      {/* Brand Header con Logo Dinámico */}
      <div className="p-6 border-b border-stone-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
              <img
                src={logoUrl || "/lume-logo.png"}
                alt={storeName || "Lumé"}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-editorial text-xl font-bold tracking-widest text-white block leading-none truncate">
                {storeName?.split(" ")[0]?.toUpperCase() || "LUMÉ"}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#B8944F] font-semibold">
                Admin Suite
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 mb-2">
          Módulos del Sistema
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#9D7940] text-white shadow-md shadow-[#9D7940]/20"
                  : "text-stone-400 hover:text-white hover:bg-stone-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-stone-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 mb-2">
          Canal de Ventas
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-[#B8944F]" />
            <span>Ver Catálogo Público</span>
          </div>
        </Link>
      </nav>

      {/* Usuario y Logout */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/40">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-stone-800 border border-[#9D7940] flex items-center justify-center font-bold text-[#DAC594] text-xs">
            {user?.nombre?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {user?.nombre || user?.email || "Administrador"}
            </p>
            <p className="text-[10px] text-stone-400 truncate">
              {user?.rol || "Administrador General"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </aside>
  );
}
