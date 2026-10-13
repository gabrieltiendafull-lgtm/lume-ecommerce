import React from "react";
import Link from "next/link";
import { Sparkles, MessageCircle, Mail, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contacto" className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Marca e Identidad */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B8944F] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-stone-900" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-[0.25em] text-white">
                LUME
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
              Velas artesanales de cera de soja pura, difusores botánicos y luminarias inspiradas en el minimalismo nórdico y el bienestar del hogar.
            </p>
            <div className="pt-2 text-xs text-[#DAC594] font-medium">
              Hecho a mano con amor &bull; 100% Eco-friendly
            </div>
          </div>

          {/* Enlaces de Colección */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Colecciones
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><a href="#catalogo" className="hover:text-white transition-colors">Velas Aromáticas en Cerámica</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Difusores Botánicos Mikado</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Velas Esculturales Nórdicas</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Lámparas de Sal del Himalaya</a></li>
              <li><a href="#ofertas" className="hover:text-amber-400 transition-colors font-semibold">Ofertas de Temporada</a></li>
            </ul>
          </div>

          {/* Atención y Ventas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Atención al Cliente
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>WhatsApp: +54 9 11 2233-4455</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>contacto@lumehome.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>Envíos a todo el país</span>
              </li>
            </ul>
          </div>

          {/* Acceso y Garantía */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Empresa
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              ¿Eres mayorista o administras la tienda? Ingresa al portal de gestión para controlar inventario, ventas y finanzas en tiempo real.
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
          <p>&copy; {new Date().getFullYear()} Lume Home &amp; Scents. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado para experiencias sensoriales únicas <Heart className="w-3.5 h-3.5 text-amber-500 inline fill-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
