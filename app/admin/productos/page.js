"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/supabase";
import { useBranding } from "@/context/BrandingContext";
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
  AlertCircle,
  Tag,
  Phone,
  Send,
  ExternalLink,
  Save,
  RotateCcw
} from "lucide-react";

export default function AdminProductosPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Todas");

  // Contexto de Marca y WhatsApp
  const { whatsappPhone, whatsappButtonText, whatsappCustomMsg, updateWhatsApp } = useBranding();

  // Estados de Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Modal de Categorías
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCatName, setEditingCatName] = useState({ oldName: "", newName: "" });
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catFeedback, setCatFeedback] = useState({ type: "", message: "" });

  // Modal de WhatsApp
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [inputPhone, setInputPhone] = useState("");
  const [inputButtonText, setInputButtonText] = useState("");
  const [inputCustomMsg, setInputCustomMsg] = useState("");
  const [waSubmitting, setWaSubmitting] = useState(false);
  const [waFeedback, setWaFeedback] = useState({ type: "", message: "" });

  // Campos del formulario de producto
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_oferta: "",
    es_oferta: false,
    stock: "20",
    categoria: "Cadenitas y Gargantillas",
    imagen_url: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (whatsappPhone) setInputPhone(whatsappPhone);
    if (whatsappButtonText) setInputButtonText(whatsappButtonText);
    if (whatsappCustomMsg) setInputCustomMsg(whatsappCustomMsg);
  }, [whatsappPhone, whatsappButtonText, whatsappCustomMsg]);

  // ==============================================================================
  // GESTIÓN DE PRODUCTOS
  // ==============================================================================

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      precio_oferta: "",
      es_oferta: false,
      stock: "20",
      categoria: categories[0] || "Cadenitas y Gargantillas",
      imagen_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
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
      categoria: product.categoria || categories[0] || "Cadenitas y Gargantillas",
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
      console.error("Error al guardar joya:", err);
      setFeedback({ type: "error", message: "Error al guardar en el servidor: " + (err.message || err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}" del catálogo de joyas?`)) {
      await deleteProduct(id);
      await loadData();
    }
  };

  // ==============================================================================
  // GESTIÓN DE CATEGORÍAS (CREAR, MODIFICAR, ELIMINAR)
  // ==============================================================================

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;

    if (categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setCatFeedback({ type: "error", message: "Esta categoría ya existe." });
      return;
    }

    setCatSubmitting(true);
    setCatFeedback({ type: "", message: "" });
    try {
      const res = await createCategory(clean);
      if (res.error) throw new Error(res.error.message);
      setCategories(res.categories || [...categories, clean]);
      setNewCategoryName("");
      setCatFeedback({ type: "success", message: `Categoría "${clean}" creada con éxito.` });
    } catch (err) {
      setCatFeedback({ type: "error", message: err.message || "Error al crear categoría." });
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleUpdateCategory = async (oldName) => {
    const cleanNew = editingCatName.newName.trim();
    if (!cleanNew || cleanNew === oldName) {
      setEditingCatName({ oldName: "", newName: "" });
      return;
    }

    setCatSubmitting(true);
    setCatFeedback({ type: "", message: "" });
    try {
      const res = await updateCategory(oldName, cleanNew);
      if (res.error) throw new Error(res.error.message);
      setCategories(res.categories || categories.map((c) => (c === oldName ? cleanNew : c)));
      setEditingCatName({ oldName: "", newName: "" });
      // Recargar productos para reflejar cambio de categoría
      await loadData();
      setCatFeedback({ type: "success", message: `Categoría renombrada a "${cleanNew}".` });
    } catch (err) {
      setCatFeedback({ type: "error", message: err.message || "Error al editar categoría." });
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catName) => {
    const count = products.filter((p) => p.categoria === catName).length;
    const warning = count > 0 ? `\nHay ${count} producto(s) en esta categoría que se reasignarán.` : "";
    if (!confirm(`¿Eliminar la categoría "${catName}"?${warning}`)) return;

    setCatSubmitting(true);
    setCatFeedback({ type: "", message: "" });
    try {
      const res = await deleteCategory(catName);
      if (res.error) throw new Error(res.error.message);
      setCategories(res.categories || categories.filter((c) => c !== catName));
      if (selectedCat === catName) setSelectedCat("Todas");
      await loadData();
      setCatFeedback({ type: "success", message: `Categoría "${catName}" eliminada.` });
    } catch (err) {
      setCatFeedback({ type: "error", message: err.message || "Error al eliminar categoría." });
    } finally {
      setCatSubmitting(false);
    }
  };

  // ==============================================================================
  // GESTIÓN DEL BOTÓN Y NÚMERO DE WHATSAPP
  // ==============================================================================

  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    if (!inputPhone.trim()) {
      setWaFeedback({ type: "error", message: "Ingresa un número de teléfono válido." });
      return;
    }

    setWaSubmitting(true);
    setWaFeedback({ type: "", message: "" });
    try {
      const res = await updateWhatsApp({
        phone: inputPhone.trim(),
        buttonText: inputButtonText.trim() || "Enviar Confirmación por WhatsApp",
        customMsg: inputCustomMsg.trim(),
      });
      if (res?.error) throw new Error(res.error);
      setWaFeedback({
        type: "success",
        message: "¡Número y botón de WhatsApp actualizados correctamente en toda la tienda!",
      });
    } catch (err) {
      setWaFeedback({ type: "error", message: "Error al actualizar WhatsApp: " + err.message });
    } finally {
      setWaSubmitting(false);
    }
  };

  const cleanTestPhone = (inputPhone || "5491122334455").replace(/[^0-9]/g, "");

  // Filtrado de productos en la tabla
  const filtered = products.filter((p) => {
    const matchCat = selectedCat === "Todas" || p.categoria === selectedCat;
    const matchSearch = p.nombre?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <AdminHeader
        title="Catálogo de Joyas y Accesorios Lumé"
        subtitle="Administra cadenitas, pulseras, aros, anillos, categorías y el botón de contacto de WhatsApp"
        actionButton={
          <div className="flex flex-wrap items-center gap-2">
            {/* Botón Gestión de Categorías */}
            <button
              onClick={() => {
                setCatFeedback({ type: "", message: "" });
                setCategoryModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold shadow-sm border border-stone-300 transition-all"
            >
              <Tag className="w-4 h-4 text-[#9D7940]" />
              <span>Gestionar Categorías ({categories.length})</span>
            </button>

            {/* Botón Modificar WhatsApp */}
            <button
              onClick={() => {
                setWaFeedback({ type: "", message: "" });
                setWhatsappModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold shadow-sm border border-emerald-200 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Modificar WhatsApp ({whatsappPhone || "+54 9 11..."})</span>
            </button>

            {/* Botón Nuevo Producto */}
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-[#B8944F]" />
              <span>Nueva Joya</span>
            </button>
          </div>
        }
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        
        {/* Barra de Filtros, Buscador y Categorías */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por joya, cadenita, pulsera, material..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9D7940]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Categoría:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#9D7940]"
            >
              <option value="Todas">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setCatFeedback({ type: "", message: "" });
                setCategoryModalOpen(true);
              }}
              title="Crear, modificar o eliminar categorías"
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
            >
              <Tag className="w-4 h-4 text-[#9D7940]" />
            </button>
          </div>
        </div>

        {/* Tabla de Productos / Joyas */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Joya / Accesorio</th>
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
                          src={prod.imagen_url || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=120&q=80"}
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

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold text-[11px]">
                        {prod.categoria}
                      </span>
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

      {/* ============================================================================== */}
      {/* 1. MODAL: GESTIÓN DE CATEGORÍAS (CREAR, MODIFICAR, ELIMINAR) */}
      {/* ============================================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute right-6 top-6 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#9D7940] mb-1">
              <Tag className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Gestión de Catálogo</span>
            </div>
            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              Categorías de Joyas y Accesorios
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Agrega nuevas categorías, renombra las existentes o elimínalas. Los cambios se reflejarán inmediatamente en la tienda y en los filtros.
            </p>

            {catFeedback.message && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  catFeedback.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{catFeedback.message}</span>
              </div>
            )}

            {/* Formulario Agregar Nueva Categoría */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de nueva categoría (ej: Tobilleras, Dijes, Gargantillas...)"
                className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
              />
              <button
                type="submit"
                disabled={catSubmitting || !newCategoryName.trim()}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#B8944F]" />
                <span>Crear</span>
              </button>
            </form>

            {/* Listado de Categorías Existentes con Acciones */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                Categorías Existentes ({categories.length})
              </label>

              {categories.map((cat) => {
                const count = products.filter((p) => p.categoria === cat).length;
                const isEditing = editingCatName.oldName === cat;

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingCatName.newName}
                          onChange={(e) =>
                            setEditingCatName({ ...editingCatName, newName: e.target.value })
                          }
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#9D7940] rounded-lg focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(cat)}
                          className="px-2.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatName({ oldName: "", newName: "" })}
                          className="px-2 py-1.5 text-stone-500 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-stone-800">{cat}</span>
                          <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                            {count} {count === 1 ? "joya" : "joyas"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCatName({ oldName: cat, newName: cat })}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
                            title="Modificar nombre de categoría"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 2. MODAL: MODIFICAR EN CUALQUIER MOMENTO EL BOTÓN DE CONTACTO DE WHATSAPP */}
      {/* ============================================================================== */}
      {whatsappModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
            <button
              onClick={() => setWhatsappModalOpen(false)}
              className="absolute right-6 top-6 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Phone className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Canal de Ventas Directo</span>
            </div>
            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              Configurar Botón de WhatsApp
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Modifica en el momento que quieras el número de WhatsApp y el texto del botón que verán tus clientas al finalizar un pedido en el carrito.
            </p>

            {waFeedback.message && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                  waFeedback.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{waFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Número de WhatsApp receptor (con código de país) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Ej. +54 9 11 2233 4455 o 5491122334455"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  A este número llegarán todos los pedidos con el detalle de las joyas y datos de la clienta.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Texto del Botón al Finalizar Pedido
                </label>
                <div className="relative">
                  <Send className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputButtonText}
                    onChange={(e) => setInputButtonText(e.target.value)}
                    placeholder="Enviar Confirmación por WhatsApp"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mensaje Introductorio Opcional
                </label>
                <textarea
                  rows={2}
                  value={inputCustomMsg}
                  onChange={(e) => setInputCustomMsg(e.target.value)}
                  placeholder="¡Hola Lumé! Quiero confirmar mi pedido realizado en la tienda online..."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Vista previa y botón de prueba */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-600 block">
                  Vista Previa del Botón en el Carrito:
                </span>
                <div className="w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md">
                  <Send className="w-4 h-4" />
                  <span>{inputButtonText || "Enviar Confirmación por WhatsApp"}</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-[11px]">
                  <span className="text-stone-500">Destino: {cleanTestPhone || "Sin configurar"}</span>
                  <a
                    href={`https://wa.me/${cleanTestPhone}?text=${encodeURIComponent("Prueba de botón de WhatsApp Lumé")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Probar enlace</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setWhatsappModalOpen(false)}
                  className="w-1/3 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={waSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{waSubmitting ? "Guardando..." : "Guardar Cambios de WhatsApp"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 3. MODAL: CREAR / EDITAR JOYA O PRODUCTO */}
      {/* ============================================================================== */}
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
              {editingProduct ? "Editar Joya / Accesorio" : "Nueva Joya Lumé"}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Los cambios se sincronizan en tiempo real en todos tus dispositivos y clientes.
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
                  Nombre de la Joya *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Cadenita Lumé Punto de Luz en Oro 18k"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descripción Delicada
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Material (Plata 925 / Oro 18k), largo de cadena, tipo de broche y gemas..."
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Categoría *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCatFeedback({ type: "", message: "" });
                        setCategoryModalOpen(true);
                      }}
                      className="text-[11px] text-[#9D7940] hover:underline font-semibold"
                    >
                      + Gestionar
                    </button>
                  </div>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none font-medium"
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
                    placeholder="34.00"
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
                    placeholder="28.00"
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

              {/* INTEGRACIÓN DE IMAGEN */}
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
                  {submitting ? "Guardando..." : "Guardar Joya"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
