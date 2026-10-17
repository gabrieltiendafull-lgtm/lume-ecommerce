"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useBranding } from "@/context/BrandingContext";
import { uploadImageToStorage } from "@/lib/supabase";
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
  Link2,
  Phone,
  Send,
  ExternalLink,
  Save
} from "lucide-react";

export default function AdminConfiguracionPage() {
  const {
    logoUrl,
    storeName,
    brandTagline,
    whatsappPhone,
    whatsappButtonText,
    whatsappCustomMsg,
    updateLogo,
    updateBranding,
    updateWhatsApp,
    resetBranding
  } = useBranding();

  const [inputLogoUrl, setInputLogoUrl] = useState(logoUrl || "");
  const [inputStoreName, setInputStoreName] = useState(storeName || "");
  const [inputTagline, setInputTagline] = useState(brandTagline || "");

  // Estados de WhatsApp
  const [inputPhone, setInputPhone] = useState(whatsappPhone || "");
  const [inputButtonText, setInputButtonText] = useState(whatsappButtonText || "");
  const [inputCustomMsg, setInputCustomMsg] = useState(whatsappCustomMsg || "");
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (logoUrl) setInputLogoUrl(logoUrl);
    if (storeName) setInputStoreName(storeName);
    if (brandTagline) setInputTagline(brandTagline);
    if (whatsappPhone) setInputPhone(whatsappPhone);
    if (whatsappButtonText) setInputButtonText(whatsappButtonText);
    if (whatsappCustomMsg) setInputCustomMsg(whatsappCustomMsg);
  }, [logoUrl, storeName, brandTagline, whatsappPhone, whatsappButtonText, whatsappCustomMsg]);

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
      const uploadedUrl = await uploadImageToStorage(file);
      setInputLogoUrl(uploadedUrl);
      await updateLogo(uploadedUrl);
      setFeedback({
        type: "success",
        message: "¡Logotipo subido y aplicado en toda la aplicación con éxito!"
      });
    } catch (err) {
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
      storeName: inputStoreName.trim() || "Lumé Joyas & Accesorios",
      brandTagline: inputTagline.trim() || "Joyas, pulseras y cadenitas delicadas para mujer",
    });
    setFeedback({
      type: "success",
      message: "¡Información de la empresa guardada correctamente!"
    });
  };

  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    if (!inputPhone.trim()) {
      setFeedback({ type: "error", message: "Por favor ingresa un número de teléfono para WhatsApp." });
      return;
    }

    setSavingWhatsApp(true);
    setFeedback({ type: "", message: "" });
    try {
      await updateWhatsApp({
        phone: inputPhone.trim(),
        buttonText: inputButtonText.trim() || "Enviar Confirmación por WhatsApp",
        customMsg: inputCustomMsg.trim(),
      });
      setFeedback({
        type: "success",
        message: "¡Botón y número de WhatsApp actualizados correctamente en toda la tienda!"
      });
    } catch (e) {
      setFeedback({ type: "error", message: "Error al guardar WhatsApp: " + e.message });
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const handleReset = async () => {
    if (confirm("¿Deseas restablecer el logo al diseño original de Lumé?")) {
      await resetBranding();
      setInputLogoUrl("/lume-logo.png");
      setInputStoreName("Lumé Joyas & Accesorios");
      setInputTagline("Joyas, pulseras y cadenitas delicadas para mujer");
      setFeedback({
        type: "success",
        message: "Se ha restaurado el logo e identidad original de Lumé."
      });
    }
  };

  const cleanTestPhone = (inputPhone || "5491122334455").replace(/[^0-9]/g, "");

  return (
    <div>
      <AdminHeader
        title="Personalización, Logo y Contacto de WhatsApp"
        subtitle="Modifica el logotipo, la identidad de Lumé y el botón de WhatsApp al finalizar el pedido"
        actionButton={
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors border border-stone-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Restablecer Identidad Original</span>
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

        {/* 1. SECCIÓN: CANAL Y BOTÓN DE WHATSAPP (MODIFICABLE EN CUALQUIER MOMENTO) */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span>Botón de Contacto de WhatsApp al Finalizar Pedido</span>
              </h3>
              <p className="text-xs text-stone-500">
                Cambia en el momento que quieras el número de WhatsApp receptor y el texto que ven tus clientas al confirmar su compra en el carrito.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start">
              Activo en Carrito
            </span>
          </div>

          <form onSubmit={handleSaveWhatsApp} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Número de WhatsApp Receptor (con código de país) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Ej. +54 9 11 2233 4455 o 5491122334455"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  A este número llegarán todos los pedidos con las joyas seleccionadas y datos de entrega.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Texto del Botón de WhatsApp en el Carrito
                </label>
                <div className="relative">
                  <Send className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputButtonText}
                    onChange={(e) => setInputButtonText(e.target.value)}
                    placeholder="Enviar Confirmación por WhatsApp"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Mensaje de Apertura Opcional
              </label>
              <textarea
                rows={2}
                value={inputCustomMsg}
                onChange={(e) => setInputCustomMsg(e.target.value)}
                placeholder="¡Hola Lumé! Quiero confirmar mi pedido realizado en la tienda online..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Vista previa en vivo */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <span className="text-[11px] font-bold text-stone-500 block mb-1">
                  Vista Previa en Carrito:
                </span>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm">
                  <Send className="w-4 h-4" />
                  <span>{inputButtonText || "Enviar Confirmación por WhatsApp"}</span>
                </div>
              </div>

              <div className="text-right">
                <a
                  href={`https://wa.me/${cleanTestPhone}?text=${encodeURIComponent("Prueba de botón de WhatsApp Lumé")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200 shadow-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Probar enlace ahora</span>
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingWhatsApp}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingWhatsApp ? "Guardando..." : "Guardar Configuración de WhatsApp"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. SECCIÓN: GESTIÓN DEL LOGOTIPO */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9D7940]" />
                <span>Logotipo Corporativo Global</span>
              </h3>
              <p className="text-xs text-stone-500">
                Al cambiar el logo aquí, se reflejará automáticamente en la barra superior de clientas, pie de página, panel administrativo y pantalla de inicio de sesión.
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

        {/* 3. SECCIÓN: INFORMACIÓN DE LA EMPRESA */}
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
                  placeholder="Lumé Joyas & Accesorios"
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
                  placeholder="Joyas, pulseras y cadenitas delicadas para mujer"
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
