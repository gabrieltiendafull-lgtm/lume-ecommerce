import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BrandingProvider } from "@/context/BrandingContext";

export const metadata = {
  title: "Lume Home & Scents | Catálogo y Panel Administrativo",
  description:
    "Catálogo oficial de Lume. Velas artesanales de cera de soja 100% natural, difusores botánicos y luminarias de diseño para transformar tu hogar.",
  keywords: "velas aromaticas, cera de soja, difusores, lamparas de sal, deco, aromas, Lume",
  openGraph: {
    title: "Lume Home & Scents",
    description: "Atmósferas de calma, fragancias botánicas y diseño nórdico.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-[#DAC594] selection:text-stone-900">
        <BrandingProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
