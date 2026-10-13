// ==============================================================================
// CONFIGURACIÓN DE FIREBASE STORAGE - LUME E-COMMERCE
// ==============================================================================
// Hospedaje 100% gratuito de imágenes de productos sin consumir cuota de Supabase.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo una vez en el cliente
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage(app);

/**
 * Función utilitaria para subir una imagen de producto a Firebase Storage
 * @param {File} file - Objeto archivo obtenido del input file
 * @param {Function} onProgress - Callback para el porcentaje de carga (0-100)
 * @returns {Promise<string>} - Retorna la URL pública permanente de la imagen
 */
export async function uploadProductImage(file, onProgress) {
  // Verificación de configuración activa
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.includes('placeholder')) {
    console.warn("Firebase Storage bucket no configurado. Utilizando fallback local/mock.");
    // Simulador de subida para demostración inmediata
    if (onProgress) {
      onProgress(30);
      await new Promise(r => setTimeout(r, 200));
      onProgress(70);
      await new Promise(r => setTimeout(r, 200));
      onProgress(100);
    }
    return URL.createObjectURL(file);
  }

  // Sanitizar nombre de archivo y agregar timestamp para unicidad
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const storagePath = `productos/lume_${Date.now()}_${cleanFileName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Error al subir imagen a Firebase Storage:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
