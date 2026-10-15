// ==============================================================================
// DATOS MOCK DE ALTA GAMA PARA LA MARCA LUMÉ
// ==============================================================================
// Utilizados como respaldo visual y prototipado rápido antes de conectar Supabase.

export const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    nombre: "Vela Lumé Santal & Ámbar",
    descripcion: "Vela artesanal en cuenco de cerámica mate con cera 100% de soja natural, mecha de madera crujiente y notas olfativas de sándalo australiano, ámbar cálido y vainilla bourbon.",
    precio: 28.50,
    precio_oferta: 22.80,
    es_oferta: true,
    stock: 45,
    imagen_url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    categoria: "Velas Aromáticas"
  },
  {
    id: "prod-2",
    nombre: "Vela Lumé Jazmín Blanco & Té Blanco",
    descripcion: "Elegante fragancia floral serena. Cera de soja vertida a mano con mecha de algodón orgánico. Tiempo de combustión: 55 horas.",
    precio: 26.00,
    precio_oferta: 19.90,
    es_oferta: true,
    stock: 30,
    imagen_url: "https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=800&q=80",
    categoria: "Velas Aromáticas"
  },
  {
    id: "prod-3",
    nombre: "Difusor Botánico Lumé Higo & Cedro 250ml",
    descripcion: "Difusor de varillas de ratán natural con aceites esenciales de higo maduro, cedro ahumado y bergamota en frasco de boticario ámbar.",
    precio: 34.00,
    precio_oferta: 28.90,
    es_oferta: true,
    stock: 25,
    imagen_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    categoria: "Difusores"
  },
  {
    id: "prod-4",
    nombre: "Vela Escultural Lumé Bubble Zen",
    descripcion: "Diseño geométrico nórdico contemporáneo. Ideal como pieza central decorativa. Aroma sutil a lino fresco y flor de azahar.",
    precio: 24.00,
    precio_oferta: null,
    es_oferta: false,
    stock: 50,
    imagen_url: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80",
    categoria: "Velas Esculturales"
  },
  {
    id: "prod-5",
    nombre: "Lámpara de Sal Rosa del Himalaya Lumé Dome",
    descripcion: "Base de madera maciza de roble y cristal de sal pura del Himalaya tallada a mano con dimmer táctil de luz cálida.",
    precio: 42.00,
    precio_oferta: 35.00,
    es_oferta: true,
    stock: 18,
    imagen_url: "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80",
    categoria: "Lámparas de Ambiente"
  },
  {
    id: "prod-6",
    nombre: "Bruma de Almohada Lumé Lavanda Silvestre 100ml",
    descripcion: "Spray aromaterapia para inducir el descanso profundo y calmar la mente. Extractos botánicos puros de lavanda francesa y manzanilla.",
    precio: 18.00,
    precio_oferta: null,
    es_oferta: false,
    stock: 60,
    imagen_url: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80",
    categoria: "Aromaterapia"
  },
  {
    id: "prod-7",
    nombre: "Vela Lumé Café Espresso & Caramelo Salado",
    descripcion: "Experiencia envolvente de café tostado artesanal con toques de manteca de cacao y caramelo salado en vaso de vidrio ahumado.",
    precio: 27.00,
    precio_oferta: null,
    es_oferta: false,
    stock: 35,
    imagen_url: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=80",
    categoria: "Velas Aromáticas"
  },
  {
    id: "prod-8",
    nombre: "Set Regalo Lumé Ritual Cálido (Trio)",
    descripcion: "Caja de regalo prémium en lino que incluye vela miniatura, cerillas de cuello largo en botella de vidrio y difusor 100ml.",
    precio: 49.00,
    precio_oferta: 39.99,
    es_oferta: true,
    stock: 12,
    imagen_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    categoria: "Sets de Regalo"
  }
];

export const MOCK_CATEGORIES = [
  "Todos",
  "Velas Aromáticas",
  "Velas Esculturales",
  "Difusores",
  "Lámparas de Ambiente",
  "Aromaterapia",
  "Sets de Regalo"
];

export const MOCK_FINANCIAL_DATA = [
  { mes: "May", ventas: 1420, gastos: 410, compras: 580, ganancia: 430 },
  { mes: "Jun", ventas: 1890, gastos: 460, compras: 720, ganancia: 710 },
  { mes: "Jul", ventas: 2340, gastos: 520, compras: 850, ganancia: 970 },
  { mes: "Ago", ventas: 2100, gastos: 490, compras: 690, ganancia: 920 },
  { mes: "Sep", ventas: 2850, gastos: 580, compras: 940, ganancia: 1330 },
  { mes: "Oct", ventas: 3420, gastos: 645, compras: 1100, ganancia: 1675 }
];
