"use client";

import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { Search, SlidersHorizontal, PackageSearch, X } from "lucide-react";

export default function ProductGrid({ products = [] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Obtener categorías únicas presentes en la base de datos
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categoria).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [products]);

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        selectedCategory === "Todos" || product.categoria === selectedCategory;
      const matchSearch =
        product.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, search, selectedCategory]);

  return (
    <section id="catalogo" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Encabezado del Catálogo */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9D7940]">
          Atmósferas &bull; Fragancias &bull; Luz
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
          Colección Completa Lume
        </h2>
        <p className="text-stone-500 text-sm mt-2">
          Explora cada una de nuestras piezas diseñadas con ingredientes limpios y recipientes reutilizables.
        </p>
      </div>

      {/* Controles: Buscador en Tiempo Real y Filtros de Categoría */}
      <div className="space-y-6 mb-10">
        
        {/* Barra de Búsqueda */}
        <div className="max-w-md mx-auto relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aroma, vela, difusor o formato..."
            className="w-full pl-12 pr-10 py-3 bg-white border border-stone-200 rounded-full text-sm text-stone-800 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9D7940] focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros por Categoría (Pill Buttons) */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-white hover:bg-stone-100 text-stone-600 border border-stone-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center justify-between text-xs text-stone-500 px-2 pt-2 border-b border-stone-200/60 pb-3">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "producto" : "productos"}
          </span>
          {selectedCategory !== "Todos" && (
            <span className="text-[#9D7940] font-medium">
              Filtrado por: {selectedCategory}
            </span>
          )}
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Estado vacío si no hay coincidencias */
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300 max-w-lg mx-auto p-8">
          <PackageSearch className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-stone-800">
            No se encontraron productos
          </h3>
          <p className="text-stone-500 text-sm mt-1">
            No pudimos hallar coincidencias para &quot;{search}&quot;. Prueba con otros términos o limpia los filtros.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("Todos");
            }}
            className="mt-5 px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-full hover:bg-stone-800 transition-colors"
          >
            Restablecer Búsqueda
          </button>
        </div>
      )}
    </section>
  );
}
