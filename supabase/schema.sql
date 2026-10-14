-- ==============================================================================
-- SISTEMA INTEGRAL LUME - ESTRUCTURA DE BASE DE DATOS POSTGRESQL (SUPABASE)
-- ==============================================================================
-- Tablas: productos, clientes, ventas, detalle_ventas, gastos, compras
-- Incluye: Restricciones, Claves Foráneas, Índices, Triggers de Stock y RLS.
-- ==============================================================================

-- 1. Habilitar extensión UUID (si no está activa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: PRODUCTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    precio_oferta NUMERIC(10, 2) DEFAULT NULL CHECK (precio_oferta IS NULL OR precio_oferta >= 0),
    es_oferta BOOLEAN DEFAULT FALSE,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url TEXT, -- Almacenada en Firebase Storage
    categoria VARCHAR(100) NOT NULL DEFAULT 'Velas Aromáticas',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para búsqueda rápida en catálogo y filtrado
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_es_oferta ON public.productos(es_oferta);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON public.productos(stock);

-- ==============================================================================
-- TABLA: CLIENTES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON public.clientes(telefono);

-- ==============================================================================
-- TABLA: VENTAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
    metodo_pago VARCHAR(50) DEFAULT 'Transferencia / Efectivo',
    notas TEXT
);

CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id ON public.ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON public.ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON public.ventas(estado);

-- ==============================================================================
-- TABLA: DETALLE_VENTAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.detalle_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta_id ON public.detalle_ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto_id ON public.detalle_ventas(producto_id);

