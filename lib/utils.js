// ==============================================================================
// UTILIDADES FORMATO Y COMUNICACIÓN - LUME E-COMMERCE
// ==============================================================================

/**
 * Formatea un número a moneda (USD o divisa local)
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Formatea una fecha ISO a formato legible en español
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Calcula el porcentaje de descuento si existe precio de oferta
 */
export function calculateDiscount(originalPrice, offerPrice) {
  if (!originalPrice || !offerPrice || offerPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
}

/**
 * Genera el enlace oficial de WhatsApp con el mensaje preformateado del pedido
 */
export function generateWhatsAppOrderLink({
  phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5491122334455',
  orderId = '',
  customer = {},
  items = [],
  total = 0
}) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  let productLines = items
    .map(item => `  • ${item.quantity}x ${item.nombre} - ${formatCurrency((item.precio_oferta || item.precio) * item.quantity)}`)
    .join('\n');

  const message = 
`✨ *NUEVO PEDIDO EN LUME HOME & SCENTS* ✨
━━━━━━━━━━━━━━━━━━━━
*Pedido ID:* #${orderId ? orderId.slice(0, 8).toUpperCase() : 'PENDIENTE'}

*DATOS DEL CLIENTE:*
👤 *Nombre:* ${customer.nombre || 'No especificado'}
📱 *Teléfono:* ${customer.telefono || 'No especificado'}
📧 *Email:* ${customer.email || 'No especificado'}
📍 *Dirección de Entrega:* ${customer.direccion || 'Acordar con la tienda'}

*DETALLE DEL PEDIDO:*
${productLines}

━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL A PAGAR:* ${formatCurrency(total)}
━━━━━━━━━━━━━━━━━━━━

¡Hola equipo de Lume! He completado mi solicitud a través del catálogo web. Aguardo sus instrucciones para coordinar el pago y el envío. ¡Muchas gracias! 🌿`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
