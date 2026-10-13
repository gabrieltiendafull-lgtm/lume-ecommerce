# 🌿 LUME Home & Scents - Sistema Integral E-Commerce y Administración

Sistema web profesional y modular de catálogo de ventas para clientes y panel administrativo empresarial para la marca **Lume**, diseñado bajo un **Stack 100% Gratuito**:

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Lucide Icons + Recharts.
- **Base de Datos & Backend:** Supabase (PostgreSQL con Triggers de stock automático y Row Level Security - RLS).
- **Autenticación:** Supabase Auth integrado con Google Identity (Google OAuth 2.0).
- **Almacenamiento de Imágenes:** Google Firebase Storage (alojamiento gratuito e ilimitado para imágenes sin consumir cuota de Supabase).
- **Despliegue de Producción:** Render (Web Service gratuito con Node.js o Docker Standalone).
- **Checkout Omnicanal:** Registro relacional en base de datos y confirmación directa preformateada vía WhatsApp.

---

## 📁 Estructura del Proyecto

```text
lume-ecommerce/
├── app/
│   ├── layout.js                 # Layout global con AuthProvider y CartProvider
│   ├── page.js                   # Catálogo público interactivo Lume
│   ├── globals.css               # Estilos globales y paleta de diseño Lume
│   └── admin/
│       ├── layout.js             # Layout protegido con verificación de sesión Google
│       ├── page.js               # Dashboard financiero: KPIs y gráfico Ventas vs Egresos
│       ├── login/
│       │   └── page.js           # Inicio de sesión con Google OAuth (Google Identity)
│       ├── productos/
│       │   └── page.js           # CRUD de catálogo + Subida directa a Firebase Storage
│       ├── ventas/
│       │   └── page.js           # Gestión de pedidos entrantes y Terminal POS presencial
│       ├── finanzas/
│       │   └── page.js           # Registro de Gastos operativos y Compras a proveedores
│       └── clientes/
│           └── page.js           # Directorio de clientes registrados y enlace a WhatsApp
├── components/
│   ├── Navbar.js                 # Cabecera con logo Lume y contador de carrito
│   ├── HeroBanner.js             # Banner editorial con fotografía de producto
│   ├── OffersCarousel.js         # Carrusel que filtra dinámicamente es_oferta = true
│   ├── ProductGrid.js            # Grid de productos con buscador y filtro por categoría
│   ├── ProductCard.js            # Tarjeta de producto con stock tag y badge de oferta
│   ├── CartDrawer.js             # Carrito lateral deslizable y checkout a WhatsApp
│   ├── Footer.js                 # Pie de página y enlaces institucionales
│   └── admin/
│       ├── AdminSidebar.js       # Menú lateral del panel administrativo
│       ├── AdminHeader.js        # Cabecera con estado de conexión a Supabase y Firebase
│       ├── KpiCard.js            # Tarjetas de métricas financieras
│       ├── FinancialChart.js     # Gráfico dinámico Recharts (Ventas vs Egresos)
│       └── ImageUploader.js      # Subida drag & drop con barra de progreso a Firebase
├── context/
│   ├── CartContext.js            # Carrito de compras global persistido en localStorage
│   └── AuthContext.js            # Manejador de estado de sesión Supabase / Google
├── lib/
│   ├── supabase.js               # Cliente y servicios de Supabase (CRUD, Triggers, Auth)
│   ├── firebase.js               # Cliente de Firebase Storage y subida de archivos
│   ├── mockData.js               # Datos de respaldo visual de la marca Lume
│   └── utils.js                  # Formateadores de moneda, fecha y generador WhatsApp
├── supabase/
│   └── schema.sql                # Script SQL completo (tablas, RLS, triggers, semillas)
├── public/
│   └── lume-logo.svg             # Logo vectorial de alta definición para Lume
├── .env.example                  # Plantilla de variables de entorno requeridas
├── render.yaml                   # Blueprint de infraestructura para Render Web Service
├── Dockerfile                    # Contenedor optimizado para Render
└── next.config.js                # Configuración de dominios de imágenes remotas
```

---

## 🛠️ Paso 1: Configurar Supabase (PostgreSQL)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve al apartado **SQL Editor** en el menú lateral izquierdo.
3. Copia todo el contenido de [`supabase/schema.sql`](file:///C:/Users/Usuario/.gemini/antigravity/scratch/lume-ecommerce/supabase/schema.sql) y haz clic en **Run**.
4. Este script crea automáticamente:
   - Las 6 tablas relacionales (`productos`, `clientes`, `ventas`, `detalle_ventas`, `gastos`, `compras`).
   - El **Trigger SQL** `trg_descontar_stock` que descuenta existencias de forma atómica al insertar pedidos.
   - Las políticas **Row Level Security (RLS)** para permitir catálogo público y restringir finanzas a administradores.
   - Datos semilla con productos reales de velas y ambientación de la marca Lume.
5. En **Project Settings > API**, copia la `Project URL` y la `anon public key`.

---

## 🔥 Paso 2: Configurar Firebase Storage (Plan Gratuito Spark)

1. Ingresa a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto gratuito.
2. En el menú lateral, dirígete a **Build > Storage** y pulsa **Get Started**.
3. Selecciona el modo de inicio (Test mode o Configura las reglas de lectura pública):
   ```text
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if true; // O restringir a tu token de admin
       }
     }
   }
   ```
4. En **Project Settings > General**, añade una aplicación Web y copia los valores del objeto `firebaseConfig`.

---

## 🔑 Paso 3: Configurar Google OAuth en Supabase Auth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services > Credentials**.
2. Crea un **OAuth 2.0 Client ID** tipo *Web Application*.
3. En **Authorized Redirect URIs**, agrega la URL de callback provista por Supabase:
   `https://<TU-PROYECTO-ID>.supabase.co/auth/v1/callback`
4. En el panel de Supabase, ve a **Authentication > Providers > Google**, habilítalo y pega el Client ID y Client Secret de Google.

---

## 🚀 Paso 4: Despliegue en Render (Render Web Service)

### Método A: Despliegue Directo vía Git (Recomendado)
1. Sube este repositorio a GitHub.
2. En [render.com](https://render.com), haz clic en **New + > Web Service**.
3. Conecta tu repositorio de GitHub.
4. Completa la configuración básica:
   - **Environment:** `Node`
   - **Plan:** `Free`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
5. En la sección **Environment Variables**, añade las variables de tu archivo `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_WHATSAPP_PHONE` (Ej. `5491122334455`)
   - `NEXT_PUBLIC_STORE_NAME` (`Lume Home & Scents`)
6. Haz clic en **Create Web Service**. ¡Render compilará y desplegará la app automáticamente!

### Método B: Vía Blueprint (`render.yaml`)
En Render, selecciona **New + > Blueprint**, apunta a este repositorio y Render detectará automáticamente [`render.yaml`](file:///C:/Users/Usuario/.gemini/antigravity/scratch/lume-ecommerce/render.yaml).

---

## 💻 Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador:
# Catálogo Público: http://localhost:3000
# Panel Administrador: http://localhost:3000/admin
```
