"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getClients } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Search,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  UserCheck
} from "lucide-react";

export default function AdminClientesPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <AdminHeader
        title="Directorio y Gestión de Clientes"
        subtitle="Administra la cartera de clientes registrados en el catálogo de Lume y compras presenciales"
        actionButton={
          <div className="bg-amber-100 text-[#9D7940] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>{clients.length} Clientes Registrados</span>
          </div>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        
        {/* Buscador de clientes */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, WhatsApp o correo..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9D7940]"
            />
          </div>
          <div className="text-xs text-stone-500 self-center">
            Mostrando <strong>{filtered.length}</strong> de {clients.length} clientes
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Nombre del Cliente</th>
                  <th className="py-3 px-4">Teléfono / WhatsApp</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Dirección de Entrega</th>
                  <th className="py-3 px-4">Fecha de Registro</th>
                  <th className="py-3 px-4 text-right">Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((client) => {
                  const cleanPhone = client.telefono ? client.telefono.replace(/[^0-9]/g, "") : "";

                  return (
                    <tr key={client.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[#9D7940]">
                            {client.nombre?.charAt(0) || "C"}
                          </div>
                          <span className="font-bold text-stone-900">
                            {client.nombre}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-700">
                        {client.telefono || "-"}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        {client.email || <span className="text-stone-400 italic">No registrado</span>}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                        {client.direccion || <span className="text-stone-400 italic">Retiro en local</span>}
                      </td>

                      <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                        {formatDate(client.creado_en)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-[11px] transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-stone-300 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
