"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useBranding } from "@/context/BrandingContext";
import { ShoppingBag, ShieldCheck, Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { logoUrl, storeName } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 rounded-lg"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo Corporativo Dinámico */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="group flex items-center gap-3">
              {logoUrl && logoUrl !== "/lume-logo.svg" ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-11 max-w-[180px] object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9D7940] to-[#E8DCBE] p-0.5 flex items-center justify-center shadow-sm">
                    <div className="w-full h-full bg-[#FAF8F5] rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#9D7940] group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-editorial text-2xl font-bold tracking-[0.25em] text-stone-900 leading-none">
                      {storeName?.split(" ")[0]?.toUpperCase() || "LUME"}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#9D7940] font-semibold mt-0.5">
                      {storeName?.split(" ").slice(1).join(" ") || "Home & Scents"}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Enlaces de Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <Link href="#catalogo" className="text-stone-600 hover:text-[#9D7940] transition-colors">
              Catálogo
            </Link>
            <Link href="#ofertas" className="text-stone-600 hover:text-[#9D7940] transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Ofertas
            </Link>
            <Link href="#sobre-lume" className="text-stone-600 hover:text-[#9D7940] transition-colors">
              Nuestra Esencia
            </Link>
            <Link href="#contacto" className="text-stone-600 hover:text-[#9D7940] transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Botones de Acción (Carrito y Acceso Admin) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Botón Carrito con badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-stone-800 hover:text-[#9D7940] hover:bg-stone-100 rounded-full transition-all"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9D7940] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Acceso directo a Panel Admin */}
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 border border-stone-300 rounded-full transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#9D7940]" />
              <span>Panel Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Menú Mobile desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="#catalogo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            Catálogo
          </Link>
          <Link
            href="#ofertas"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            Ofertas Destacadas
          </Link>
          <Link
            href="#sobre-lume"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            Nuestra Esencia
          </Link>
          <div className="pt-2 border-t border-stone-200">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-white bg-stone-900 rounded-lg shadow"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              Acceso Administrador
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
