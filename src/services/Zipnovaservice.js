import axios from 'axios';

const ZIPNOVA_CONFIG = {
  API_URL: 'https://api.zipnova.com.ar/v2',
  API_TOKEN: '4e98405f-d314-427d-bd51-b3ca67c9c882',
  API_SECRET: 'c8bcec0f-4573-41cf-a49c-5225f0856968',
  ACCOUNT_ID: '20175',
  ORIGIN_ID: '373253',
  FREE_SHIPPING_THRESHOLD: 100000
};

class ZipNovaService {
  constructor() {

    const auth = Buffer.from(`${ZIPNOVA_CONFIG.API_TOKEN}:${ZIPNOVA_CONFIG.API_SECRET}`).toString('base64');
    
    this.client = axios.create({
      baseURL: ZIPNOVA_CONFIG.API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      timeout: 15000
    });


    this.client.interceptors.request.use(request => {
      console.log('📤 Zipnova Request:', {
        url: request.url,
        method: request.method,
        data: request.data
      });
      return request;
    });

    this.client.interceptors.response.use(
      response => {
        console.log('✅ Zipnova Response:', response.data);
        return response;
      },
      error => {
        console.error('❌ Zipnova Error:', {
          status: error.response?.status,
          data: error.response?.data,
          errors: error.response?.data?.errors, 
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  calculateTotalWeight(items) {
    return items.reduce((total, item) => {
      const weightInGrams = parseFloat(item.peso || item.weight) || 500;
      return total + (weightInGrams * item.quantity);
    }, 0);
  }

  /**
   * Cotiza envío con ZipNova API v2
   * @param {Object} params 
   * @returns {Promise<Object>} 
   */
  async quoteShipping(params) {
    const {
      items,
      destinationZipCode,
      destinationCity = '',
      destinationState = '',
      subtotal = 0
    } = params;

    try {
      
      if (subtotal >= ZIPNOVA_CONFIG.FREE_SHIPPING_THRESHOLD) {
        return {
          success: true,
          isFree: true,
          cost: 0,
          service: 'Envío GRATIS',
          deliveryTime: '5-10 días hábiles',
          options: [{
            carrier: 'ENVÍO GRATIS',
            service: 'A domicilio',
            cost: 0,
            deliveryDays: '5-10',
            recommended: true
          }],
          origin: {
            id: ZIPNOVA_CONFIG.ORIGIN_ID,
            account_id: ZIPNOVA_CONFIG.ACCOUNT_ID
          },
          destination: {
            zipCode: destinationZipCode,
            city: destinationCity,
            state: destinationState
          }
        };
      }

     
      const zipnovaItems = [];
      items.forEach(item => {
        const quantity = item.quantity || 1;
        
        
        for (let i = 0; i < quantity; i++) {
          zipnovaItems.push({
            sku: `${item.id || 'PRODUCT'}-${i + 1}`,
            weight: parseFloat(item.peso || item.weight) || 500, 
            height: parseFloat(item.alto || item.height) || 15,  
            width: parseFloat(item.ancho || item.width) || 20, 
            length: parseFloat(item.largo || item.length) || 30,
            description: item.title || 'Producto',
            classification_id: 1 
          });
        }
      });

      console.log('📦 Zipnova - Preparando cotización:', {
        account_id: ZIPNOVA_CONFIG.ACCOUNT_ID,
        origin_id: ZIPNOVA_CONFIG.ORIGIN_ID,
        items_count: zipnovaItems.length,
        destination: destinationZipCode,
        declared_value: subtotal
      });

      
      const destination = {
        zipcode: destinationZipCode
      };

      
      if (destinationCity) {
        destination.city = destinationCity;
      }

      if (destinationState) {
        destination.state = destinationState;
      } else if (destinationCity) {
        
        destination.state = destinationCity;
      }

      
      const requestBody = {
        account_id: ZIPNOVA_CONFIG.ACCOUNT_ID,
        origin_id: ZIPNOVA_CONFIG.ORIGIN_ID,
        declared_value: Math.round(subtotal), 
        items: zipnovaItems,
        destination: destination
      };

      const response = await this.client.post('/shipments/quote', requestBody);

      
      const data = response.data;

      if (!data || !data.all_results || data.all_results.length === 0) {
        throw new Error('No se encontraron opciones de envío disponibles para este destino');
      }

      
      const options = data.all_results.map(result => {
      
        const carrierName = result.carrier?.name || 'Transportista';
        
      
        const serviceTypeName = result.service_type?.name || 'Estándar';
        
       
        const deliveryTime = result.delivery_time?.max_delivery_date 
          ? `${result.delivery_time.min_delivery_time || 1}-${result.delivery_time.max_delivery_time || 7} días`
          : 'N/A';
        
        
        const cost = parseFloat(result.amounts?.price_incl_tax || result.amounts?.price || 0);
        
        return {
          carrier: carrierName,
          service: serviceTypeName,
          cost: cost,
          deliveryDays: deliveryTime,
          logistic_type: result.logistic_type, 
          service_type: result.service_type?.code, 
          recommended: result.tags?.includes('recommended') || false,
          
          zipnovaData: {
            carrier_id: result.carrier?.id,
            service_type_id: result.service_type?.id,
            rate_id: result.rate?.id
          }
        };
      });

      
      options.sort((a, b) => a.cost - b.cost);

     
      const selectedOption = options.find(o => o.recommended) || options[0];

      return {
        success: true,
        isFree: false,
        cost: selectedOption.cost,
        service: `${selectedOption.carrier} - ${selectedOption.service}`,
        deliveryTime: selectedOption.deliveryDays,
        options: options,
        weight: {
          value: this.calculateTotalWeight(items),
          unit: 'g'
        },
        origin: {
          id: ZIPNOVA_CONFIG.ORIGIN_ID,
          account_id: ZIPNOVA_CONFIG.ACCOUNT_ID,
          name: data.origin?.name,
          location: data.origin?.geolocation
        },
        destination: {
          zipCode: destinationZipCode,
          city: data.destination?.city || destinationCity,
          state: data.destination?.state || destinationState,
          location: data.destination?.geolocation
        },
        provider: 'Zipnova',
        
        zipnovaQuoteData: {
          packages: data.packages,
          declared_value: data.declared_value
        }
      };

    } catch (error) {
      console.error('❌ Error al cotizar con Zipnova:', error);
      
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error('🔍 Detalles del error de Zipnova:', {
          status,
          message: errorData?.message,
          errors: errorData?.errors,
          fullData: errorData
        });
        
        let errorMessage = 'Error al cotizar con Zipnova';
        
        if (status === 401 || status === 403) {
          errorMessage = 'Error de autenticación con Zipnova. Verificar credenciales.';
        } else if (status === 404) {
          errorMessage = 'Destino no encontrado. Verificar código postal.';
        } else if (status === 422 || status === 400) {
          if (errorData?.errors) {
            const errorDetails = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
            errorMessage = `Datos inválidos: ${errorDetails}`;
          } else {
            errorMessage = errorData.message || 'Datos inválidos en la solicitud.';
          }
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }
      
      throw new Error(error.message || 'Error de conexión con el servicio de envíos');
    }
  }

  /**
   * Valida un código postal argentino
   */
  validateZipCode(zipCode) {
    if (!zipCode) return false;
    const cleanZip = String(zipCode).trim().replace(/\s/g, '');
    const oldFormat = /^\d{4}$/;
    const newFormat = /^[A-Z]\d{4}[A-Z]{3}$/i;
    return oldFormat.test(cleanZip) || newFormat.test(cleanZip);
  }
}


const zipNovaService = new ZipNovaService();

export default zipNovaService;
export { ZIPNOVA_CONFIG };