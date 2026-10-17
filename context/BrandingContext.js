"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBrandingConfig, saveBrandingConfig } from "@/lib/supabase";

const BrandingContext = createContext();

const DEFAULT_BRANDING = {
  logoUrl: "/lume-logo.png",
  storeName: "Lumé Joyas & Accesorios",
  brandTagline: "Joyas, pulseras y cadenitas delicadas para mujer",
  whatsappPhone: "+54 9 11 2233-4455",
  whatsappButtonText: "Enviar Confirmación por WhatsApp",
  whatsappCustomMsg: "¡Hola Lumé! Quiero confirmar mi pedido realizado en la tienda online.",
};

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuración de marca directamente desde el servidor central
  useEffect(() => {
    async function loadBranding() {
      try {
        const remoteConfig = await getBrandingConfig();
          const cleanLogoUrl = (!remoteConfig.logo_url || remoteConfig.logo_url === "/lume-logo.svg" || remoteConfig.logo_url.startsWith("blob:"))
            ? DEFAULT_BRANDING.logoUrl
            : remoteConfig.logo_url;
          const updated = {
            logoUrl: cleanLogoUrl,
            storeName: remoteConfig.store_name || DEFAULT_BRANDING.storeName,
            brandTagline: remoteConfig.brand_tagline || DEFAULT_BRANDING.brandTagline,
            whatsappPhone: remoteConfig.whatsapp_phone || DEFAULT_BRANDING.whatsappPhone,
            whatsappButtonText: remoteConfig.whatsapp_button_text || DEFAULT_BRANDING.whatsappButtonText,
            whatsappCustomMsg: remoteConfig.whatsapp_custom_msg || DEFAULT_BRANDING.whatsappCustomMsg,
          };
          setBranding(updated);
        }
      } catch (err) {
        console.error("Error al cargar branding:", err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadBranding();
  }, []);

  // Actualizar solo el logo en el servidor central
  const updateLogo = async (newLogoUrl) => {
    const updated = { ...branding, logoUrl: newLogoUrl };
    setBranding(updated);
    try {
      await saveBrandingConfig({
        logo_url: newLogoUrl,
        store_name: updated.storeName,
        brand_tagline: updated.brandTagline,
        whatsapp_phone: updated.whatsappPhone,
        whatsapp_button_text: updated.whatsappButtonText,
        whatsapp_custom_msg: updated.whatsappCustomMsg,
      });
    } catch (e) {
      console.warn("Error al persistir logo en servidor:", e);
    }
  };

  // Actualizar configuración de WhatsApp en el servidor central
  const updateWhatsApp = async ({ phone, buttonText, customMsg }) => {
    const updated = {
      ...branding,
      whatsappPhone: phone !== undefined ? phone : branding.whatsappPhone,
      whatsappButtonText: buttonText !== undefined ? buttonText : branding.whatsappButtonText,
      whatsappCustomMsg: customMsg !== undefined ? customMsg : branding.whatsappCustomMsg,
    };
    setBranding(updated);
    try {
      await saveBrandingConfig({
        logo_url: updated.logoUrl,
        store_name: updated.storeName,
        brand_tagline: updated.brandTagline,
        whatsapp_phone: updated.whatsappPhone,
        whatsapp_button_text: updated.whatsappButtonText,
        whatsapp_custom_msg: updated.whatsappCustomMsg,
      });
      return { success: true };
    } catch (e) {
      console.warn("Error al persistir whatsapp en servidor:", e);
      return { error: e.message };
    }
  };

  // Actualizar marca completa en el servidor central
  const updateBranding = async (partialBranding) => {
    const updated = { ...branding, ...partialBranding };
    setBranding(updated);
    try {
      await saveBrandingConfig({
        logo_url: updated.logoUrl,
        store_name: updated.storeName,
        brand_tagline: updated.brandTagline,
        whatsapp_phone: updated.whatsappPhone,
        whatsapp_button_text: updated.whatsappButtonText,
        whatsapp_custom_msg: updated.whatsappCustomMsg,
      });
    } catch (e) {
      console.warn("Error al persistir branding en servidor:", e);
    }
  };

  // Restablecer al diseño original
  const resetBranding = async () => {
    setBranding(DEFAULT_BRANDING);
    try {
      await saveBrandingConfig({
        logo_url: DEFAULT_BRANDING.logoUrl,
        store_name: DEFAULT_BRANDING.storeName,
        brand_tagline: DEFAULT_BRANDING.brandTagline,
        whatsapp_phone: DEFAULT_BRANDING.whatsappPhone,
        whatsapp_button_text: DEFAULT_BRANDING.whatsappButtonText,
        whatsapp_custom_msg: DEFAULT_BRANDING.whatsappCustomMsg,
      });
    } catch (e) {
      console.warn("Error al restablecer branding en servidor:", e);
    }
  };

  return (
    <BrandingContext.Provider
      value={{
        ...branding,
        updateLogo,
        updateWhatsApp,
        updateBranding,
        resetBranding,
        isLoaded,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding debe usarse dentro de un BrandingProvider");
  }
  return context;
}
