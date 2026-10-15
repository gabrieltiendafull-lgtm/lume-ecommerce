-- ==============================================================================
-- SCHEMA DE BASE DE DATOS POSTGRESQL PARA AIVEN.IO
-- MARCA: LUMÉ (LUMÉ HOME & SCENTS)
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    precio_oferta NUMERIC(10, 2) DEFAULT NULL CHECK (precio_oferta IS NULL OR precio_oferta >= 0),
    es_oferta BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    imagen_url TEXT,
    categoria TEXT NOT NULL DEFAULT 'Velas Aromáticas',
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

CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    fecha TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado'))
);

CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta_id ON detalle_ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto_id ON detalle_ventas(producto_id);

CREATE TABLE IF NOT EXISTS gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    categoria TEXT NOT NULL DEFAULT 'Operativo',
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);

CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor TEXT NOT NULL,
    concepto TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor);

-- TRIGGER & FUNCIÓN: DESCUENTO ATÓMICO DE STOCK
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

-- Reposición de stock
CREATE OR REPLACE FUNCTION fn_reponer_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock = stock + OLD.cantidad
    WHERE id = OLD.producto_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reponer_stock ON detalle_ventas;
CREATE TRIGGER trg_reponer_stock
AFTER DELETE ON detalle_ventas
FOR EACH ROW
EXECUTE FUNCTION fn_reponer_stock_producto();

-- DATOS SEMILLA LUMÉ
INSERT INTO productos (nombre, descripcion, precio, precio_oferta, es_oferta, stock, imagen_url, categoria)
VALUES
('Vela Lumé Santal & Ámbar', 'Vela artesanal en cuenco de cerámica mate con cera 100% de soja natural, mecha de madera crujiente y notas olfativas de sándalo australiano, ámbar cálido y vainilla bourbon.', 28.50, 22.80, true, 45, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80', 'Velas Aromáticas'),
('Vela Lumé Jazmín Blanco & Té Blanco', 'Elegante fragancia floral serena. Cera de soja vertida a mano con mecha de algodón orgánico. Tiempo de combustión: 55 horas.', 26.00, 19.90, true, 30, 'https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=800&q=80', 'Velas Aromáticas'),
('Difusor Botánico Lumé Higo & Cedro 250ml', 'Difusor de varillas de ratán natural con aceites esenciales de higo maduro, cedro ahumado y bergamota en frasco de boticario ámbar.', 34.00, 28.90, true, 25, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', 'Difusores'),
('Vela Escultural Lumé Bubble Zen', 'Diseño geométrico nórdico contemporáneo. Ideal como pieza central decorativa. Aroma sutil a lino fresco y flor de azahar.', 24.00, NULL, false, 50, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80', 'Velas Esculturales'),
('Lámpara de Sal Rosa del Himalaya Lumé Dome', 'Base de madera maciza de roble y cristal de sal pura del Himalaya tallada a mano con dimmer táctil de luz cálida.', 42.00, 35.00, true, 18, 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80', 'Lámparas de Ambiente'),
('Bruma de Almohada Lumé Lavanda Silvestre 100ml', 'Spray aromaterapia para inducir el descanso profundo y calmar la mente. Extractos botánicos puros de lavanda francesa y manzanilla.', 18.00, NULL, false, 60, 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80', 'Aromaterapia'),
('Vela Lumé Café Espresso & Caramelo Salado', 'Experiencia envolvente de café tostado artesanal con toques de manteca de cacao y caramelo salado en vaso de vidrio ahumado.', 27.00, NULL, false, 35, 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=80', 'Velas Aromáticas'),
('Set Regalo Lumé Ritual Cálido (Trio)', 'Caja de regalo prémium en lino que incluye vela miniatura, cerillas de cuello largo en botella de vidrio y difusor 100ml.', 49.00, 39.99, true, 12, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Sets de Regalo');

INSERT INTO gastos (concepto, monto, categoria, fecha)
VALUES
('Renta de Taller y Almacén Lumé', 350.00, 'Operativo', NOW() - INTERVAL '15 days'),
('Servicio Eléctrico e Internet', 85.00, 'Servicios', NOW() - INTERVAL '10 days'),
('Cajas de Envío y Papel Seda Personalizado Lumé', 120.00, 'Empaque', NOW() - INTERVAL '5 days'),
('Campaña Publicitaria Meta / Instagram Ads', 90.00, 'Marketing', NOW() - INTERVAL '3 days');

INSERT INTO compras (proveedor, concepto, monto, fecha)
VALUES
('EcoSoy Supplies Co.', 'Cera de soja en escamas 50kg y mechas de madera', 280.00, NOW() - INTERVAL '20 days'),
('AromaLab Esencias', 'Aceites esenciales botánicos puros (Sándalo, Lavanda, Ámbar)', 195.00, NOW() - INTERVAL '12 days'),
('Cerámicas Del Valle', '50 Cuencos de cerámica mate para velas Lumé', 160.00, NOW() - INTERVAL '7 days');
