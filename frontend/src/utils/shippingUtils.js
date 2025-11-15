import SHIPPING_CONFIG from '../config/shippingConfig';

/**
 * Calcula el peso total del carrito
 * @param {Array} cart - Array de productos en el carrito
 * @returns {number} - Peso total en kg
 */
export const calculateTotalWeight = (cart) => {
  return cart.reduce((total, item) => {
    // Tu DB tiene el peso en GRAMOS → campo "peso"
    const pesoEnGramos = parseFloat(item.peso) || parseFloat(item.weight) || 500; // default 500g
    const pesoEnKg = pesoEnGramos / 1000; // ← CONVERTIMOS A KG porque el resto del código espera KG
    return total + (pesoEnKg * item.quantity);
  }, 0);
};

/**
 * Calcula el peso volumétrico de un producto
 * @param {Object} dimensions - {length, width, height} en cm
 * @returns {number} - Peso volumétrico en kg
 */
export const calculateVolumetricWeight = (dimensions) => {
  const { length, width, height } = dimensions;
  const volume = length * width * height;
  return volume / SHIPPING_CONFIG.volumetricFactor;
};

/**
 * Obtiene las dimensiones de un producto
 * @param {Object} product - Producto
 * @returns {Object} - {length, width, height} en cm
 */
export const getProductDimensions = (product) => {
  // Intenta obtener dimensiones del producto
  // Soporta múltiples nombres de propiedades
  return {
    length: parseFloat(product.length) || 
            parseFloat(product.largo) || 
            parseFloat(product.dimension_length) || 
            30, // default 30cm
    width: parseFloat(product.width) || 
           parseFloat(product.ancho) || 
           parseFloat(product.dimension_width) || 
           20, // default 20cm
    height: parseFloat(product.height) || 
            parseFloat(product.alto) || 
            parseFloat(product.dimension_height) || 
            15  // default 15cm
  };
};

/**
 * Calcula el peso volumétrico total del carrito
 * @param {Array} cart - Array de productos
 * @returns {number} - Peso volumétrico total en kg
 */
export const calculateTotalVolumetricWeight = (cart) => {
  return cart.reduce((total, item) => {
    const dimensions = getProductDimensions(item);
    const volumetricWeight = calculateVolumetricWeight(dimensions);
    return total + (volumetricWeight * item.quantity);
  }, 0);
};

/**
 * Calcula el peso facturable (el mayor entre peso real y volumétrico)
 * @param {Array} cart - Array de productos
 * @returns {Object} - {weight, volumetricWeight, chargeableWeight, type}
 */
export const calculateChargeableWeight = (cart) => {
  const realWeight = calculateTotalWeight(cart);
  const volumetricWeight = calculateTotalVolumetricWeight(cart);
  
  // Se cobra por el mayor
  const chargeableWeight = Math.max(realWeight, volumetricWeight);
  
  return {
    realWeight: realWeight,
    volumetricWeight: volumetricWeight,
    chargeableWeight: chargeableWeight,
    chargeByVolume: volumetricWeight > realWeight
  };
};

/**
 * Encuentra la zona de envío según código postal
 * @param {string} postalCode - Código postal destino
 * @returns {Object} - Configuración de la zona
 */
export const findShippingZone = (postalCode) => {
  const zone = SHIPPING_CONFIG.zones.find(z => 
    z.postalCodes.test(postalCode)
  );
  
  return zone || SHIPPING_CONFIG.defaultZone;
};

/**
 * Calcula el costo de envío
 * @param {Array} cart - Productos en el carrito
 * @param {string} destinationPostalCode - CP destino
 * @param {number} subtotal - Subtotal de la compra
 * @returns {Object} - Detalle completo del envío
 */
export const calculateShippingCost = (cart, destinationPostalCode, subtotal) => {
  // Validar código postal
  if (!destinationPostalCode || destinationPostalCode.length < 4) {
    throw new Error("Código postal inválido");
  }

  // Verificar envío gratis
  if (subtotal >= SHIPPING_CONFIG.freeShippingThreshold) {
    return {
      cost: 0,
      baseCost: 0,
      weightCost: 0,
      surcharges: 0,
      total: 0,
      isFree: true,
      zone: findShippingZone(destinationPostalCode),
      weight: calculateChargeableWeight(cart),
      method: "¡Envío GRATIS! 🎉",
      deliveryDays: "3-5 días hábiles",
      origin: {
        postalCode: SHIPPING_CONFIG.originPostalCode,
        city: SHIPPING_CONFIG.originCity
      },
      destination: {
        postalCode: destinationPostalCode
      }
    };
  }

  // Obtener zona de envío
  const zone = findShippingZone(destinationPostalCode);
  
  // Calcular peso facturable
  const weightInfo = calculateChargeableWeight(cart);
  
  // Validar peso máximo
  if (weightInfo.chargeableWeight > SHIPPING_CONFIG.maxWeight) {
    throw new Error(`El peso excede el máximo permitido (${SHIPPING_CONFIG.maxWeight}kg). Contacta al vendedor.`);
  }
  
  // Costo base de la zona
  const baseCost = zone.baseCost;
  
  // Costo por peso
  const weightCost = weightInfo.chargeableWeight * zone.costPerKg;
  
  // Recargos adicionales
  const insuranceCost = subtotal * SHIPPING_CONFIG.surcharges.insurance;
  const packagingCost = SHIPPING_CONFIG.surcharges.packaging;
  const handlingCost = SHIPPING_CONFIG.surcharges.handling;
  const totalSurcharges = insuranceCost + packagingCost + handlingCost;
  
  // Total
  const totalCost = baseCost + weightCost + totalSurcharges;
  
  return {
    cost: totalCost,
    baseCost: baseCost,
    weightCost: weightCost,
    surcharges: totalSurcharges,
    breakdown: {
      base: baseCost,
      weight: weightCost,
      insurance: insuranceCost,
      packaging: packagingCost,
      handling: handlingCost
    },
    total: totalCost,
    isFree: false,
    zone: zone,
    weight: weightInfo,
    method: zone.method,
    deliveryDays: zone.deliveryDays,
    origin: {
      postalCode: SHIPPING_CONFIG.originPostalCode,
      city: SHIPPING_CONFIG.originCity,
      province: SHIPPING_CONFIG.originProvince
    },
    destination: {
      postalCode: destinationPostalCode,
      zone: zone.name
    }
  };
};

/**
 * Calcula cuánto falta para envío gratis
 * @param {number} subtotal - Subtotal actual
 * @returns {Object} - {remaining, percentage, qualifies}
 */
export const calculateFreeShippingProgress = (subtotal) => {
  const threshold = SHIPPING_CONFIG.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const percentage = Math.min(100, (subtotal / threshold) * 100);
  
  return {
    remaining: remaining,
    percentage: percentage,
    qualifies: subtotal >= threshold,
    threshold: threshold
  };
};

/**
 * Formatea la información de peso para mostrar
 * @param {Object} weightInfo - Información de peso
 * @returns {string} - Texto formateado
 */
export const formatWeightInfo = (weightInfo) => {
  if (weightInfo.chargeByVolume) {
    return `${weightInfo.chargeableWeight.toFixed(2)}kg (volumétrico)`;
  }
  return `${weightInfo.chargeableWeight.toFixed(2)}kg`;
};

export default {
  calculateTotalWeight,
  calculateVolumetricWeight,
  getProductDimensions,
  calculateTotalVolumetricWeight,
  calculateChargeableWeight,
  findShippingZone,
  calculateShippingCost,
  calculateFreeShippingProgress,
  formatWeightInfo
};
