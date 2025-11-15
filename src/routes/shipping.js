// backend/routes/shipping.js
// Endpoints para manejo de envíos con Correo Argentino

import express from 'express';
import { getShippingService } from '../services/shippingService.js';

const router = express.Router();

/**
 * POST /api/shipping/calculate
 * Calcular costo de envío
 */
router.post('/calculate', async (req, res) => {
  try {
    const {
      items,
      destinationZipCode,
      destinationCity,
      destinationState,
      originZipCode,
    } = req.body;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren items para calcular el envío',
      });
    }

    if (!destinationZipCode) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el código postal de destino',
      });
    }

    const shippingService = getShippingService();

    // Validar código postal
    if (!shippingService.validateZipCode(destinationZipCode)) {
      return res.status(400).json({
        success: false,
        error: 'Código postal inválido',
      });
    }

    // Calcular envío
    const result = await shippingService.calculateShipping({
      items,
      destinationZipCode,
      destinationCity,
      destinationState,
      originZipCode,
    });

    res.json(result);

  } catch (error) {
    console.error('Error en /api/shipping/calculate:', error);
    res.status(500).json({
      success: false,
      error: 'Error al calcular el envío',
      details: error.message,
    });
  }
});

/**
 * GET /api/shipping/pickup-points
 * Obtener puntos de retiro cercanos
 */
router.get('/pickup-points', async (req, res) => {
  try {
    const { zipCode, limit } = req.query;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el código postal',
      });
    }

    const shippingService = getShippingService();
    const result = await shippingService.getNearestPickupPoints(zipCode, limit || 5);

    res.json(result);

  } catch (error) {
    console.error('Error en /api/shipping/pickup-points:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener puntos de retiro',
    });
  }
});

/**
 * POST /api/shipping/validate-address
 * Validar dirección de envío
 */
router.post('/validate-address', async (req, res) => {
  try {
    const { zipCode, address, city, state } = req.body;

    const shippingService = getShippingService();
    
    const isValidZipCode = shippingService.validateZipCode(zipCode);

    if (!isValidZipCode) {
      return res.json({
        success: false,
        valid: false,
        error: 'Código postal inválido',
      });
    }

    // Aquí podrías agregar más validaciones si la API lo permite
    res.json({
      success: true,
      valid: true,
      zipCode,
      address,
      city,
      state,
    });

  } catch (error) {
    console.error('Error en /api/shipping/validate-address:', error);
    res.status(500).json({
      success: false,
      error: 'Error al validar la dirección',
    });
  }
});

export default router;
