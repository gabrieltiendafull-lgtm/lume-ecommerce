import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Flame, Leaf, Award } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EDE1]/50 to-[#FAF8F5] py-16 md:py-24 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Columna de Texto Editorial */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-200/80 text-amber-900 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#9D7940]" />
              Colección Otoño &bull; Edición Botánica
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.15] tracking-tight">
              Luz, calma y esencias puras para tu espacio.
            </h1>

            <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              En <strong className="font-semibold text-stone-800">Lume</strong> creamos piezas sensoriales artesanales elaboradas con cera de soja 100% orgánica y notas olfativas diseñadas para transformar tus momentos cotidianos en rituales de paz.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#catalogo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#ofertas"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-stone-50 text-stone-800 text-sm font-medium rounded-full border border-stone-300 shadow-sm transition-all"
              >
                <span>Ver Ofertas Especiales</span>
              </a>
            </div>

            {/* Pilares de Marca */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-200/80 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-left">
                <Leaf className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">100% Soja</h4>
                  <p className="text-[11px] text-stone-500">Sin toxinas ni parafina</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Flame className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Artesanal</h4>
                  <p className="text-[11px] text-stone-500">Vertido individual</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Award className="w-5 h-5 text-[#9D7940] flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">+50 Horas</h4>
                  <p className="text-[11px] text-stone-500">Combustión limpia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Visual / Imagen Editorial de Marca */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Marco decorativo */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#DAC594]/40 to-[#FAF8F5] blur-xl -z-10"></div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85"
                  alt="Velas y ambientación Lume"
                  className="w-full h-[440px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />

                {/* Tarjeta flotante sobre la imagen */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9D7940]">Bestseller Lume</span>
                    <h3 className="font-editorial text-sm font-bold text-stone-900">Santal &amp; Ámbar Cálido</h3>
                    <p className="text-xs text-stone-500">Cerámica artesanal &bull; Cera de soja</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-stone-400 block">$28.50</span>
                    <span className="text-base font-bold text-stone-900">$22.80</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
