// ==============================================================================
// DATOS MOCK DE ALTA GAMA PARA LA MARCA LUMÉ (JOYAS Y ACCESORIOS)
// ==============================================================================
// Colección delicada de mujer: Joyas, pulseras, cadenitas, anillos y accesorios.

export const MOCK_CATEGORIES = [
  "Cadenitas y Gargantillas",
  "Pulseras Delicadas",
  "Anillos Finos",
  "Aros y Aretes",
  "Dijes y Charms",
  "Sets de Joyas",
  "Accesorios de Mujer"
];

export const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    nombre: "Cadenita Lumé Punto de Luz en Oro 18k",
    descripcion: "Cadena veneciana extrafina de 45cm con dije circular de circón cúbico engarzado en cuatro puntas. Acabado brillante, sutil y completamente hipoalergénica.",
    precio: 34.00,
    precio_oferta: 28.00,
    es_oferta: true,
    stock: 25,
    imagen_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    categoria: "Cadenitas y Gargantillas"
  },
  {
    id: "prod-2",
    nombre: "Pulsera Lumé Tennis Delicada de Circonias",
    descripcion: "Pulsera de hilo continuo con circonitas engastadas individualmente en plata 925 con baño de rodio. Cierre de joyero con traba de seguridad lateral.",
    precio: 32.00,
    precio_oferta: 25.50,
    es_oferta: true,
    stock: 20,
    imagen_url: "https://images.unsplash.com/photo-1611591475152-47354924c1e4?auto=format&fit=crop&w=800&q=80",
    categoria: "Pulseras Delicadas"
  },
  {
    id: "prod-3",
    nombre: "Cadenita Gargantilla Lumé Perlas de Río Naturales",
    descripcion: "Gargantilla delicada armada con pequeñas perlas de agua dulce seleccionadas y broche marinero bañado en oro de 18 kilates.",
    precio: 38.00,
    precio_oferta: 29.90,
    es_oferta: true,
    stock: 15,
    imagen_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    categoria: "Cadenitas y Gargantillas"
  },
  {
    id: "prod-4",
    nombre: "Anillo Lumé Solitario Étoile Regulable",
    descripcion: "Anillo minimalista de cuerpo ultrafino en plata 925 con pequeña gema central talla brillante facetada. Diseño regulable que se adapta cómodamente a cualquier dedo.",
    precio: 24.00,
    precio_oferta: null,
    es_oferta: false,
    stock: 35,
    imagen_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    categoria: "Anillos Finos"
  },
  {
    id: "prod-5",
    nombre: "Aros Lumé Mini Argollas Huggies Pavé",
    descripcion: "Par de aros tipo argollita huggie de 10mm recubiertos con delicadas microcirconias pavé. Cierre click a presión, ideales para el día a día o segundo agujero.",
    precio: 22.00,
    precio_oferta: 18.50,
    es_oferta: true,
    stock: 40,
    imagen_url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
    categoria: "Aros y Aretes"
  },
  {
    id: "prod-6",
    nombre: "Pulsera Lumé Doble Cadena con Medallita Sutil",
    descripcion: "Pulsera de diseño doble con eslabones finos en plata 925 y dije de medallita redonda pulida a espejo. Largo ajustable de 16 a 19 cm.",
    precio: 27.00,
    precio_oferta: null,
    es_oferta: false,
    stock: 30,
    imagen_url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80",
    categoria: "Pulseras Delicadas"
  },
  {
    id: "prod-7",
    nombre: "Cadenita Lumé Dije Corazón Filigrana Calado",
    descripcion: "Cadenita de eslabón forcé extrafina con colgante de corazón calado con micro grabado artesanal. Baño de oro amarillo 18k.",
    precio: 29.00,
    precio_oferta: 23.90,
    es_oferta: true,
    stock: 18,
    imagen_url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
    categoria: "Cadenitas y Gargantillas"
  },
  {
    id: "prod-8",
    nombre: "Set Lumé Dúo Destello: Cadenita + Pulsera a Juego",
    descripcion: "Hermoso conjunto compuesto por cadenita punto de luz y pulsera a tono presentada en caja rígida de terciopelo con cinta de satén.",
    precio: 49.00,
    precio_oferta: 39.90,
    es_oferta: true,
    stock: 12,
    imagen_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
    categoria: "Sets de Joyas"
  }
];

export const MOCK_FINANCIAL_DATA = [
  { mes: "May", ventas: 1420, gastos: 410, compras: 580, ganancia: 430 },
  { mes: "Jun", ventas: 1890, gastos: 460, compras: 720, ganancia: 710 },
  { mes: "Jul", ventas: 2340, gastos: 520, compras: 850, ganancia: 970 },
  { mes: "Ago", ventas: 2100, gastos: 490, compras: 690, ganancia: 920 },
  { mes: "Sep", ventas: 2850, gastos: 580, compras: 940, ganancia: 1330 },
  { mes: "Oct", ventas: 3420, gastos: 645, compras: 1100, ganancia: 1675 }
];
