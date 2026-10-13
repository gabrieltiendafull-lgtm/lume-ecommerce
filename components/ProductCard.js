"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { ShoppingBag, Check } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const hasOffer = product.es_oferta && product.precio_oferta;
  const currentPrice = hasOffer ? product.precio_oferta : product.precio;
  const discount = hasOffer ? calculateDiscount(product.precio, product.precio_oferta) : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col">
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        <img
          src={product.imagen_url || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"}
          alt={product.nombre}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge de Oferta si aplica */}
        {hasOffer && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md tracking-wider">
            -{discount}% OFF
          </div>
        )}

        {/* Indicador Inteligente de Stock */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-stone-900/90 text-stone-200 text-[10px] font-semibold px-2 py-0.5 rounded shadow">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow animate-pulse">
              ¡Últimas {product.stock}!
            </span>
          ) : (
            <span className="bg-white/80 backdrop-blur-sm text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded shadow">
              Stock: {product.stock}
            </span>
          )}
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#9D7940]">
            {product.categoria || "Colección Lume"}
          </span>
          <h3 className="font-editorial text-base font-bold text-stone-900 mt-1 line-clamp-1 group-hover:text-[#9D7940] transition-colors">
            {product.nombre}
          </h3>
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {product.descripcion}
          </p>
        </div>

        {/* Precios y Botón de Añadir */}
        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            {hasOffer && (
              <span className="text-[11px] line-through text-stone-400 block font-medium">
                {formatCurrency(product.precio)}
              </span>
            )}
            <span className="text-lg font-bold text-stone-900">
              {formatCurrency(currentPrice)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
              isOutOfStock
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : added
                ? "bg-emerald-600 text-white"
                : "bg-stone-900 hover:bg-[#9D7940] text-white hover:shadow-md"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                {isOutOfStock ? "Agotado" : "Añadir"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
