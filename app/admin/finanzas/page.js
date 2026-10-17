"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getPurchases,
  addPurchase,
  deletePurchase
} from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingDown,
  ShoppingBag,
  Plus,
  Calendar,
  Building,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Gem
} from "lucide-react";

export default function AdminFinanzasPage() {
  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingGasto, setSavingGasto] = useState(false);
  const [savingCompra, setSavingCompra] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Formulario de Gasto
  const [gastoForm, setGastoForm] = useState({
    concepto: "",
    monto: "",
    categoria: "Empaque",
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
    try {
      const [expData, purData] = await Promise.all([
        getExpenses(),
        getPurchases(),
      ]);
      setExpenses(expData || []);
      setPurchases(purData || []);
    } catch (e) {
      console.error("Error al cargar finanzas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!gastoForm.concepto.trim() || !gastoForm.monto) {
      setFeedback({ type: "error", message: "Ingresa el concepto y monto del gasto." });
      return;
    }

    setSavingGasto(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await addExpense({
        concepto: gastoForm.concepto.trim(),
        monto: parseFloat(gastoForm.monto),
        categoria: gastoForm.categoria,
        fecha: gastoForm.fecha,
      });

      if (res.error) {
        setFeedback({ type: "error", message: res.error.message || "Error al guardar gasto." });
      } else {
        setFeedback({ type: "success", message: "¡Gasto operativo registrado con éxito en Lumé!" });
        setGastoForm({
          concepto: "",
          monto: "",
          categoria: "Empaque",
          fecha: new Date().toISOString().split("T")[0],
        });
        await loadData();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error inesperado al registrar el gasto." });
    } finally {
      setSavingGasto(false);
    }
  };

  const handleDeleteExpense = async (id, concepto) => {
    if (!confirm(`¿Estás seguro de eliminar el gasto "${concepto}"?`)) return;
    try {
      const res = await deleteExpense(id);
      if (res.error) {
        setFeedback({ type: "error", message: res.error.message || "No se pudo eliminar el gasto." });
      } else {
        setFeedback({ type: "success", message: "Gasto eliminado correctamente." });
        await loadData();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error al intentar eliminar el gasto." });
    }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!compraForm.proveedor.trim() || !compraForm.concepto.trim() || !compraForm.monto) {
      setFeedback({ type: "error", message: "Completa proveedor, concepto y monto de la compra." });
      return;
    }

    setSavingCompra(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await addPurchase({
        proveedor: compraForm.proveedor.trim(),
        concepto: compraForm.concepto.trim(),
        monto: parseFloat(compraForm.monto),
        fecha: compraForm.fecha,
      });

      if (res.error) {
        setFeedback({ type: "error", message: res.error.message || "Error al guardar compra." });
      } else {
        setFeedback({ type: "success", message: "¡Compra de insumos/joyas registrada exitosamente!" });
        setCompraForm({
          proveedor: "",
          concepto: "",
          monto: "",
          fecha: new Date().toISOString().split("T")[0],
        });
        await loadData();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error inesperado al registrar la compra." });
    } finally {
      setSavingCompra(false);
    }
  };

  const handleDeletePurchase = async (id, concepto) => {
    if (!confirm(`¿Estás seguro de eliminar la compra "${concepto}"?`)) return;
    try {
      const res = await deletePurchase(id);
      if (res.error) {
        setFeedback({ type: "error", message: res.error.message || "No se pudo eliminar la compra." });
      } else {
        setFeedback({ type: "success", message: "Compra eliminada correctamente." });
        await loadData();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error al intentar eliminar la compra." });
    }
  };

  const totalGastos = expenses.reduce((s, g) => s + Number(g.monto || 0), 0);
  const totalCompras = purchases.reduce((s, c) => s + Number(c.monto || 0), 0);
  const totalEgresos = totalGastos + totalCompras;

  return (
    <div>
      <AdminHeader
        title="Gastos Operativos y Compras de Joyas"
        subtitle="Registra salidas de capital para el cálculo de la Ganancia Neta real de Lumé"
        actionButton={
          <div className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm">
            Total Egresos: {formatCurrency(totalEgresos)}
          </div>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
        
        {/* Banner de Feedback (Éxito o Error) */}
        {feedback.message && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-sm ${
              feedback.type === "error"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "error" ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              )}
              <span className="font-semibold">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback({ type: "", message: "" })}
              className="text-stone-400 hover:text-stone-700 font-bold px-2 py-0.5"
            >
              &times;
            </button>
          </div>
        )}
        
        {/* SECCIÓN 1: GASTOS OPERATIVOS */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                <span>Gastos Operativos (Packaging Joyero, Marketing, Alquiler)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Egresos necesarios para la operación, cajas de terciopelo, bolsas y promoción de Lumé.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 self-start">
              Subtotal: {formatCurrency(totalGastos)}
            </span>
          </div>

          {/* Formulario rápido para agregar gasto */}
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Concepto del Gasto</label>
              <input
                type="text"
                required
                value={gastoForm.concepto}
                onChange={(e) => setGastoForm({ ...gastoForm, concepto: e.target.value })}
                placeholder="Ej. 100 Cajas rígidas de terciopelo y cinta de satén"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Categoría</label>
              <select
                value={gastoForm.categoria}
                onChange={(e) => setGastoForm({ ...gastoForm, categoria: e.target.value })}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="Empaque">Empaque y Packaging</option>
                <option value="Marketing">Marketing / Publicidad</option>
                <option value="Operativo">Operativo / Alquiler Taller</option>
                <option value="Fotografía">Fotografía & Contenido</option>
                <option value="Envíos">Logística & Envíos</option>
                <option value="Servicios">Servicios / Luz</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={gastoForm.monto}
                onChange={(e) => setGastoForm({ ...gastoForm, monto: e.target.value })}
                placeholder="0.00"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={gastoForm.fecha}
                onChange={(e) => setGastoForm({ ...gastoForm, fecha: e.target.value })}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingGasto}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{savingGasto ? "Guardando..." : "Agregar Gasto"}</span>
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
                  <th className="py-2.5 px-3 text-center w-16">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No hay gastos operativos registrados aún.
                    </td>
                  </tr>
                ) : (
                  expenses.map((g) => (
                    <tr key={g.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5 px-3 text-stone-500">{formatDate(g.fecha)}</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-800">{g.concepto}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-medium">
                          {g.categoria}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                        -{formatCurrency(g.monto)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(g.id, g.concepto)}
                          title="Eliminar gasto"
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECCIÓN 2: COMPRAS A PROVEEDORES (METALES, PLATAS, PIEDRAS) */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                <Gem className="w-5 h-5 text-amber-600" />
                <span>Compras a Proveedores (Plata 925, Cadenitas, Circonias, Baño en Oro 18k)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Adquisición de metales preciosos, cadenas por metro, cierres y joyas terminadas para stock.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start">
              Subtotal: {formatCurrency(totalCompras)}
            </span>
          </div>

          {/* Formulario rápido para registrar compra */}
          <form onSubmit={handleAddPurchase} className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Proveedor</label>
              <input
                type="text"
                required
                value={compraForm.proveedor}
                onChange={(e) => setCompraForm({ ...compraForm, proveedor: e.target.value })}
                placeholder="Ej. Silversmith & Co."
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Concepto / Joyas &amp; Insumos</label>
              <input
                type="text"
                required
                value={compraForm.concepto}
                onChange={(e) => setCompraForm({ ...compraForm, concepto: e.target.value })}
                placeholder="Ej. Partida de cadenitas venecianas y broches marinero Plata 925"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Monto Total ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={compraForm.monto}
                onChange={(e) => setCompraForm({ ...compraForm, monto: e.target.value })}
                placeholder="0.00"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={compraForm.fecha}
                onChange={(e) => setCompraForm({ ...compraForm, fecha: e.target.value })}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingCompra}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{savingCompra ? "Guardando..." : "Registrar Compra"}</span>
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
                  <th className="py-2.5 px-3 text-center w-16">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No hay compras a proveedores registradas aún.
                    </td>
                  </tr>
                ) : (
                  purchases.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5 px-3 text-stone-500">{formatDate(c.fecha)}</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-800">{c.proveedor}</td>
                      <td className="py-2.5 px-3 text-stone-600">{c.concepto}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                        -{formatCurrency(c.monto)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeletePurchase(c.id, c.concepto)}
                          title="Eliminar compra"
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
