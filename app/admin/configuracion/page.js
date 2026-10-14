"use client";

import React, { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useBranding } from "@/context/BrandingContext";
import { uploadProductImage } from "@/lib/firebase";
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Building,
  RotateCcw,
  AlertCircle,
  Eye,
  Link2
} from "lucide-react";

export default function AdminConfiguracionPage() {
  const { logoUrl, storeName, brandTagline, updateLogo, updateBranding, resetBranding } = useBranding();

  const [inputLogoUrl, setInputLogoUrl] = useState(logoUrl || "");
  const [inputStoreName, setInputStoreName] = useState(storeName || "");
  const [inputTagline, setInputTagline] = useState(brandTagline || "");
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Selecciona un archivo de imagen válido (PNG, SVG, JPG, WebP)." });
      return;
    }

    setUploading(true);
    setFeedback({ type: "", message: "" });

    try {
      // Subir archivo (directamente a Firebase Storage o dataURL si no está configurado)
      const uploadedUrl = await uploadProductImage(file);
      setInputLogoUrl(uploadedUrl);
      await updateLogo(uploadedUrl);
      setFeedback({
        type: "success",
        message: "¡Logotipo subido y aplicado en toda la aplicación con éxito!"
      });
    } catch (err) {
      // Fallback a FileReader si hay algún error de red
      const reader = new FileReader();
      reader.onload = async (event) => {
        const localDataUrl = event.target.result;
        setInputLogoUrl(localDataUrl);
        await updateLogo(localDataUrl);
        setFeedback({
          type: "success",
          message: "¡Logotipo aplicado en toda la aplicación exitosamente!"
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLogoUrl = async (e) => {
    e.preventDefault();
    if (!inputLogoUrl.trim()) {
      setFeedback({ type: "error", message: "Por favor ingresa una URL de imagen válida." });
      return;
    }

    await updateLogo(inputLogoUrl.trim());
    setFeedback({
      type: "success",
      message: "¡Logotipo actualizado en toda la aplicación con éxito!"
    });
  };

  const handleSaveGeneralInfo = async (e) => {
    e.preventDefault();
    await updateBranding({
      storeName: inputStoreName.trim() || "Lume",
      brandTagline: inputTagline.trim(),
    });
    setFeedback({
      type: "success",
      message: "¡Información de la empresa guardada correctamente!"
    });
  };

  const handleReset = async () => {
    if (confirm("¿Deseas restablecer el logo al diseño original de Lume?")) {
      await resetBranding();
      setInputLogoUrl("/lume-logo.svg");
      setInputStoreName("Lume Home & Scents");
      setInputTagline("Luz, calma y esencias puras para tu espacio");
      setFeedback({
        type: "success",
        message: "Se ha restaurado el logo e identidad original de Lume."
      });
    }
  };

  return (
    <div>
      <AdminHeader
        title="Personalización y Logo de la Empresa"
        subtitle="Cambia el logotipo corporativo para actualizarlo dinámicamente en el catálogo, menú, pie de página y panel"
        actionButton={
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors border border-stone-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Restablecer Logo Original</span>
          </button>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
        
        {feedback.message && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 shadow-sm ${
              feedback.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {feedback.type === "error" ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}

        {/* 1. SECCIÓN: GESTIÓN DEL LOGOTIPO */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9D7940]" />
                <span>Logotipo Corporativo Global</span>
              </h3>
              <p className="text-xs text-stone-500">
                Al cambiar el logo aquí, se reflejará automáticamente en la barra superior de clientes, pie de página, panel administrativo y pantalla de inicio de sesión.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#9D7940] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start">
              Sincronización en Tiempo Real
            </span>
          </div>

          {/* Vistas previas en vivo */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Vista Previa del Logo Actual
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Sobre fondo claro (como en el Catálogo) */}
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-col items-center justify-center space-y-2 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  Sobre Fondo Claro (Catálogo &amp; Web)
                </span>
                <div className="h-16 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Logo actual claro"
                    className="max-h-14 max-w-[220px] object-contain"
                  />
                </div>
              </div>

              {/* Sobre fondo oscuro (como en el Admin & Footer) */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center space-y-2 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  Sobre Fondo Oscuro (Panel &amp; Footer)
                </span>
                <div className="h-16 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Logo actual oscuro"
                    className="max-h-14 max-w-[220px] object-contain"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Métodos para subir / cambiar el Logo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Opción 1: Subir Archivo desde la computadora */}
            <div className="border-2 border-dashed border-stone-300 hover:border-[#9D7940] rounded-2xl p-6 text-center bg-stone-50/50 transition-colors flex flex-col justify-between">
              <div>
                <input
                  type="file"
                  id="logo-upload-input"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload-input"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-[#9D7940]">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 hover:underline">
                      {uploading ? "Subiendo nuevo logo..." : "Subir nuevo archivo de logo"}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Haz clic para seleccionar desde tu computadora (PNG, SVG, JPG, WebP)
                    </p>
                  </div>
                  <span className="text-[10px] text-stone-400 bg-white px-2.5 py-1 rounded-full border border-stone-200">
                    Recomendado: Fondo transparente (PNG o SVG)
                  </span>
                </label>
              </div>
            </div>

            {/* Opción 2: Pegar URL directa */}
            <form onSubmit={handleSaveLogoUrl} className="border border-stone-200 rounded-2xl p-6 bg-stone-50/30 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-[#9D7940]" />
                  <span className="text-xs font-bold text-stone-800">
                    O escribe la URL directa del logo
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mb-3">
                  Si tienes tu logo alojado en internet, pega el enlace directo aquí:
                </p>
                <input
                  type="url"
                  value={inputLogoUrl}
                  onChange={(e) => setInputLogoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi-logo.png"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Aplicar URL del Logo</span>
              </button>
            </form>

          </div>
        </div>

        {/* 2. SECCIÓN: INFORMACIÓN DE LA EMPRESA */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-stone-700" />
              <span>Nombre Comercial y Textos de Marca</span>
            </h3>
            <p className="text-xs text-stone-500">
              Personaliza el nombre de la empresa que se muestra junto al logo y en los tickets de WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSaveGeneralInfo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nombre de la Empresa o Marca
                </label>
                <input
                  type="text"
                  value={inputStoreName}
                  onChange={(e) => setInputStoreName(e.target.value)}
                  placeholder="Lume Home & Scents"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Eslogan o Subtítulo
                </label>
                <input
                  type="text"
                  value={inputTagline}
                  onChange={(e) => setInputTagline(e.target.value)}
                  placeholder="Luz, calma y esencias puras para tu espacio"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-all shadow-md"
              >
                Guardar Datos de Empresa
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
