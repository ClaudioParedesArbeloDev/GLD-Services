// shippingRoutes.js - Rutas para el módulo de envíos
// Coloca este archivo en tu carpeta de routes

import express from 'express';
import { 
  calculateShipping, 
  getShippingZones, 
  getShippingConfig 
} from '../controllers/shipping.controller.js';

const router = express.Router();

/**
 * @route   POST /api/shipping/calculate
 * @desc    Calcular costo de envío
 * @access  Public
 */
router.post('/calculate', calculateShipping);

/**
 * @route   GET /api/shipping/zones
 * @desc    Obtener zonas de envío disponibles
 * @access  Public
 */
router.get('/zones', getShippingZones);

/**
 * @route   GET /api/shipping/config
 * @desc    Obtener configuración de envíos
 * @access  Public
 */
router.get('/config', getShippingConfig);

export default router;