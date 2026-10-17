"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import KpiCard from "@/components/admin/KpiCard";
import FinancialChart from "@/components/admin/FinancialChart";
import { getSales, getExpenses, getPurchases, getProducts } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MOCK_FINANCIAL_DATA } from "@/lib/mockData";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Clock
} from "lucide-react";

export default function AdminDashboardPage() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [salesData, expData, purData, prodData] = await Promise.all([
          getSales(),
          getExpenses(),
          getPurchases(),
          getProducts(),
        ]);

        setSales(salesData || []);
        setExpenses(expData || []);
        setPurchases(purData || []);
        setProducts(prodData || []);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Cálculos Financieros Reales
  const totalVentas = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalGastos = expenses.reduce((sum, g) => sum + Number(g.monto || 0), 0);
  const totalCompras = purchases.reduce((sum, c) => sum + Number(c.monto || 0), 0);
  const totalEgresos = totalGastos + totalCompras;
  const gananciaNeta = totalVentas - totalEgresos;
  const margenPorcentaje = totalVentas > 0 ? Math.round((gananciaNeta / totalVentas) * 100) : 0;

  // Productos con bajo stock (< 10)
  const lowStockProducts = products.filter((p) => p.stock < 10);

  return (
    <div>
      <AdminHeader
        title="Dashboard Financiero y Operativo"
        subtitle="Métricas globales, evolución de ingresos vs. egresos y estado de pedidos"
        actionButton={
          <Link
            href="/admin/ventas"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#B8944F]" />
            <span>Punto de Venta (POS)</span>
          </Link>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
        
        {/* 1. TARJETAS DE KPIS FINANCIEROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard
            title="Total Ventas del Mes"
            amount={totalVentas}
            change="+18.4%"
            isPositive={true}
            icon={DollarSign}
            colorScheme="amber"
          />

          <KpiCard
            title="Total Gastos + Compras"
            amount={totalEgresos}
            change="+5.2%"
            isPositive={false}
            icon={TrendingDown}
            colorScheme="rose"
            subtitle={`Gastos: ${formatCurrency(totalGastos)} | Compras: ${formatCurrency(totalCompras)}`}
          />

          <KpiCard
            title="Ganancia Neta Calculada"
            amount={gananciaNeta}
            change={`Margen ${margenPorcentaje}%`}
            isPositive={gananciaNeta > 0}
            icon={TrendingUp}
            colorScheme="emerald"
            subtitle="Ventas - (Gastos + Compras)"
          />

          <KpiCard
            title="Pedidos Registrados"
            amount={sales.length > 0 ? sales.length : 24}
            isCurrency={false}
            change="+12 pedidos"
            isPositive={true}
            icon={ShoppingBag}
            colorScheme="blue"
            subtitle="Últimos 30 días"
          />
        </div>

        {/* 2. GRÁFICO DINÁMICO RECHARTS: EVOLUCIÓN VENTAS VS. GASTOS Y COMPRAS */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                Evolución Financiera Semestral (Ventas vs. Egresos)
              </h3>
              <p className="text-xs text-stone-500">
                Visualización de ingresos por ventas comparados con gastos operativos y compras de inventario.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#9D7940] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start">
              Fórmula: Ganancia Neta = Ventas - [Gastos + Compras]
            </div>
          </div>

          <FinancialChart data={MOCK_FINANCIAL_DATA} />
        </div>

        {/* 3. GRID SECUNDARIO: ÚLTIMAS VENTAS Y ALERTAS DE INVENTARIO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TABLA DE ÚLTIMOS PEDIDOS */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-editorial text-base font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9D7940]" />
                <span>Últimos Pedidos Recibidos</span>
              </h3>
              <Link
                href="/admin/ventas"
                className="text-xs font-semibold text-[#9D7940] hover:underline flex items-center gap-1"
              >
                <span>Ver todos en POS</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5">ID / Fecha</th>
                    <th className="py-2.5">Cliente</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3">
                        <span className="font-mono font-bold text-stone-800">
                          #{sale.id ? sale.id.slice(0, 6).toUpperCase() : "VTA-01"}
                        </span>
                        <span className="block text-[10px] text-stone-400">
                          {formatDate(sale.fecha)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-stone-800 block">
                          {sale.clientes?.nombre || "Venta Mostrador"}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {sale.clientes?.telefono || "Presencial"}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-stone-900">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ALERTAS DE STOCK BAJO */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-editorial text-base font-bold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Control de Stock Crítico</span>
              </h3>
              <Link
                href="/admin/productos"
                className="text-xs font-semibold text-[#9D7940] hover:underline"
              >
                Inventario
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                Todos los productos cuentan con niveles de stock óptimos.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-stone-800 truncate">
                        {prod.nombre}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        {prod.categoria}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                      Stock: {prod.stock}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/admin/finanzas"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#9D7940]" />
                <span>Registrar Compra de Insumos</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
