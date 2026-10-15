"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useBranding } from "@/context/BrandingContext";
import { formatCurrency, generateWhatsAppOrderLink } from "@/lib/utils";
import { createOrder } from "@/lib/supabase";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  } = useCart();

  const { whatsappPhone, whatsappButtonText, whatsappCustomMsg } = useBranding();

  const [checkoutStep, setCheckoutStep] = useState("cart"); // 'cart' | 'checkout' | 'success'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  // Formulario del cliente
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    notas: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      setErrorMsg("Por favor ingresa tu nombre y número de teléfono/WhatsApp.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { orderId, error } = await createOrder({
        customer: formData,
        items: cart,
        total: subtotal,
        notas: formData.notas,
      });

      if (error) {
        throw new Error(error);
      }

      const orderData = {
        orderId: orderId || "ORD-" + Date.now().toString().slice(-6),
        customer: formData,
        items: [...cart],
        total: subtotal,
      };

      setCompletedOrder(orderData);
      setCheckoutStep("success");
      clearCart();
    } catch (err) {
      console.error("Error al procesar pedido:", err);
      setErrorMsg("Ocurrió un error al registrar el pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop oscuro translúcido */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-stone-200">
          
          {/* Header del Carrito */}
          <div className="p-6 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#9D7940]" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-stone-900 leading-none">
                  Tu Carrito Lume
                </h3>
                <span className="text-xs text-stone-500 mt-0.5 block">
                  {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CONTENIDO PRINCIPAL SEGÚN PASO */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* PASO 1: LISTADO DE PRODUCTOS */}
            {checkoutStep === "cart" && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-stone-400" />
                    </div>
                    <h4 className="font-editorial text-lg font-semibold text-stone-800">
                      Tu carrito está vacío
                    </h4>
                    <p className="text-stone-500 text-xs mt-1.5 max-w-xs">
                      Descubre nuestras joyas, cadenitas delicadas y pulseras en el catálogo.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-full hover:bg-stone-800 transition-colors"
                    >
                      Explorar Joyas
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const unitPrice = item.precio_oferta || item.precio;
                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-sm items-center"
                        >
                          <img
                            src={item.imagen_url || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=200&q=80"}
                            alt={item.nombre}
                            className="w-16 h-16 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h5 className="font-editorial text-sm font-bold text-stone-900 truncate">
                              {item.nombre}
                            </h5>
                            <span className="text-xs text-[#9D7940] font-semibold">
                              {formatCurrency(unitPrice)}
                            </span>

                            {/* Controles de Cantidad */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="inline-flex items-center border border-stone-200 rounded-lg bg-stone-50">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="p-1 hover:text-stone-900 text-stone-500"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-semibold text-stone-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="p-1 hover:text-stone-900 text-stone-500"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold text-stone-900">
                              {formatCurrency(unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* PASO 2: FORMULARIO DE CHECKOUT RÁPIDO */}
            {checkoutStep === "checkout" && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                  <span className="font-bold">✨ Completa tus datos de entrega:</span> Coordinaremos el despacho y el medio de pago directamente contigo por WhatsApp.
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Sofía Valenzuela"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. +54 9 11 2345-6789"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sofia@gmail.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dirección de Envío
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle, Número, Piso/Depto, Ciudad"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Notas adicionales o aroma de preferencia
                  </label>
                  <textarea
                    name="notas"
                    rows={2}
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Instrucciones especiales para la entrega o dedicatoria de regalo..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("cart")}
                    className="w-1/3 py-3 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Confirmar Pedido</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 3: ÉXITO Y BOTÓN DE WHATSAPP */}
            {checkoutStep === "success" && completedOrder && (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#9D7940]">
                    ¡Pedido Recibido con Éxito!
                  </span>
                  <h4 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                    Gracias, {completedOrder.customer.nombre}
                  </h4>
                  <p className="text-stone-500 text-xs mt-1">
                    Tu orden <strong>#{completedOrder.orderId.slice(0, 8).toUpperCase()}</strong> ha sido registrada en el sistema de Lume.
                  </p>
                </div>

                {/* Tarjeta resumen */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
                  <div className="flex justify-between font-bold text-stone-800 border-b pb-2">
                    <span>Total del Pedido:</span>
                    <span className="text-base text-stone-900">{formatCurrency(completedOrder.total)}</span>
                  </div>
                  <div className="text-stone-600 pt-1">
                    <p><strong>Teléfono:</strong> {completedOrder.customer.telefono}</p>
                    <p><strong>Destino:</strong> {completedOrder.customer.direccion || "A convenir"}</p>
                  </div>
                </div>

                {/* Botón Principal: WhatsApp Configurable */}
                <a
                  href={generateWhatsAppOrderLink({
                    phone: whatsappPhone,
                    orderId: completedOrder.orderId,
                    customer: completedOrder.customer,
                    items: completedOrder.items,
                    total: completedOrder.total,
                    customMsg: whatsappCustomMsg,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{whatsappButtonText || "Enviar Confirmación por WhatsApp"}</span>
                </a>

                <p className="text-[11px] text-stone-400">
                  Haz clic arriba para abrir WhatsApp con los datos de tu pedido ya redactados y recibir soporte directo.
                </p>

                <button
                  onClick={() => {
                    setCheckoutStep("cart");
                    setCompletedOrder(null);
                    setIsCartOpen(false);
                  }}
                  className="text-xs text-stone-600 hover:text-stone-900 underline font-medium pt-2"
                >
                  Continuar navegando en el catálogo
                </button>
              </div>
            )}
          </div>

          {/* Footer del Carrito (Subtotal y botón avanzar) */}
          {checkoutStep === "cart" && cart.length > 0 && (
            <div className="p-6 bg-white border-t border-stone-200 space-y-4">
              <div className="flex items-center justify-between text-stone-600 text-sm">
                <span>Subtotal estimado:</span>
                <span className="text-lg font-bold text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Los costos de envío e impuestos se coordinarán al confirmar por WhatsApp.
              </p>

              <button
                onClick={() => setCheckoutStep("checkout")}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Proceder al Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
