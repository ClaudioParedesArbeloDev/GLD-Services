// services/shippingService.js
// Servicio para calcular envíos con Correo Argentino

import axios from 'axios';

/**
 * Servicio para integración con Correo Argentino
 * Documentación: https://www.correoargentino.com.ar/formularios/oca
 */

const CORREO_ARGENTINO_API = {
  // Endpoints oficiales de Correo Argentino
  BASE_URL: 'https://www.correoargentino.com.ar/api',
  // Para testing, usar su sandbox si tienen
  SANDBOX_URL: 'https://sandbox.correoargentino.com.ar/api',
};

class ShippingService {
  constructor(apiKey, useSandbox = false) {
    this.apiKey = apiKey;
    this.baseURL = useSandbox ? CORREO_ARGENTINO_API.SANDBOX_URL : CORREO_ARGENTINO_API.BASE_URL;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Calcular peso total de los items del carrito
   * @param {Array} items - Items del carrito
   * @returns {number} Peso total en gramos
   */
  calculateTotalWeight(items) {
    // Estimación: cada producto pesa aprox 500g
    // En producción, cada producto debería tener su peso en la BD
    return items.reduce((total, item) => {
      const itemWeight = item.weight || 500; // gramos por defecto
      return total + (itemWeight * item.quantity);
    }, 0);
  }

  /**
   * Calcular dimensiones del paquete
   * @param {Array} items - Items del carrito
   * @returns {Object} Dimensiones en cm
   */
  calculatePackageDimensions(items) {
    // Estimación básica - en producción usar dimensiones reales
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Dimensiones por defecto (paquete pequeño)
    let dimensions = {
      largo: 30,  // cm
      ancho: 20,  // cm
      alto: 10,   // cm
    };

    // Ajustar según cantidad de items
    if (itemCount > 3) {
      dimensions = {
        largo: 40,
        ancho: 30,
        alto: 20,
      };
    }

    if (itemCount > 10) {
      dimensions = {
        largo: 60,
        ancho: 40,
        alto: 30,
      };
    }

    return dimensions;
  }

  /**
   * Calcular costo de envío usando la API de Correo Argentino
   * @param {Object} params - Parámetros del envío
   * @returns {Promise<Object>} Costo y detalles del envío
   */
  async calculateShipping(params) {
    const {
      items,
      destinationZipCode,
      destinationCity,
      destinationState,
      originZipCode = 'C1000', // CABA por defecto
    } = params;

    try {
      const weight = this.calculateTotalWeight(items);
      const dimensions = this.calculatePackageDimensions(items);

      // Request a la API de Correo Argentino
      const response = await this.client.post('/tarifas', {
        codigoPostalOrigen: originZipCode,
        codigoPostalDestino: destinationZipCode,
        peso: weight, // en gramos
        volumen: dimensions.largo * dimensions.ancho * dimensions.alto, // cm³
        valorDeclarado: items.reduce((sum, item) => 
          sum + (item.final_price * item.quantity), 0
        ),
      });

      return {
        success: true,
        cost: response.data.precio,
        deliveryTime: response.data.plazoEntrega,
        service: response.data.tipoServicio || 'Correo Argentino - Envío Estándar',
        tracking: true,
        details: {
          weight,
          dimensions,
          originZipCode,
          destinationZipCode,
          destinationCity,
          destinationState,
        },
      };

    } catch (error) {
      console.error('Error calculando envío con Correo Argentino:', error);

      // Fallback: cálculo estimado si la API falla
      return this.calculateShippingFallback(params);
    }
  }

  /**
   * Cálculo de envío fallback (cuando la API no responde)
   * Basado en tarifas aproximadas de Correo Argentino 2024
   */
  calculateShippingFallback(params) {
    const { items, destinationState } = params;
    const weight = this.calculateTotalWeight(items);

    // Tarifas base aproximadas por región (en pesos argentinos)
    const rates = {
      'Buenos Aires': { base: 2500, perKg: 800 },
      'CABA': { base: 1800, perKg: 600 },
      'Capital Federal': { base: 1800, perKg: 600 },
      'Córdoba': { base: 3200, perKg: 1000 },
      'Santa Fe': { base: 3000, perKg: 950 },
      'Mendoza': { base: 3800, perKg: 1200 },
      'Rosario': { base: 2800, perKg: 900 },
      // Agregar más provincias según necesidad
      'default': { base: 3500, perKg: 1100 },
    };

    const rate = rates[destinationState] || rates['default'];
    const weightInKg = weight / 1000;
    const cost = rate.base + (rate.perKg * Math.ceil(weightInKg));

    // Plazo estimado de entrega (días hábiles)
    const deliveryTime = destinationState === 'CABA' || destinationState === 'Capital Federal' 
      ? '2-3 días hábiles'
      : destinationState === 'Buenos Aires'
      ? '3-5 días hábiles'
      : '5-10 días hábiles';

    return {
      success: true,
      cost: Math.round(cost),
      deliveryTime,
      service: 'Correo Argentino - Envío Estándar',
      tracking: true,
      estimatedOnly: true, // Indica que es una estimación
      details: {
        weight,
        destinationState,
        note: 'Costo estimado. El valor final se confirmará en el procesamiento del pedido.',
      },
    };
  }

  /**
   * Obtener punto de retiro más cercano
   */
  async getNearestPickupPoints(zipCode, limit = 5) {
    try {
      const response = await this.client.get('/sucursales', {
        params: {
          codigoPostal: zipCode,
          limite: limit,
        },
      });

      return {
        success: true,
        pickupPoints: response.data.sucursales,
      };
    } catch (error) {
      console.error('Error obteniendo puntos de retiro:', error);
      return {
        success: false,
        error: 'No se pudieron obtener los puntos de retiro',
      };
    }
  }

  /**
   * Validar código postal argentino
   */
  validateZipCode(zipCode) {
    // Código postal argentino: letra + 4 dígitos + 3 letras (ej: C1425DKE)
    // O simplemente 4 dígitos para códigos antiguos
    const regex = /^([A-Z]\d{4}[A-Z]{3}|[A-Z]\d{4}|\d{4})$/;
    return regex.test(zipCode.toUpperCase().replace(/\s/g, ''));
  }
}

// Exportar instancia singleton
let shippingServiceInstance = null;

export const initShippingService = (apiKey, useSandbox = false) => {
  shippingServiceInstance = new ShippingService(apiKey, useSandbox);
  return shippingServiceInstance;
};

export const getShippingService = () => {
  if (!shippingServiceInstance) {
    throw new Error('ShippingService no inicializado. Llama a initShippingService primero.');
  }
  return shippingServiceInstance;
};

export default ShippingService;
