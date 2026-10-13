"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getSales, updateSaleStatus, getProducts, createOrder } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  MessageCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function AdminVentasPage() {
  const [activeTab, setActiveTab] = useState("pedidos"); // 'pedidos' | 'pos'
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todos");

  // Estado del POS de mostrador
  const [posCart, setPosCart] = useState([]);
  const [posCustomerName, setPosCustomerName] = useState("Cliente Mostrador");
  const [posPaymentMethod, setPosPaymentMethod] = useState("Efectivo");
  const [posSuccess, setPosSuccess] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesData, prodsData] = await Promise.all([
        getSales(),
        getProducts(),
      ]);
      setSales(salesData || []);
      setProducts(prodsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (saleId, newStatus) => {
    await updateSaleStatus(saleId, newStatus);
    await loadData();
  };

  // Funciones del POS
  const addProductToPos = (prod) => {
    if (prod.stock <= 0) return;
    setPosCart((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...prod, quantity: 1 }];
    });
  };

  const updatePosQty = (id, delta) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removePosItem = (id) => {
    setPosCart((prev) => prev.filter((item) => item.id !== id));
  };

  const posTotal = posCart.reduce((sum, item) => {
    const price = item.precio_oferta || item.precio;
    return sum + price * item.quantity;
  }, 0);

  const handleCompletePosSale = async () => {
    if (posCart.length === 0) return;

    try {
      const { orderId, error } = await createOrder({
        customer: {
          nombre: posCustomerName || "Cliente Mostrador",
          telefono: "Presencial",
          email: "",
          direccion: "Venta en tienda física Lume",
        },
        items: posCart,
        total: posTotal,
        notas: `Pago: ${posPaymentMethod}`,
      });

      if (error) throw new Error(error);

      // Inmediatamente marcar como completada
      if (orderId) {
        await updateSaleStatus(orderId, "completado");
      }

      setPosSuccess({
        id: orderId || "POS-" + Date.now().toString().slice(-4),
        total: posTotal,
        items: [...posCart],
      });

      setPosCart([]);
      await loadData();
    } catch (e) {
      alert("Error al registrar venta POS: " + e.message);
    }
  };

  const filteredSales = sales.filter((s) => {
    if (filterStatus === "todos") return true;
    return s.estado === filterStatus;
  });

  return (
    <div>
      <AdminHeader
        title="Ventas y Punto de Venta (POS)"
        subtitle="Administración de pedidos web y terminal de registro de ventas presenciales con descuento de stock"
        actionButton={
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setActiveTab("pedidos")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "pedidos"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Pedidos Web ({sales.length})
            </button>
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "pos"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Terminal POS
            </button>
          </div>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        
        {/* PESTAÑA 1: GESTIÓN DE PEDIDOS ENTRANTES */}
        {activeTab === "pedidos" && (
          <div className="space-y-6">
            
            {/* Filtros de Estado */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-stone-200 text-xs font-medium">
              <span className="text-stone-500 px-2 font-semibold">Filtrar por estado:</span>
              {["todos", "pendiente", "completado", "cancelado"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition-all ${
                    filterStatus === st
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Tabla de Pedidos */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Pedido / Fecha</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Dirección / Notas</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-stone-900 block">
                            #{sale.id ? sale.id.slice(0, 8).toUpperCase() : "VTA-01"}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {formatDate(sale.fecha)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-stone-800">
                            {sale.clientes?.nombre || "Cliente Anónimo"}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-stone-500">
                            <span>{sale.clientes?.telefono || "-"}</span>
                            {sale.clientes?.telefono && sale.clientes.telefono !== "Presencial" && (
                              <a
                                href={`https://wa.me/${sale.clientes.telefono.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 ml-1"
                                title="Enviar mensaje por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 inline" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs text-stone-600">
                          <p className="text-[11px] truncate">
                            {sale.clientes?.direccion || "Sin dirección"}
                          </p>
                          {sale.notas && (
                            <p className="text-[10px] text-stone-400 italic truncate">
                              &quot;{sale.notas}&quot;
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                          {formatCurrency(sale.total)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              sale.estado === "completado"
                                ? "bg-emerald-100 text-emerald-800"
                                : sale.estado === "cancelado"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sale.estado || "pendiente"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {sale.estado !== "completado" && (
                              <button
                                onClick={() => handleStatusChange(sale.id, "completado")}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px] transition-colors"
                              >
                                Completar
                              </button>
                            )}

                            {sale.estado !== "cancelado" && (
                              <button
                                onClick={() => handleStatusChange(sale.id, "cancelado")}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-700 font-semibold rounded-lg text-[10px] transition-colors"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA 2: TERMINAL DE PUNTO DE VENTA (POS) */}
        {activeTab === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Grid de Selección Rápida de Productos */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-sm font-bold text-stone-900">
                    Catálogo Rápido POS
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Toca un producto para sumarlo a la venta actual
                  </p>
                </div>
                <span className="text-xs bg-amber-100 text-[#9D7940] px-2.5 py-1 rounded-full font-bold">
                  {products.length} disponibles
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => addProductToPos(prod)}
                    disabled={prod.stock <= 0}
                    className="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#9D7940] text-left shadow-sm hover:shadow-md transition-all flex flex-col justify-between group disabled:opacity-50"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 mb-2">
                      <img
                        src={prod.imagen_url || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=200&q=80"}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <p className="font-editorial text-xs font-bold text-stone-900 line-clamp-1">
                        {prod.nombre}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-[#9D7940]">
                          {formatCurrency(prod.precio_oferta || prod.precio)}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Stock: {prod.stock}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket y Cobro del POS */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                  <h3 className="font-editorial text-base font-bold text-stone-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#9D7940]" />
                    <span>Ticket de Venta Mostrador</span>
                  </h3>
                  <button
                    onClick={() => setPosCart([])}
                    className="text-[11px] text-stone-400 hover:text-red-600"
                  >
                    Limpiar
                  </button>
                </div>

                {/* Datos del Cliente y Pago */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500">
                      Cliente
                    </label>
                    <input
                      type="text"
                      value={posCustomerName}
                      onChange={(e) => setPosCustomerName(e.target.value)}
                      className="w-full mt-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500">
                      Medio de Pago
                    </label>
                    <select
                      value={posPaymentMethod}
                      onChange={(e) => setPosPaymentMethod(e.target.value)}
                      className="w-full mt-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta de Débito">Tarjeta Débito</option>
                      <option value="Tarjeta de Crédito">Tarjeta Crédito</option>
                    </select>
                  </div>
                </div>

                {/* Lista de productos agregados al ticket */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {posCart.length === 0 ? (
                    <div className="py-10 text-center text-xs text-stone-400">
                      No hay artículos en el ticket actual
                    </div>
                  ) : (
                    posCart.map((item) => {
                      const price = item.precio_oferta || item.precio;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-stone-50 rounded-xl text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-bold text-stone-800 truncate">{item.nombre}</p>
                            <span className="text-[10px] text-stone-500">
                              {formatCurrency(price)} c/u
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updatePosQty(item.id, -1)}
                              className="p-1 text-stone-500 hover:text-stone-900"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-stone-900 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updatePosQty(item.id, 1)}
                              className="p-1 text-stone-500 hover:text-stone-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-stone-900 ml-2 w-16 text-right">
                              {formatCurrency(price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Total y Botón de Cobro */}
              <div className="border-t border-stone-200 pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-stone-800">
                  <span>Total a Cobrar:</span>
                  <span className="text-2xl text-stone-900 font-editorial">
                    {formatCurrency(posTotal)}
                  </span>
                </div>

                <button
                  onClick={handleCompletePosSale}
                  disabled={posCart.length === 0}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cobrar Venta y Descontar Stock</span>
                </button>

                {posSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 text-center">
                    ✓ Venta #{posSuccess.id.slice(0, 6)} registrada con éxito por {formatCurrency(posSuccess.total)}.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
