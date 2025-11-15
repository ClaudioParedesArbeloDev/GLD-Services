// shippingController.js - Backend Controller para cálculo de envíos
// Coloca este archivo en tu carpeta de controllers

import { calculateShippingCost, calculateFreeShippingProgress } from '../utils/shippingUtils.js';

/**
 * POST /api/shipping/calculate
 * Calcula el costo de envío basado en los items y destino
 */
export const calculateShipping = async (req, res) => {
  try {
    const { items, destinationZipCode, destinationCity, destinationState } = req.body;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un carrito con productos"
      });
    }

    if (!destinationZipCode) {
      return res.status(400).json({
        success: false,
        error: "Se requiere el código postal de destino"
      });
    }

    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => {
      const price = item.final_price || item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);

    // Calcular envío
    const shippingResult = calculateShippingCost(
      items,
      destinationZipCode,
      subtotal
    );

    // Calcular progreso de envío gratis
    const freeShippingProgress = calculateFreeShippingProgress(subtotal);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      cost: shippingResult.cost,
      isFree: shippingResult.isFree,
      service: shippingResult.service,
      deliveryTime: shippingResult.deliveryTime,
      options: shippingResult.options, // Todas las opciones disponibles
      weight: {
        real: shippingResult.weight.realWeight,
        volumetric: shippingResult.weight.volumetricWeight,
        chargeable: shippingResult.weight.chargeableWeight,
        chargeByVolume: shippingResult.weight.chargeByVolume
      },
      zone: shippingResult.zone,
      origin: shippingResult.origin,
      destination: shippingResult.destination,
      estimatedOnly: shippingResult.estimatedOnly,
      freeShippingProgress: freeShippingProgress
    });

  } catch (error) {
    console.error("Error calculando envío:", error);
    
    // Respuesta de error
    return res.status(500).json({
      success: false,
      error: error.message || "Error al calcular el envío"
    });
  }
};

/**
 * GET /api/shipping/zones
 * Obtiene información sobre las zonas de envío disponibles
 */
export const getShippingZones = (req, res) => {
  try {
    const zones = {
      zona1: {
        nombre: "Santa Fe y alrededores",
        codigosPostales: "2000-2199",
        descripcion: "Santa Fe capital y Rosario"
      },
      zona2: {
        nombre: "Resto del país",
        codigosPostales: "Resto",
        descripcion: "Todo el país excepto Patagonia"
      },
      patagonia: {
        nombre: "Patagonia",
        codigosPostales: "8000+",
        descripcion: "Región patagónica"
      }
    };

    return res.status(200).json({
      success: true,
      zones: zones
    });
  } catch (error) {
    console.error("Error obteniendo zonas:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener zonas de envío"
    });
  }
};

/**
 * GET /api/shipping/config
 * Obtiene la configuración de envíos (umbral de envío gratis, etc.)
 */
export const getShippingConfig = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      config: {
        freeShippingThreshold: 100000,
        maxWeight: 30,
        origin: {
          postalCode: "2121",
          city: "Pérez",
          province: "Santa Fe"
        }
      }
    });
  } catch (error) {
    console.error("Error obteniendo configuración:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener configuración de envíos"
    });
  }
};

export default {
  calculateShipping,
  getShippingZones,
  getShippingConfig
};