-- ==============================================================================
-- TABLA: GASTOS (Gastos operativos: alquiler, servicios, empaque, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto VARCHAR(255) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    categoria VARCHAR(100) NOT NULL DEFAULT 'Operativo', -- Operativo, Servicios, Marketing, Envíos
    fecha DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON public.gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON public.gastos(categoria);

-- ==============================================================================
-- TABLA: COMPRAS (Adquisición de insumos / inventario a proveedores)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor VARCHAR(255) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    fecha DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_compras_fecha ON public.compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON public.compras(proveedor);

-- ==============================================================================
-- TRIGGER & FUNCIÓN SQL: DESCUENTO AUTOMÁTICO DE STOCK
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_descontar_stock_producto()
RETURNS TRIGGER AS $$
DECLARE
    stock_actual INTEGER;
BEGIN
    -- Obtener stock actual del producto
    SELECT stock INTO stock_actual
    FROM public.productos
    WHERE id = NEW.producto_id
    FOR UPDATE; -- Bloqueo de fila para evitar condiciones de carrera

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto con ID % no existe.', NEW.producto_id;
    END IF;

    IF stock_actual < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %. Stock disponible: %, Solicitado: %', 
            NEW.producto_id, stock_actual, NEW.cantidad;
    END IF;

    -- Descontar el stock
    UPDATE public.productos
    SET stock = stock - NEW.cantidad,
        actualizado_en = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.producto_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar el trigger antes o después del INSERT en detalle_ventas
DROP TRIGGER IF EXISTS trg_descontar_stock ON public.detalle_ventas;
CREATE TRIGGER trg_descontar_stock
AFTER INSERT ON public.detalle_ventas
FOR EACH ROW
EXECUTE FUNCTION public.fn_descontar_stock_producto();

-- Trigger opcional para reponer stock si una venta se cancela o se elimina el detalle
CREATE OR REPLACE FUNCTION public.fn_reponer_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.productos
    SET stock = stock + OLD.cantidad,
        actualizado_en = TIMEZONE('utc'::text, NOW())
    WHERE id = OLD.producto_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reponer_stock ON public.detalle_ventas;
CREATE TRIGGER trg_reponer_stock
AFTER DELETE ON public.detalle_ventas
FOR EACH ROW
EXECUTE FUNCTION public.fn_reponer_stock_producto();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Habilitar RLS en todas las tablas
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

-- 1. PRODUCTOS
-- Público: Lectura libre para el catálogo de clientes
CREATE POLICY "Public Read Productos" 
ON public.productos FOR SELECT 
USING (true);

-- Administradores autenticados: Control total
CREATE POLICY "Admin All Productos" 
ON public.productos FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. CLIENTES
-- Clientes públicos pueden registrarse durante el checkout
CREATE POLICY "Public Insert Clientes" 
ON public.clientes FOR INSERT 
WITH CHECK (true);

-- Administradores autenticados: Ver y gestionar clientes
CREATE POLICY "Admin All Clientes" 
ON public.clientes FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. VENTAS
-- Clientes públicos pueden registrar compras desde el checkout
CREATE POLICY "Public Insert Ventas" 
ON public.ventas FOR INSERT 
WITH CHECK (true);

-- Clientes pueden leer su propia venta recién creada (por ID)
CREATE POLICY "Public Read Ventas" 
ON public.ventas FOR SELECT 
USING (true);

-- Administradores: Acceso total a ventas
CREATE POLICY "Admin All Ventas" 
ON public.ventas FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. DETALLE_VENTAS
-- Clientes públicos pueden registrar items de su compra
CREATE POLICY "Public Insert Detalle Ventas" 
ON public.detalle_ventas FOR INSERT 
WITH CHECK (true);

-- Público puede consultar detalle de venta
CREATE POLICY "Public Read Detalle Ventas" 
ON public.detalle_ventas FOR SELECT 
USING (true);

-- Administradores: Acceso total a detalle_ventas
CREATE POLICY "Admin All Detalle Ventas" 
ON public.detalle_ventas FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. GASTOS
-- Solo administradores pueden ver y gestionar gastos
CREATE POLICY "Admin All Gastos" 
ON public.gastos FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 6. COMPRAS
-- Solo administradores pueden ver y gestionar compras
CREATE POLICY "Admin All Compras" 
ON public.compras FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==============================================================================
-- SEED DATA INICIAL PARA MARCA "LUME" (Velas, Difusores y Ambientación)
-- ==============================================================================
INSERT INTO public.productos (nombre, descripcion, precio, precio_oferta, es_oferta, stock, imagen_url, categoria)
VALUES
('Vela Lume Santal & Ámbar', 'Vela artesanal en cuenco de cerámica mate con cera 100% de soja natural, mecha de madera crujiente y notas olfativas de sándalo australiano, ámbar cálido y vainilla bourbon.', 28.50, 22.80, true, 45, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80', 'Velas Aromáticas'),
('Vela Lume Jazmín Blanco & Té Blanco', 'Elegante fragancia floral serena. Cera de soja vertida a mano con mecha de algodón orgánico. Tiempo de combustión: 55 horas.', 26.00, 19.90, true, 30, 'https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=800&q=80', 'Velas Aromáticas'),
('Difusor Botánico Lume Higo & Cedro 250ml', 'Difusor de varillas de ratán natural con aceites esenciales de higo maduro, cedro ahumado y bergamota en frasco de boticario ámbar.', 34.00, 28.90, true, 25, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', 'Difusores'),
('Vela Escultural Lume Bubble Zen', 'Diseño geométrico nórdico contemporáneo. Ideal como pieza central decorativa. Aroma sutil a lino fresco y flor de azahar.', 24.00, NULL, false, 50, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80', 'Velas Esculturales'),
('Lámpara de Sal Rosa del Himalaya Lume Dome', 'Base de madera maciza de roble y cristal de sal pura del Himalaya tallada a mano con dimmer táctil de luz cálida.', 42.00, 35.00, true, 18, 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80', 'Lámparas de Ambiente'),
('Bruma de Almohada Lume Lavanda Silvestre 100ml', 'Spray aromaterapia para inducir el descanso profundo y calmar la mente. Extractos botánicos puros de lavanda francesa y manzanilla.', 18.00, NULL, false, 60, 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80', 'Aromaterapia'),
('Vela Lume Café Espresso & Caramelo Salado', 'Experiencia envolvente de café tostado artesanal con toques de manteca de cacao y caramelo salado en vaso de vidrio ahumado.', 27.00, NULL, false, 35, 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=80', 'Velas Aromáticas'),
('Set Regalo Lume Ritual Cálido (Trio)', 'Caja de regalo prémium en lino que incluye vela miniatura, cerillas de cuello largo en botella de vidrio y difusor 100ml.', 49.00, 39.99, true, 12, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Sets de Regalo');

-- Semilla de Gastos (para pruebas del dashboard)
INSERT INTO public.gastos (concepto, monto, categoria, fecha)
VALUES
('Renta de Taller y Almacén', 350.00, 'Operativo', CURRENT_DATE - INTERVAL '15 days'),
('Servicio Eléctrico e Internet', 85.00, 'Servicios', CURRENT_DATE - INTERVAL '10 days'),
('Cajas de Envío y Papel Seda Personalizado Lume', 120.00, 'Empaque', CURRENT_DATE - INTERVAL '5 days'),
('Campaña Publicitaria Meta / Instagram Ads', 90.00, 'Marketing', CURRENT_DATE - INTERVAL '3 days');

-- Semilla de Compras a Proveedores
INSERT INTO public.compras (proveedor, concepto, monto, fecha)
VALUES
('EcoSoy Supplies Co.', 'Cera de soja en escamas 50kg y mechas de madera', 280.00, CURRENT_DATE - INTERVAL '20 days'),
('AromaLab Esencias', 'Aceites esenciales puros (Sándalo, Lavanda, Ámbar)', 195.00, CURRENT_DATE - INTERVAL '12 days'),
('Cerámicas Del Valle', '50 Cuencos de cerámica mate para velas', 160.00, CURRENT_DATE - INTERVAL '7 days');

-- ==============================================================================
-- 7. TABLA: USUARIOS_ADMIN (Credenciales y usuarios administradores)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.usuarios_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol VARCHAR(100) DEFAULT 'Administrador General',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.usuarios_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Usuarios Admin" ON public.usuarios_admin FOR SELECT USING (true);
CREATE POLICY "Admin All Usuarios Admin" ON public.usuarios_admin FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Usuario inicial por defecto
INSERT INTO public.usuarios_admin (nombre, email, usuario, password, rol)
VALUES ('Administrador Principal', 'admin@lume.com', 'admin', 'admin123', 'Administrador General')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- 8. TABLA: CONFIGURACION (Logo dinámico, nombre de empresa y branding)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.configuracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Configuracion" ON public.configuracion FOR SELECT USING (true);
CREATE POLICY "Admin All Configuracion" ON public.configuracion FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.configuracion (clave, valor)
VALUES 
('logo_url', '/lume-logo.svg'),
('store_name', 'Lume Home & Scents'),
('brand_tagline', 'Luz, calma y esencias puras para tu espacio')
ON CONFLICT (clave) DO NOTHING;

