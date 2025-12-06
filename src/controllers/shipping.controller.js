import zipNovaService, { ZIPNOVA_CONFIG } from '../services/Zipnovaservice.js';


export const calculateShipping = async (req, res) => {
  try {
    const { items, destinationZipCode, destinationCity, destinationState } = req.body;

   
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un carrito con productos'
      });
    }

    if (!destinationZipCode) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el código postal de destino'
      });
    }

 
    if (!zipNovaService.validateZipCode(destinationZipCode)) {
      return res.status(400).json({
        success: false,
        error: 'Código postal inválido. Formato esperado: 2000 o S2000AAA'
      });
    }

   
    const subtotal = items.reduce((sum, item) => {
      const price = item.final_price || item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);

    console.log('📦 Calculando envío:', {
      items: items.length,
      destinationZipCode,
      destinationCity,
      destinationState,
      subtotal
    });

    const shippingResult = await zipNovaService.quoteShipping({
      items,
      destinationZipCode,
      destinationCity,
      destinationState,
      subtotal
    });

   
    const freeShippingProgress = {
      threshold: ZIPNOVA_CONFIG.FREE_SHIPPING_THRESHOLD,
      current: subtotal,
      remaining: Math.max(0, ZIPNOVA_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal),
      percentage: Math.min(100, (subtotal / ZIPNOVA_CONFIG.FREE_SHIPPING_THRESHOLD) * 100),
      qualifies: subtotal >= ZIPNOVA_CONFIG.FREE_SHIPPING_THRESHOLD
    };

   
    return res.status(200).json({
      success: true,
      ...shippingResult,
      freeShippingProgress
    });

  } catch (error) {
    console.error('❌ Error calculando envío:', error);
    
    // Determinar el código de error apropiado
    let statusCode = 500;
    let errorMessage = error.message || 'Error al calcular el envío';
    
    if (error.message.includes('autenticación')) {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Servicio de envíos temporalmente no disponible';
    } else if (error.message.includes('Destino no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('inválido')) {
      statusCode = 422;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


export const getShippingConfig = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      config: {
        freeShippingThreshold: ZIPNOVA_CONFIG.FREE_SHIPPING_THRESHOLD,
        origin: {
          account_id: ZIPNOVA_CONFIG.ACCOUNT_ID,
          origin_id: ZIPNOVA_CONFIG.ORIGIN_ID
        },
        provider: 'Zipnova'
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener configuración de envíos'
    });
  }
};


export const validateZipCode = (req, res) => {
  try {
    const { zipCode } = req.body;

    if (!zipCode) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Se requiere el código postal'
      });
    }

    const isValid = zipNovaService.validateZipCode(zipCode);

    return res.status(200).json({
      success: true,
      valid: isValid,
      zipCode: zipCode
    });

  } catch (error) {
    console.error('❌ Error validando código postal:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al validar el código postal'
    });
  }
};

export default {
  calculateShipping,
  getShippingConfig,
  validateZipCode
};