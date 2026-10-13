"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getExpenses, addExpense, getPurchases, addPurchase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingDown,
  ShoppingBag,
  Plus,
  Calendar,
  Building,
  DollarSign,
  Tag,
  CheckCircle2
} from "lucide-react";

export default function AdminFinanzasPage() {
  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario de Gasto
  const [gastoForm, setGastoForm] = useState({
    concepto: "",
    monto: "",
    categoria: "Operativo",
    fecha: new Date().toISOString().split("T")[0],
  });

  // Formulario de Compra
  const [compraForm, setCompraForm] = useState({
    proveedor: "",
    concepto: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, purData] = await Promise.all([
        getExpenses(),
        getPurchases(),
      ]);
      setExpenses(expData || []);
      setPurchases(purData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!gastoForm.concepto || !gastoForm.monto) return;

    await addExpense({
      concepto: gastoForm.concepto,
      monto: parseFloat(gastoForm.monto),
      categoria: gastoForm.categoria,
      fecha: gastoForm.fecha,
    });

    setGastoForm({
      concepto: "",
      monto: "",
      categoria: "Operativo",
      fecha: new Date().toISOString().split("T")[0],
    });

    await loadData();
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!compraForm.proveedor || !compraForm.concepto || !compraForm.monto) return;

    await addPurchase({
      proveedor: compraForm.proveedor,
      concepto: compraForm.concepto,
      monto: parseFloat(compraForm.monto),
      fecha: compraForm.fecha,
    });

    setCompraForm({
      proveedor: "",
      concepto: "",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
    });

    await loadData();
  };

  const totalGastos = expenses.reduce((s, g) => s + Number(g.monto || 0), 0);
  const totalCompras = purchases.reduce((s, c) => s + Number(c.monto || 0), 0);
  const totalEgresos = totalGastos + totalCompras;

  return (
    <div>
      <AdminHeader
        title="Gastos Operativos y Compras de Inventario"
        subtitle="Registra salidas de capital para el cálculo de la Ganancia Neta real de Lume"
        actionButton={
          <div className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-semibold">
            Total Egresos: {formatCurrency(totalEgresos)}
          </div>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
        
        {/* SECCIÓN 1: GASTOS OPERATIVOS */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                <span>Gastos Operativos (Renta, Servicios, Empaque, Marketing)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Egresos recurrentes indispensables para la operación del taller y tienda.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 self-start">
              Subtotal: {formatCurrency(totalGastos)}
            </span>
          </div>

          {/* Formulario rápido para agregar gasto */}
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Concepto</label>
              <input
                type="text"
                required
                value={gastoForm.concepto}
                onChange={(e) => setGastoForm({ ...gastoForm, concepto: e.target.value })}
                placeholder="Ej. Cajas de cartón y cintas Lume"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Categoría</label>
              <select
                value={gastoForm.categoria}
                onChange={(e) => setGastoForm({ ...gastoForm, categoria: e.target.value })}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
              >
                <option value="Operativo">Operativo / Renta</option>
                <option value="Servicios">Servicios / Luz</option>
                <option value="Empaque">Empaque y Packaging</option>
                <option value="Marketing">Marketing / Publicidad</option>
                <option value="Envíos">Logística / Envíos</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={gastoForm.monto}
                onChange={(e) => setGastoForm({ ...gastoForm, monto: e.target.value })}
                placeholder="0.00"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Gasto</span>
              </button>
            </div>
          </form>

          {/* Tabla de Gastos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Concepto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {expenses.map((g) => (
                  <tr key={g.id} className="hover:bg-stone-50/60">
                    <td className="py-2.5 px-3 text-stone-500">{formatDate(g.fecha)}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800">{g.concepto}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-medium">
                        {g.categoria}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                      {formatCurrency(g.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECCIÓN 2: COMPRAS A PROVEEDORES */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <span>Compras a Proveedores (Cera, Esencias, Mechas, Envases)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Adquisición de materia prima e insumos directos para la producción.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start">
              Subtotal: {formatCurrency(totalCompras)}
            </span>
          </div>

          {/* Formulario rápido para registrar compra */}
          <form onSubmit={handleAddPurchase} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Proveedor</label>
              <input
                type="text"
                required
                value={compraForm.proveedor}
                onChange={(e) => setCompraForm({ ...compraForm, proveedor: e.target.value })}
                placeholder="Ej. EcoSoy Co."
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Concepto / Insumos</label>
              <input
                type="text"
                required
                value={compraForm.concepto}
                onChange={(e) => setCompraForm({ ...compraForm, concepto: e.target.value })}
                placeholder="50kg cera de soja + 100 mechas de madera"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Monto Total ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={compraForm.monto}
                onChange={(e) => setCompraForm({ ...compraForm, monto: e.target.value })}
                placeholder="0.00"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Compra</span>
              </button>
            </div>
          </form>

          {/* Tabla de Compras */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Proveedor</th>
                  <th className="py-2.5 px-3">Concepto</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {purchases.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="py-2.5 px-3 text-stone-500">{formatDate(c.fecha)}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800">{c.proveedor}</td>
                    <td className="py-2.5 px-3 text-stone-600">{c.concepto}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                      {formatCurrency(c.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
