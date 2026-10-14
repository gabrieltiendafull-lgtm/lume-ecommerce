"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminUsers, createAdminUser, deleteAdminUser } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Trash2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Lock,
  UserCheck
} from "lucide-react";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "Administrador General",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      nombre: "",
      email: "",
      password: "",
      rol: "Administrador General",
    });
    setFeedback({ type: "", message: "" });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFeedback({ type: "error", message: "Todos los campos son obligatorios." });
      return;
    }

    if (formData.password.length < 6) {
      setFeedback({ type: "error", message: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const { data, error } = await createAdminUser(formData);
      if (error) throw error;

      setFeedback({
        type: "success",
        message: `¡Usuario ${formData.nombre} creado con éxito! Ya puede iniciar sesión.`
      });

      await loadUsers();
      setTimeout(() => {
        setModalOpen(false);
      }, 1200);
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Error al crear usuario" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.esMaster) {
      alert("No es posible eliminar el usuario Administrador Principal del sistema.");
      return;
    }

    if (confirm(`¿Estás seguro de revocar el acceso a "${user.nombre}" (${user.email})?`)) {
      const { error } = await deleteAdminUser(user.id);
      if (error) {
        alert(error.message);
      } else {
        await loadUsers();
      }
    }
  };

  return (
    <div>
      <AdminHeader
        title="Usuarios y Credenciales de Administrador"
        subtitle="Crea y administra cuentas con usuario y contraseña para el acceso al panel"
        actionButton={
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#B8944F]" />
            <span>Crear Nuevo Usuario</span>
          </button>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        
        {/* Banner informativo */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-[#9D7940]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-sm font-bold text-stone-900">
                Control de Accesos con Credenciales
              </h3>
              <p className="text-xs text-stone-500">
                Cada usuario creado aquí podrá iniciar sesión directamente en <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">/admin/login</code> con su correo y contraseña.
              </p>
            </div>
          </div>

          <div className="bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-bold text-stone-700">
            {users.length} {users.length === 1 ? "Cuenta Activa" : "Cuentas Activas"}
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Usuario / Nombre</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Rol de Acceso</th>
                  <th className="py-3 px-4">Fecha de Alta</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-[#DAC594] font-bold flex items-center justify-center">
                          {u.nombre?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{u.nombre}</p>
                          <p className="text-[10px] text-stone-400">@{u.usuario || u.email?.split("@")[0]}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-700">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-[#9D7940]" />
                        <span>{u.rol || "Administrador"}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {formatDate(u.creado_en)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Activo
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {u.esMaster ? (
                        <span className="text-[10px] text-stone-400 font-medium italic">
                          Cuenta Principal
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar acceso de este usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL CREAR NUEVO USUARIO Y CONTRASEÑA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-6 top-6 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-[#DAC594] flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-stone-900">
                  Crear Nuevo Acceso
                </h3>
                <p className="text-xs text-stone-500">
                  Define las credenciales para el nuevo integrante
                </p>
              </div>
            </div>

            {feedback.message && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  feedback.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {feedback.type === "error" ? (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Lucas Fernández"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Correo Electrónico (Servirá para iniciar sesión) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="lucas@lume.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Contraseña de Acceso (Mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Escribe la contraseña segura"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Rol de Usuario
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                >
                  <option value="Administrador General">Administrador General (Acceso total)</option>
                  <option value="Ventas y POS">Operador de Ventas / POS</option>
                  <option value="Gestor de Inventario">Gestor de Inventario y Productos</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/3 py-2.5 border border-stone-300 rounded-xl font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? "Creando..." : "Guardar y Habilitar"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
