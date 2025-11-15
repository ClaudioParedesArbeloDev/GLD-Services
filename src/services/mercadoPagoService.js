// services/mercadoPagoService.js
// Servicio para integración con Mercado Pago

import axios from 'axios';

/**
 * Servicio para integración con Mercado Pago
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs
 */

const MERCADOPAGO_API = {
  BASE_URL: 'https://api.mercadopago.com',
  SANDBOX_URL: 'https://api.mercadopago.com', // Mismo URL, se diferencia por el access token
};

class MercadoPagoService {
  constructor(accessToken, useSandbox = false) {
    this.accessToken = accessToken;
    this.useSandbox = useSandbox;
    
    this.client = axios.create({
      baseURL: MERCADOPAGO_API.BASE_URL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': this.generateIdempotencyKey(),
      },
      timeout: 15000,
    });
  }

  /**
   * Generar clave de idempotencia para evitar pagos duplicados
   */
  generateIdempotencyKey() {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Crear preferencia de pago
   * Esta es la forma principal de integración con Mercado Pago
   */
  async createPreference(orderData) {
    const {
      items,
      payer,
      shipment,
      backUrls,
      autoReturn = 'approved',
      externalReference,
    } = orderData;

    try {
      // Formatear items para Mercado Pago
      const formattedItems = items.map(item => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description || item.title,
        picture_url: item.image_url,
        category_id: item.category || 'others',
        quantity: item.quantity,
        currency_id: 'ARS', // Pesos argentinos
        unit_price: parseFloat(item.final_price),
      }));

      // Calcular el total
      const totalAmount = items.reduce((sum, item) => 
        sum + (item.final_price * item.quantity), 0
      );

      // Crear preferencia
      const preference = {
        items: formattedItems,
        payer: {
          name: payer.fullName,
          email: payer.email,
          phone: {
            area_code: payer.phone.substring(0, 2),
            number: payer.phone.substring(2),
          },
          address: {
            street_name: payer.address,
            street_number: payer.streetNumber || '',
            zip_code: payer.zipCode,
          },
        },
        back_urls: backUrls || {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`,
        },
        auto_return: autoReturn,
        external_reference: externalReference || `ORDER-${Date.now()}`,
        notification_url: `${process.env.VITE_API_URL || window.location.origin}/api/mercadopago/webhook`,
        statement_descriptor: 'GLD IMPORTACIONES',
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12, // Hasta 12 cuotas
        },
        shipments: shipment ? {
          cost: parseFloat(shipment.cost),
          mode: 'not_specified',
          receiver_address: {
            zip_code: shipment.zipCode,
            street_name: shipment.address,
            city_name: shipment.city,
            state_name: shipment.state,
            country_name: 'Argentina',
          },
        } : undefined,
        metadata: {
          order_date: new Date().toISOString(),
          total_amount: totalAmount,
          items_count: items.length,
        },
      };

      const response = await this.client.post('/checkout/preferences', preference);

      return {
        success: true,
        preferenceId: response.data.id,
        initPoint: this.useSandbox ? response.data.sandbox_init_point : response.data.init_point,
        publicKey: this.getPublicKey(),
      };

    } catch (error) {
      console.error('Error creando preferencia de Mercado Pago:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear la preferencia de pago',
      };
    }
  }

  /**
   * Obtener información de un pago
   */
  async getPaymentInfo(paymentId) {
    try {
      const response = await this.client.get(`/v1/payments/${paymentId}`);
      return {
        success: true,
        payment: response.data,
      };
    } catch (error) {
      console.error('Error obteniendo información del pago:', error);
      return {
        success: false,
        error: 'No se pudo obtener la información del pago',
      };
    }
  }

  /**
   * Procesar webhook de Mercado Pago
   * Este método debe ser llamado desde el backend cuando MP envía notificaciones
   */
  async processWebhook(webhookData) {
    const { type, data } = webhookData;

    try {
      if (type === 'payment') {
        const paymentInfo = await this.getPaymentInfo(data.id);
        
        if (paymentInfo.success) {
          const payment = paymentInfo.payment;
          
          return {
            success: true,
            paymentId: payment.id,
            status: payment.status,
            statusDetail: payment.status_detail,
            externalReference: payment.external_reference,
            amount: payment.transaction_amount,
            payer: {
              email: payment.payer.email,
              name: payment.payer.first_name + ' ' + payment.payer.last_name,
            },
            paymentMethod: payment.payment_method_id,
            installments: payment.installments,
            approvedAt: payment.date_approved,
          };
        }
      }

      return {
        success: false,
        error: 'Tipo de webhook no soportado',
      };

    } catch (error) {
      console.error('Error procesando webhook:', error);
      return {
        success: false,
        error: 'Error al procesar el webhook',
      };
    }
  }

  /**
   * Crear pago directo (sin redirección)
   * Para uso con Mercado Pago Checkout Pro o integración avanzada
   */
  async createPayment(paymentData) {
    const {
      transactionAmount,
      token,
      description,
      installments,
      paymentMethodId,
      payer,
      externalReference,
    } = paymentData;

    try {
      const payment = {
        transaction_amount: parseFloat(transactionAmount),
        token,
        description,
        installments: parseInt(installments),
        payment_method_id: paymentMethodId,
        payer: {
          email: payer.email,
          first_name: payer.firstName,
          last_name: payer.lastName,
        },
        external_reference: externalReference,
        notification_url: `${process.env.VITE_API_URL}/api/mercadopago/webhook`,
      };

      const response = await this.client.post('/v1/payments', payment);

      return {
        success: true,
        payment: response.data,
        status: response.data.status,
        statusDetail: response.data.status_detail,
      };

    } catch (error) {
      console.error('Error creando pago:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al procesar el pago',
      };
    }
  }

  /**
   * Obtener métodos de pago disponibles
   */
  async getPaymentMethods() {
    try {
      const response = await this.client.get('/v1/payment_methods');
      return {
        success: true,
        paymentMethods: response.data,
      };
    } catch (error) {
      console.error('Error obteniendo métodos de pago:', error);
      return {
        success: false,
        error: 'No se pudieron obtener los métodos de pago',
      };
    }
  }

  /**
   * Obtener la clave pública (para el frontend)
   */
  getPublicKey() {
    // La clave pública debe ser diferente del access token
    // y debe estar configurada en las variables de entorno
    return this.useSandbox 
      ? process.env.VITE_MERCADOPAGO_PUBLIC_KEY_TEST
      : process.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  }

  /**
   * Reembolsar un pago
   */
  async refundPayment(paymentId, amount = null) {
    try {
      const refundData = amount ? { amount: parseFloat(amount) } : {};
      const response = await this.client.post(
        `/v1/payments/${paymentId}/refunds`,
        refundData
      );

      return {
        success: true,
        refund: response.data,
      };
    } catch (error) {
      console.error('Error reembolsando pago:', error);
      return {
        success: false,
        error: 'No se pudo procesar el reembolso',
      };
    }
  }

  /**
   * Verificar estado del pago
   */
  static getPaymentStatusMessage(status, statusDetail) {
    const statusMessages = {
      approved: {
        accredited: 'Pago aprobado y acreditado',
        default: 'Pago aprobado',
      },
      pending: {
        pending_contingency: 'Pago en revisión',
        pending_review_manual: 'Pago en revisión manual',
        default: 'Pago pendiente',
      },
      rejected: {
        cc_rejected_bad_filled_card_number: 'Número de tarjeta incorrecto',
        cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta',
        cc_rejected_bad_filled_other: 'Datos incorrectos',
        cc_rejected_bad_filled_security_code: 'Código de seguridad incorrecto',
        cc_rejected_blacklist: 'Tarjeta en lista negra',
        cc_rejected_call_for_authorize: 'Debes autorizar el pago con tu banco',
        cc_rejected_card_disabled: 'Tarjeta deshabilitada',
        cc_rejected_duplicated_payment: 'Pago duplicado',
        cc_rejected_high_risk: 'Pago rechazado por alto riesgo',
        cc_rejected_insufficient_amount: 'Fondos insuficientes',
        cc_rejected_invalid_installments: 'Cuotas no válidas',
        cc_rejected_max_attempts: 'Máximo de intentos alcanzado',
        cc_rejected_other_reason: 'Pago rechazado',
        default: 'Pago rechazado',
      },
    };

    return statusMessages[status]?.[statusDetail] || statusMessages[status]?.default || 'Estado desconocido';
  }
}

// Exportar instancia singleton
let mercadoPagoInstance = null;

export const initMercadoPago = (accessToken, useSandbox = false) => {
  mercadoPagoInstance = new MercadoPagoService(accessToken, useSandbox);
  return mercadoPagoInstance;
};

export const getMercadoPago = () => {
  if (!mercadoPagoInstance) {
    throw new Error('MercadoPago no inicializado. Llama a initMercadoPago primero.');
  }
  return mercadoPagoInstance;
};

export default MercadoPagoService;
