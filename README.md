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

### Variables necesarias en Render

En el servicio de Render, abre **Environment** y carga estas variables. No uses
`localhost` en ninguna de ellas:

| Variable | Valor de Supabase |
| --- | --- |
| `SUPABASE_DB_URL` | En **Connect > Connection pooling > Session mode**, copia la URI completa. |
| `NEXT_PUBLIC_SUPABASE_URL` | **Project Settings > API > Project URL**. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project Settings > API > anon public key**. |

Después de guardar las variables, ejecuta un redeploy manual. La aplicación usa
`SUPABASE_DB_URL` exclusivamente en el servidor para productos, pedidos,
clientes, categorías, gastos, compras y configuración; Render no guarda estos
datos en archivos locales.

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

---

## ☁️ Paso 4: Despliegue en Google Cloud Run & Firebase Hosting (Arquitectura Google Cloud)

Esta arquitectura desacopla el frontend y el backend para máximo rendimiento y **100% Free Tier**:
- **Firebase Hosting:** Actúa como CDN global para caché de contenido estático y enrutador HTTPS.
- **Google Cloud Run:** Ejecuta el contenedor Docker de Next.js escalando automáticamente a 0 instancias cuando no hay tráfico.

### 1. Despliegue a Google Cloud Run (Backend)
Desde tu terminal con `gcloud`:
```bash
# Habilitar servicios de Cloud Run y Artifact Registry
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# Compilar y desplegar el contenedor directamente a Cloud Run
gcloud run deploy lume-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3
```

### 2. Conectar con Firebase Hosting (Frontend / CDN)
El archivo `firebase.json` ya tiene configurado el rewrite automático:
```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "lume-backend",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

Para publicar Firebase Hosting:
```bash
# Desplegar las reglas de Hosting conectadas a Cloud Run
npx firebase-tools deploy --only hosting
```

---

## 🚀 Opción Alternativa: Despliegue en Render (Render Web Service)

### Método A: Despliegue Directo vía Git
1. Conecta tu repositorio de GitHub en [render.com](https://render.com).
2. Parámetros:
   - **Environment:** `Node` o `Docker`
   - **Plan:** `Free`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
3. Agrega tus variables de entorno desde `.env.example`.

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
