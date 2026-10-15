"use client";

import React, { useRef } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Flame } from "lucide-react";

export default function OffersCarousel({ products = [] }) {
  const { addToCart } = useCart();
  const scrollContainerRef = useRef(null);

  // Filtrar exclusivamente productos con es_oferta = true
  const offerProducts = products.filter((p) => p.es_oferta === true && p.precio_oferta);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (offerProducts.length === 0) return null;

  return (
    <section id="ofertas" className="py-12 bg-white border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera del Carrusel */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              Precios Especiales &bull; Joyas Seleccionadas
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              Ofertas Destacadas Lumé
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Selección limitada de nuestras joyas, pulseras y cadenitas más deseadas con descuento exclusivo.
            </p>
          </div>

          {/* Flechas de Navegación del Carrusel */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-full border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 shadow-sm transition-all"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-full border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 shadow-sm transition-all"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carrusel Deslizable */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-4 pt-1 snap-x snap-mandatory scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {offerProducts.map((product) => {
            const discount = calculateDiscount(product.precio, product.precio_oferta);

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start bg-[#FAF8F5] rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Imagen del Producto con Badges */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={product.imagen_url || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"}
                    alt={product.nombre}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badge de Descuento */}
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wider">
                    -{discount}% OFF
                  </div>

                  {/* Stock Tag */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow">
                    Stock: {product.stock}
                  </div>
                </div>

                {/* Información y Precios */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9D7940]">
                      {product.categoria}
                    </span>
                    <h3 className="font-editorial text-base font-bold text-stone-900 mt-1 line-clamp-1 group-hover:text-[#9D7940] transition-colors">
                      {product.nombre}
                    </h3>
                    <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {product.descripcion}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-stone-200/60 flex items-center justify-between">
                    <div>
                      {/* Precio tachado original */}
                      <span className="text-xs line-through text-stone-400 block font-medium">
                        {formatCurrency(product.precio)}
                      </span>
                      {/* Precio de Oferta */}
                      <span className="text-lg font-bold text-stone-900">
                        {formatCurrency(product.precio_oferta)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                        product.stock <= 0
                          ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                          : "bg-stone-900 hover:bg-[#9D7940] text-white hover:shadow"
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {product.stock <= 0 ? "Agotado" : "Añadir"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
