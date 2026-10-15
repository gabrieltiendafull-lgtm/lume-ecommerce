"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBrandingConfig, saveBrandingConfig } from "@/lib/supabase";

const BrandingContext = createContext();

const DEFAULT_BRANDING = {
  logoUrl: "/lume-logo.svg",
  storeName: "Lumé Home & Scents",
  brandTagline: "Luz, calma y esencias puras para tu espacio",
};

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuración de marca directamente desde el servidor central
  useEffect(() => {
    async function loadBranding() {
      try {
        const remoteConfig = await getBrandingConfig();
        if (remoteConfig && (remoteConfig.logo_url || remoteConfig.store_name)) {
          const updated = {
            logoUrl: remoteConfig.logo_url || DEFAULT_BRANDING.logoUrl,
            storeName: remoteConfig.store_name || DEFAULT_BRANDING.storeName,
            brandTagline: remoteConfig.brand_tagline || DEFAULT_BRANDING.brandTagline,
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

  // Actualizar solo el logo en el servidor central (se propaga a todos los dispositivos)
  const updateLogo = async (newLogoUrl) => {
    const updated = { ...branding, logoUrl: newLogoUrl };
    setBranding(updated);
    try {
      await saveBrandingConfig({
        logo_url: newLogoUrl,
        store_name: updated.storeName,
        brand_tagline: updated.brandTagline,
      });
    } catch (e) {
      console.warn("Error al persistir logo en servidor:", e);
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
      });
    } catch (e) {
      console.warn("Error al persistir branding en servidor:", e);
    }
  };

  // Restablecer al logo original
  const resetBranding = async () => {
    setBranding(DEFAULT_BRANDING);
    try {
      await saveBrandingConfig({
        logo_url: DEFAULT_BRANDING.logoUrl,
        store_name: DEFAULT_BRANDING.storeName,
        brand_tagline: DEFAULT_BRANDING.brandTagline,
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
