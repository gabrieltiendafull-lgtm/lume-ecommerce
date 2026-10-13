"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils";

// Custom Tooltip estilizado para la estética de Lume
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 text-white p-4 rounded-xl shadow-xl border border-stone-800 text-xs space-y-2">
        <p className="font-editorial text-sm font-bold text-[#DAC594] border-b border-stone-800 pb-1">
          Mes: {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between items-center gap-4">
            <span style={{ color: entry.color }} className="font-semibold">
              {entry.name}:
            </span>
            <span className="font-bold text-stone-100">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function FinancialChart({ data = [] }) {
  // Asegurarse de calcular Gastos + Compras agrupados y Ganancia Neta
  const chartData = data.map((item) => {
    const egresos = (item.gastos || 0) + (item.compras || 0);
    const ganancia = (item.ventas || 0) - egresos;
    return {
      mes: item.mes,
      Ventas: item.ventas,
      Egresos: egresos,
      "Ganancia Neta": ganancia,
    };
  });

  return (
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={{ stroke: "#D6D3D1" }}
            tick={{ fill: "#78716C", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#78716C", fontSize: 11 }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={40}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-semibold text-stone-700">{value}</span>
            )}
          />
          <Bar
            dataKey="Ventas"
            name="Ventas Totales"
            fill="#B8944F" // Dorado cálido de Lume
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="Egresos"
            name="Egresos (Gastos + Compras)"
            fill="#78716C" // Piedra neutra / gastos
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="Ganancia Neta"
            name="Ganancia Neta"
            fill="#059669" // Verde esmeralda éxito
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
