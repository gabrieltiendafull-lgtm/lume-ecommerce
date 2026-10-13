"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ImageUploader from "@/components/admin/ImageUploader";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  X,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react";

export default function AdminProductosPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Todas");

  // Estado del Modal (Crear / Editar)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Campos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_oferta: "",
    es_oferta: false,
    stock: "",
    categoria: "Velas Aromáticas",
    imagen_url: "",
  });

  const categories = [
    "Velas Aromáticas",
    "Velas Esculturales",
    "Difusores",
    "Lámparas de Ambiente",
    "Aromaterapia",
    "Sets de Regalo",
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await getProducts();
      setProducts(prods || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      precio_oferta: "",
      es_oferta: false,
      stock: "20",
      categoria: "Velas Aromáticas",
      imagen_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    });
    setFeedback({ type: "", message: "" });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: product.precio || "",
      precio_oferta: product.precio_oferta || "",
      es_oferta: Boolean(product.es_oferta),
      stock: product.stock !== undefined ? product.stock : "",
      categoria: product.categoria || "Velas Aromáticas",
      imagen_url: product.imagen_url || "",
    });
    setFeedback({ type: "", message: "" });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.precio) {
      setFeedback({ type: "error", message: "Nombre y precio son obligatorios." });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      precio: parseFloat(formData.precio),
      precio_oferta: formData.es_oferta && formData.precio_oferta ? parseFloat(formData.precio_oferta) : null,
      es_oferta: formData.es_oferta,
      stock: parseInt(formData.stock || "0", 10),
      categoria: formData.categoria,
      imagen_url: formData.imagen_url,
    };

    try {
      if (editingProduct) {
        const { error } = await updateProduct(editingProduct.id, payload);
        if (error) throw error;
      } else {
        const { error } = await createProduct(payload);
        if (error) throw error;
      }

      await loadData();
      setModalOpen(false);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      setFeedback({ type: "error", message: "Error al guardar en Supabase: " + (err.message || err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}" del catálogo?`)) {
      await deleteProduct(id);
      await loadData();
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = selectedCat === "Todas" || p.categoria === selectedCat;
    const matchSearch = p.nombre?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <AdminHeader
        title="Gestión de Productos e Inventario"
        subtitle="Administra el catálogo oficial de Lume, imágenes alojadas en Firebase Storage y precios de oferta"
        actionButton={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#B8944F]" />
            <span>Crear Producto</span>
          </button>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        
        {/* Filtros y Buscador */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9D7940]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Categoría:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#9D7940]"
            >
              <option value="Todas">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio Normal</th>
                  <th className="py-3 px-4">Oferta</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imagen_url || "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=120&q=80"}
                          alt={prod.nombre}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 flex-shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <p className="font-editorial text-sm font-bold text-stone-900 truncate">
                            {prod.nombre}
                          </p>
                          <p className="text-[11px] text-stone-400 line-clamp-1">
                            {prod.descripcion}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {prod.categoria}
                    </td>

                    <td className="py-3 px-4 font-bold text-stone-900">
                      {formatCurrency(prod.precio)}
                    </td>

                    <td className="py-3 px-4">
                      {prod.es_oferta ? (
                        <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          <span>{formatCurrency(prod.precio_oferta)}</span>
                          <span className="text-[9px] uppercase font-extrabold">(Activa)</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[11px]">No</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          prod.stock <= 5
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {prod.stock} u.
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.nombre)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-6 top-6 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              {editingProduct ? "Editar Producto" : "Nuevo Producto Lume"}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Los datos se guardan en Supabase y las imágenes se suben a Firebase Storage.
            </p>

            {feedback.message && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  feedback.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Vela Lume Santal & Ámbar"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descripción Sensorial
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Notas aromáticas, tipo de cera y horas de duración..."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Precio Regular ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="28.50"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Precio Oferta ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={!formData.es_oferta}
                    value={formData.precio_oferta}
                    onChange={(e) => setFormData({ ...formData, precio_oferta: e.target.value })}
                    placeholder="22.80"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none disabled:bg-stone-200/50"
                  />
                </div>
              </div>

              {/* Checkbox Oferta */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.es_oferta}
                  onChange={(e) => setFormData({ ...formData, es_oferta: e.target.checked })}
                  className="rounded text-[#9D7940] focus:ring-[#9D7940]"
                />
                <span className="text-xs font-semibold text-stone-700">
                  Activar como &quot;Oferta Destacada&quot; en el carrusel principal
                </span>
              </label>

              {/* INTEGRACIÓN CON FIREBASE STORAGE */}
              <div className="pt-2 border-t border-stone-100">
                <ImageUploader
                  currentImageUrl={formData.imagen_url}
                  onImageUploaded={(url) => setFormData({ ...formData, imagen_url: url })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/3 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? "Guardando en Supabase..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
