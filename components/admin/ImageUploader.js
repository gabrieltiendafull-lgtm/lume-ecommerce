"use client";

import React, { useState } from "react";
import { uploadProductImage } from "@/lib/firebase";
import { UploadCloud, CheckCircle2, Image as ImageIcon, Loader2, Link2 } from "lucide-react";

export default function ImageUploader({ currentImageUrl, onImageUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentImageUrl || "");
  const [manualUrl, setManualUrl] = useState("");
  const [mode, setMode] = useState("file"); // 'file' | 'url'
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).");
      return;
    }

    // Validación de tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(10);

    // Vista previa inmediata
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);

    try {
      const publicUrl = await uploadProductImage(file, (p) => {
        setProgress(p);
      });

      setPreview(publicUrl);
      onImageUploaded(publicUrl);
    } catch (err) {
      console.error("Error subiendo a Firebase:", err);
      setError("Error al subir a Firebase Storage. Verifica tus credenciales.");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyManualUrl = () => {
    if (manualUrl.trim()) {
      setPreview(manualUrl.trim());
      onImageUploaded(manualUrl.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-stone-700">
          Imagen del Producto (Firebase Storage)
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              mode === "file" ? "bg-amber-100 text-amber-900 font-bold" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Subir Archivo
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              mode === "url" ? "bg-amber-100 text-amber-900 font-bold" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            URL Externa
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div className="border-2 border-dashed border-stone-300 hover:border-[#9D7940] rounded-2xl p-5 text-center transition-colors bg-stone-50/50">
          <input
            type="file"
            id="product-image-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />

          <label
            htmlFor="product-image-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100/60 flex items-center justify-center text-[#9D7940]">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div className="text-xs">
              <span className="font-bold text-stone-800 hover:underline">
                Haz clic para subir
              </span>{" "}
              <span className="text-stone-500">o arrastra tu imagen aquí</span>
            </div>
            <p className="text-[10px] text-stone-400">
              PNG, JPG, WebP hasta 5MB &bull; Se alojará gratis en Firebase Storage
            </p>
          </label>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#9D7940] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Barra de progreso */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-stone-500 font-medium">
            <span>Subiendo a Google Firebase Storage...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#9D7940] h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error si ocurre */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* Vista previa de la imagen cargada */}
      {preview && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
          <img
            src={preview}
            alt="Vista previa"
            className="w-14 h-14 object-cover rounded-lg bg-stone-100 border"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Imagen lista para el catálogo</span>
            </div>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">
              {preview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
