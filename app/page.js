"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import OffersCarousel from "@/components/OffersCarousel";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/supabase";
import { Sparkles, Heart, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("Error al cargar productos en HomePage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Barra de Navegación con Carrito Flotante */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Banner de Marca Lume */}
        <HeroBanner />

        {/* 3. Carrusel Dinámico de Ofertas Destacadas */}
        <OffersCarousel products={products} />

        {/* 4. Catálogo Dinámico con Buscador y Filtros por Categoría */}
        <ProductGrid products={products} />

        {/* 5. Sección Editorial: Nuestra Esencia y Compromiso */}
        <section id="sobre-lume" className="py-20 bg-stone-100/70 border-t border-stone-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
            
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#9D7940]">
                Manifiesto Artesanal
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900">
                La Esencia detrás de Lume
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                Creemos que el hogar debe ser un santuario. Cada una de nuestras velas y difusores nace de la unión entre aceites esenciales botánicos puros, mechas de maderas sostenibles y recipientes en cerámica que invitan a ser reutilizados.
              </p>
            </div>

            {/* Ventajas para el Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#9D7940] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-editorial text-base font-bold text-stone-900">
                  Esencias Naturales
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Formulaciones sin parabenos, ftalatos ni parafinas derivadas del petróleo. Seguras para toda la familia y mascotas.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="font-editorial text-base font-bold text-stone-900">
                  Envíos Cuidados
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Empaque biodegradable acolchado con papel nido de abeja para garantizar que tus piezas lleguen intactas.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-editorial text-base font-bold text-stone-900">
                  Garantía de Satisfacción
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Si la fragancia no enamora tu espacio, coordinamos el cambio sin complicaciones a través de WhatsApp.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 6. Carrito Lateral Deslizable Interactivo */}
      <CartDrawer />

      {/* 7. Footer de Marca */}
      <Footer />
    </div>
  );
}
