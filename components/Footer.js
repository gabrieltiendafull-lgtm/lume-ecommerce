"use client";

import React from "react";
import Link from "next/link";
import { useBranding } from "@/context/BrandingContext";
import { Sparkles, MessageCircle, Mail, MapPin, Heart, Gem } from "lucide-react";

export default function Footer() {
  const { logoUrl, storeName, brandTagline, whatsappPhone } = useBranding();
  const cleanPhone = (whatsappPhone || "+54 9 11 2233-4455").replace(/[^0-9]/g, "");

  return (
    <footer id="contacto" className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Marca e Identidad Dinámica */}
          <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                  <img
                    src={logoUrl || "/lume-logo.png"}
                    alt={storeName || "Lumé Joyas"}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-editorial text-2xl font-bold tracking-[0.22em] text-white leading-none">
                    {storeName?.split(" ")[0]?.toUpperCase() || "LUMÉ"}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#B8944F] font-semibold mt-1">
                    Joyas & Accesorios
                  </span>
                </div>
              </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
              {brandTagline || "Joyas, pulseras y cadenitas delicadas para mujer. Diseños sutiles y elegantes que iluminan tu día a día."}
            </p>
            <div className="pt-2 text-xs text-[#DAC594] font-medium flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-[#DAC594]" />
              <span>Plata 925 &bull; Baño Oro 18k &bull; Hipoalergénico</span>
            </div>
          </div>

          {/* Enlaces de Colección */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Colecciones
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><a href="#catalogo" className="hover:text-white transition-colors">Cadenitas y Gargantillas</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Pulseras Delicadas</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Anillos Finos</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Aros y Mini Huggies</a></li>
              <li><a href="#ofertas" className="hover:text-amber-400 transition-colors font-semibold">Ofertas Exclusivas</a></li>
            </ul>
          </div>

          {/* Atención y Ventas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Atención y Asesoramiento
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {whatsappPhone || "+54 9 11 2233-4455"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>contacto@lumejoyas.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>Envíos asegurados a todo el país</span>
              </li>
            </ul>
          </div>

          {/* Acceso y Panel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Administración
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Gestión de joyas, inventario, categorías dinámicas y número de WhatsApp en tiempo real.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 transition-colors"
              >
                <span>Acceder al Panel Admin</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>&copy; {new Date().getFullYear()} {storeName}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Joyería fina pensada para ti <Heart className="w-3.5 h-3.5 text-amber-500 inline fill-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
