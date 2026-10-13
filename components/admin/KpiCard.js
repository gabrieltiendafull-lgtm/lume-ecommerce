import React from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({
  title,
  amount,
  isCurrency = true,
  change,
  isPositive = true,
  icon: Icon,
  colorScheme = "amber",
  subtitle = "Vs. mes anterior"
}) {
  const colorStyles = {
    amber: "bg-amber-50 text-amber-800 border-amber-200/80 icon-amber",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/80 icon-emerald",
    rose: "bg-rose-50 text-rose-800 border-rose-200/80 icon-rose",
    blue: "bg-blue-50 text-blue-800 border-blue-200/80 icon-blue",
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyles[colorScheme] || "bg-stone-100 text-stone-700"}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          {isCurrency ? formatCurrency(amount) : amount}
        </h3>

        {change !== undefined && (
          <div className="flex items-center gap-1.5 pt-2 text-xs">
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded ${
                isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {change}
            </span>
            <span className="text-stone-400">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}
