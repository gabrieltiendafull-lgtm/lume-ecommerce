"use client";

import React from "react";
import Link from "next/link";
import { isConfigured } from "@/lib/supabase";
import { Database, Cloud, PlusCircle } from "lucide-react";

export default function AdminHeader({ title, subtitle, actionButton }) {
  return (
    <header className="bg-white border-b border-stone-200 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="font-editorial text-2xl font-bold text-stone-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-stone-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Status badges de backend gratuito */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            Supabase DB
          </span>
          <span className="text-stone-300">&bull;</span>
          <span className="flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-amber-600" />
            Firebase Storage
          </span>
        </div>

        {actionButton}
      </div>
    </header>
  );
}
