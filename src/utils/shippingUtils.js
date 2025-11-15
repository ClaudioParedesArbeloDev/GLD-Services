// shippingUtils.js
// CÁLCULO DE ENVÍOS ARGENTINA 2025 – 100% EN GRAMOS
// Optimizado para tu DB (peso en gramos)

const TARIFAS_ENVIO_2025_GRAMOS = {
  andreani: {
    nombre: "Andreani",
    sucursal: {
      zona1: [11000, 15000, 20000, 25000],     // hasta 2000g, 5000g, 10000g, 15000g+
      zona2: [13000, 17000, 23000, 30000],
      patagonia: [18000, 24000, 32000, 42000]
    },
    domicilio: {
      zona1: [13000, 17000, 23000, 30000],
      zona2: [16000, 21000, 28000, 37000],
      patagonia: [21000, 28000, 38000, 50000]
    },
    tiempo: "5-10 días hábiles"
  },
  oca: {
    nombre: "OCA",
    sucursal: { zona1: [16000, 19000, 24000, 30000], zona2: [19000, 23000, 29000, 38000], patagonia: [24000, 30000, 40000, 52000] },
    domicilio: { zona1: [19000, 23000, 29000, 37000], zona2: [22000, 27000, 35000, 45000], patagonia: [28000, 35000, 46000, 60000] },
    tiempo: "6-10 días hábiles"
  },
  correoArgentino: {
    nombre: "Correo Argentino",
    sucursal: { zona1: [16000, 20000, 25000, 32000], zona2: [19000, 24000, 30000, 39000], patagonia: [24000, 31000, 41000, 54000] },
    domicilio: { zona1: [19000, 24000, 30000, 38000], zona2: [22000, 28000, 36000, 47000], patagonia: [28000, 36000, 47000, 62000] },
    tiempo: "6-10 días hábiles"
  }
};

const ORIGEN = { codigoPostal: "2121", ciudad: "Pérez", provincia: "Santa Fe" };

const CONFIG = {
  pesoMaximo: 30000,        // 30 kg = 30.000 gramos
  factorVolumetrico: 5000,  // 1 kg = 5000 cm³ → estándar Argentina
  envioGratisDesde: 100000
};

// ==================== ZONA ====================
export const determinarZona = (cp) => {
  const codigo = parseInt(cp);
  if ((codigo >= 2000 && codigo <= 2199) || (codigo >= 3000 && codigo <= 3999)) return 'zona1';
  if (codigo >= 8000) return 'patagonia';
  return 'zona2';
};

// ==================== PESO REAL (en gramos) ====================
export const calculateTotalWeight = (cart) => {
  return cart.reduce((total, item) => {
    const pesoGramos = parseFloat(item.peso) || parseFloat(item.weight) || 500;
    return total + (pesoGramos * item.quantity);
  }, 0);
};

// ==================== PESO VOLUMÉTRICO (en gramos) ====================
const calcularPesoVolumetricoUnItem = (largo, ancho, alto) => {
  const volumenCm3 = largo * ancho * alto;
  return Math.ceil(volumenCm3 / CONFIG.factorVolumetrico) * 1000; // → gramos
};

export const getProductDimensions = (product) => ({
  largo: parseFloat(product.largo) || parseFloat(product.profundidad) || parseFloat(product.length) || 30,
  ancho: parseFloat(product.ancho) || parseFloat(product.width) || 20,
  alto: parseFloat(product.alto) || parseFloat(product.height) || parseFloat(product.altura) || 15
});

export const calculateTotalVolumetricWeight = (cart) => {
  return cart.reduce((total, item) => {
    const { largo, ancho, alto } = getProductDimensions(item);
    const pesoVolItem = calcularPesoVolumetricoUnItem(largo, ancho, alto);
    return total + (pesoVolItem * item.quantity);
  }, 0);
};

// ==================== PESO FACTURABLE (en gramos) ====================
export const calculateChargeableWeight = (cart) => {
  const real = calculateTotalWeight(cart);
  const volumetric = calculateTotalVolumetricWeight(cart);
  const chargeable = Math.max(real, volumetric);

  return {
    realWeight: real,
    volumetricWeight: volumetric,
    chargeableWeight: chargeable,
    chargeByVolume: volumetric > real
  };
};

