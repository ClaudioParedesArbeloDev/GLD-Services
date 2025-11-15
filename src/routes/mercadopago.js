// backend/routes/mercadopago.js
// Endpoints para manejo de pagos con Mercado Pago

import express from 'express';
import { getMercadoPago } from '../services/mercadoPagoService.js';

const router = express.Router();

/**
 * POST /api/mercadopago/create-preference
 * Crear preferencia de pago para Checkout Pro
 */
router.post('/create-preference', async (req, res) => {
  try {
    const {
      items,
      payer,
      shipment,
      externalReference,
    } = req.body;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren items para crear la preferencia',
      });
    }

    if (!payer || !payer.email) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere información del comprador',
      });
    }

    const mercadoPago = getMercadoPago();

    // Crear preferencia
    const result = await mercadoPago.createPreference({
      items,
      payer,
      shipment,
      externalReference: externalReference || `ORDER-${Date.now()}`,
      backUrls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/pending`,
      },
    });

    if (result.success) {
      // Aquí puedes guardar la orden en la base de datos
      // await saveOrder({
      //   externalReference,
      //   items,
      //   payer,
      //   shipment,
      //   preferenceId: result.preferenceId,
      //   status: 'pending',
      // });

      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Error en /api/mercadopago/create-preference:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la preferencia de pago',
      details: error.message,
    });
  }
});

/**
 * POST /api/mercadopago/webhook
 * Recibir notificaciones de Mercado Pago
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;

    console.log('Webhook recibido de Mercado Pago:', webhookData);

    const mercadoPago = getMercadoPago();
    const result = await mercadoPago.processWebhook(webhookData);

    if (result.success) {
      // Actualizar estado de la orden en la base de datos
      // await updateOrderStatus(result.externalReference, result.status);

      // Enviar email de confirmación al cliente
      // await sendOrderConfirmationEmail(result);

      console.log('Webhook procesado exitosamente:', result);
    }

    // Siempre responder 200 a Mercado Pago para que no reintente
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error procesando webhook de Mercado Pago:', error);
    // Aún así responder 200 para evitar reintentos
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * GET /api/mercadopago/payment/:paymentId
 * Obtener información de un pago
 */
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const mercadoPago = getMercadoPago();
    const result = await mercadoPago.getPaymentInfo(paymentId);

    res.json(result);

  } catch (error) {
    console.error('Error obteniendo información del pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del pago',
    });
  }
});

/**
 * GET /api/mercadopago/payment-methods
 * Obtener métodos de pago disponibles
 */
router.get('/payment-methods', async (req, res) => {
  try {
    const mercadoPago = getMercadoPago();
    const result = await mercadoPago.getPaymentMethods();

    res.json(result);

  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener métodos de pago',
    });
  }
});

/**
 * POST /api/mercadopago/refund/:paymentId
 * Reembolsar un pago
 */
router.post('/refund/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;

    const mercadoPago = getMercadoPago();
    const result = await mercadoPago.refundPayment(paymentId, amount);

    res.json(result);

  } catch (error) {
    console.error('Error procesando reembolso:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el reembolso',
    });
  }
});

export default router;
