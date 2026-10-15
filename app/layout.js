import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BrandingProvider } from "@/context/BrandingContext";

export const metadata = {
  title: "Lumé Joyas & Accesorios | Joyas, Pulseras y Cadenitas Delicadas",
  description:
    "Catálogo oficial de Lumé. Joyas, pulseras, cadenitas finas y accesorios delicados para mujer. Diseños sutiles en plata 925 y baño de oro 18k.",
  keywords: "joyas mujer, cadenitas delicadas, pulseras finas, aros, anillos plata 925, oro 18k, accesorios delicados mujer, Lume, Lume Joyas",
  openGraph: {
    title: "Lumé Joyas & Accesorios",
    description: "Joyas, pulseras y cadenitas delicadas para mujer con brillo propio.",
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