// ==================== RANGO DE PESO (en gramos) ====================
const obtenerIndicePeso = (gramos) => {
  if (gramos <= 2000) return 0;
  if (gramos <= 5000) return 1;
  if (gramos <= 10000) return 2;
  return 3; // > 10.000g
};

// ==================== CÁLCULO PRINCIPAL ====================
export const calculateShippingCost = (cart, destinationZipCode, subtotal = 0) => {
  if (!destinationZipCode || destinationZipCode.length < 4) throw new Error("CP inválido");
  if (!cart || cart.length === 0) throw new Error("Carrito vacío");

  const weight = calculateChargeableWeight(cart);

  if (weight.chargeableWeight > CONFIG.pesoMaximo) {
    throw new Error(`Peso excedido (${(weight.chargeableWeight/1000).toFixed(1)}kg)`);
  }

  // ENVÍO GRATIS
  if (subtotal >= CONFIG.envioGratisDesde) {
    return {
      isFree: true,
      cost: 0,
      options: [{ correo: "ENVÍO GRATIS", tipo: "A domicilio", precio: 0, tiempo: "5-10 días", recomendado: true }],
      weight,
      zone: determinarZona(destinationZipCode)
    };
  }

  const zona = determinarZona(destinationZipCode);
  const indice = obtenerIndicePeso(weight.chargeableWeight);
  const opciones = [];

  // Andreani
  opciones.push({ correo: "Andreani", tipo: "Sucursal", precio: TARIFAS_ENVIO_2025_GRAMOS.andreani.sucursal[zona][indice], tiempo: TARIFAS_ENVIO_2025_GRAMOS.andreani.tiempo, recomendado: true });
  opciones.push({ correo: "Andreani", tipo: "Domicilio", precio: TARIFAS_ENVIO_2025_GRAMOS.andreani.domicilio[zona][indice], tiempo: TARIFAS_ENVIO_2025_GRAMOS.andreani.tiempo });

  // OCA
  opciones.push({ correo: "OCA", tipo: "Sucursal", precio: TARIFAS_ENVIO_2025_GRAMOS.oca.sucursal[zona][indice], tiempo: TARIFAS_ENVIO_2025_GRAMOS.oca.tiempo });
  opciones.push({ correo: "OCA", tipo: "Domicilio", precio: TARIFAS_ENVIO_2025_GRAMOS.oca.domicilio[zona][indice], tiempo: TARIFAS_ENVIO_2025_GRAMOS.oca.tiempo });

  // Correo Argentino
  opciones.push({ correo: "Correo Argentino", tipo: "Sucursal", precio: TARIFAS_ENVIO_2025_GRAMOS.correoArgentino.sucursal[zona][indice], tiempo: TARIFAS_ENVIO_2025_GRAMOS.correoArgentino.tiempo });
  opciones.push({ correo: "Correo Argentino", tipo: "Domicilio", precio: TARIFAS_ENVIO_2025_GRAMOS.correoArgentino.domicilio[zona][indice], tiempo: TARIFAS_ENVIO_2025_GRAMOS.correoArgentino.tiempo });

  opciones.sort((a, b) => a.precio - b.precio);

  const masBarata = opciones[0];

  return {
    isFree: false,
    cost: masBarata.precio,
    service: `${masBarata.correo} - ${masBarata.tipo}`,
    deliveryTime: masBarata.tiempo,
    options,
    weight,
    zone: zona,
    origin: ORIGEN,
    destination: { zipCode: destinationZipCode },
    estimatedOnly: true
  };
};

export const calculateFreeShippingProgress = (subtotal) => {
  const remaining = Math.max(0, CONFIG.envioGratisDesde - subtotal);
  const percentage = Math.min(100, (subtotal / CONFIG.envioGratisDesde) * 100);
  return { remaining, percentage, qualifies: subtotal >= CONFIG.envioGratisDesde, threshold: CONFIG.envioGratisDesde };
};

export const formatWeight = (gramos) => `${(gramos/1000).toFixed(2)} kg`;

export default {
  calculateShippingCost,
  calculateChargeableWeight,
  calculateFreeShippingProgress,
  formatWeight,
  determinarZona,
  TARIFAS_ENVIO_2025_GRAMOS,
  CONFIG
};