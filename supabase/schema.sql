-- ==============================================================================
-- SCHEMA DE BASE DE DATOS POSTGRESQL PARA AIVEN.IO / SUPABASE
-- MARCA: LUMÉ (JOYAS, PULSERAS, CADENITAS Y ACCESORIOS DELICADOS DE MUJER)
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT UNIQUE NOT NULL,
    creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO categorias (nombre) VALUES
('Cadenitas y Gargantillas'),
('Pulseras Delicadas'),
('Anillos Finos'),
('Aros y Aretes'),
('Dijes y Charms'),
('Sets de Joyas'),
('Accesorios de Mujer')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    precio_oferta NUMERIC(10, 2) DEFAULT NULL CHECK (precio_oferta IS NULL OR precio_oferta >= 0),
    es_oferta BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    imagen_url TEXT,
    categoria TEXT NOT NULL DEFAULT 'Cadenitas y Gargantillas',
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_es_oferta ON productos(es_oferta);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);

CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    fecha TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado'))
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    categoria TEXT NOT NULL DEFAULT 'Operativo',
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor TEXT NOT NULL,
    concepto TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    actualizado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO configuracion (clave, valor) VALUES
('logo_url', '/lume-logo.svg'),
('store_name', 'Lumé Joyas & Accesorios'),
('brand_tagline', 'Joyas, pulseras y cadenitas delicadas para mujer'),
('whatsapp_phone', '+54 9 11 2233-4455'),
('whatsapp_button_text', 'Enviar Confirmación por WhatsApp'),
('whatsapp_custom_msg', '¡Hola Lumé! Quiero confirmar mi pedido realizado en la tienda online.')
ON CONFLICT (clave) DO NOTHING;

CREATE TABLE IF NOT EXISTS usuarios_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    usuario TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Administrador General',
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT NOW()
);

INSERT INTO usuarios_admin (nombre, email, usuario, password, rol, activo)
VALUES ('Administrador Lumé', 'admin@lume.com', 'admin', 'admin123', 'Administrador General', true)
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION fn_descontar_stock_producto()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_actual INTEGER;
BEGIN
    SELECT stock INTO v_stock_actual
    FROM productos
    WHERE id = NEW.producto_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto con ID % no existe en la base de datos.', NEW.producto_id;
    END IF;

    IF v_stock_actual < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %. Stock actual: %, Solicitado: %', 
            NEW.producto_id, v_stock_actual, NEW.cantidad;
    END IF;

    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id = NEW.producto_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_descontar_stock ON detalle_ventas;
CREATE TRIGGER trg_descontar_stock
AFTER INSERT ON detalle_ventas
FOR EACH ROW
EXECUTE FUNCTION fn_descontar_stock_producto();

INSERT INTO productos (nombre, descripcion, precio, precio_oferta, es_oferta, stock, imagen_url, categoria)
VALUES
('Cadenita Lumé Punto de Luz en Oro 18k', 'Cadena veneciana extrafina de 45cm con dije circular de circón cúbico engarzado en cuatro puntas. Acabado brillante, sutil y completamente hipoalergénica.', 34.00, 28.00, true, 25, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', 'Cadenitas y Gargantillas'),
('Pulsera Lumé Tennis Delicada de Circonias', 'Pulsera de hilo continuo con circonitas engastadas individualmente en plata 925 con baño de rodio. Cierre de joyero con traba de seguridad lateral.', 32.00, 25.50, true, 20, 'https://images.unsplash.com/photo-1611591475152-47354924c1e4?auto=format&fit=crop&w=800&q=80', 'Pulseras Delicadas'),
('Cadenita Gargantilla Lumé Perlas de Río Naturales', 'Gargantilla delicada armada con pequeñas perlas de agua dulce seleccionadas y broche marinero bañado en oro de 18 kilates.', 38.00, 29.90, true, 15, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', 'Cadenitas y Gargantillas'),
('Anillo Lumé Solitario Étoile Regulable', 'Anillo minimalista de cuerpo ultrafino en plata 925 con pequeña gema central talla brillante facetada. Diseño regulable que se adapta cómodamente a cualquier dedo.', 24.00, NULL, false, 35, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', 'Anillos Finos'),
('Aros Lumé Mini Argollas Huggies Pavé', 'Par de aros tipo argollita huggie de 10mm recubiertos con delicadas microcirconias pavé. Cierre click a presión, ideales para el día a día o segundo agujero.', 22.00, 18.50, true, 40, 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80', 'Aros y Aretes'),
('Pulsera Lumé Doble Cadena con Medallita Sutil', 'Pulsera de diseño doble con eslabones finos en plata 925 y dije de medallita redonda pulida a espejo. Largo ajustable de 16 a 19 cm.', 27.00, NULL, false, 30, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80', 'Pulseras Delicadas'),
('Cadenita Lumé Dije Corazón Filigrana Calado', 'Cadenita de eslabón forcé extrafina con colgante de corazón calado con micro grabado artesanal. Baño de oro amarillo 18k.', 29.00, 23.90, true, 18, 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80', 'Cadenitas y Gargantillas'),
('Set Lumé Dúo Destello: Cadenita + Pulsera a Juego', 'Hermoso conjunto compuesto por cadenita punto de luz y pulsera a tono presentada en caja rígida de terciopelo con cinta de satén.', 49.00, 39.90, true, 12, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', 'Sets de Joyas');
