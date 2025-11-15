import express from 'express';
// Importamos las clases necesarias para la V2
import { MercadoPagoConfig, Preference } from 'mercadopago'; 

const router = express.Router();

// 1. Inicialización del Cliente (similar a configure de la V1)
// Usamos process.env para obtener la clave secreta
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN, // Clave Secreta
    options: { timeout: 5000 },
});

// Inicializamos la API de Preferencias
const preferenceAPI = new Preference(client);


// --- Endpoint para crear la Preferencia de Pago ---
router.post("/create_preference", async (req, res) => {
    const { orderData } = req.body; 

    // ⚠️ ATENCIÓN: El objeto body para create() es ligeramente diferente en la V2.
    // Usamos 'items', 'back_urls', etc., directamente dentro del objeto body.
    let preferenceBody = {
        // La V2 usa la propiedad body para envolver la petición
        body: {
            items: orderData.items, 
            payer: {
                email: orderData.email || "test_user@example.com",
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/success`, 
                failure: `${process.env.FRONTEND_URL}/failure`, 
                pending: `${process.env.FRONTEND_URL}/pending`,
            },
            auto_return: "approved",
            external_reference: orderData.external_reference || `ORDEN-${Date.now()}`,
        }
    };

    try {
        // La V2 utiliza el método create({ body: preferenceBody })
        const response = await preferenceAPI.create(preferenceBody);
        
        // Enviamos el ID de la preferencia al frontend
        // El ID de la preferencia se encuentra directamente en el objeto response
        res.status(200).json({ preferenceId: response.id });

    } catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(500).json({ error: error.message });
    }
});


// --- Endpoint de Webhook (Requiere el SDK V2 para verificar) ---
// NOTA: Para obtener los detalles del pago en la V2, se usaría la clase 'Payment'

router.post('/webhook', async (req, res) => {
    // La V2 usa req.query.topic = 'payment' y req.query.id (para la notificación)
    const type = req.query.topic; 
    const resourceId = req.query.id; 

    if (type === 'payment') {
        try {
            // Importar y usar la clase Payment (si es necesario)
            // const paymentAPI = new Payment(client);
            // const paymentData = await paymentAPI.get({ id: resourceId }); 
            
            // Para mantener la simplicidad, si solo quieres confirmar la recepción:
            console.log(`Webhook recibido. Tipo: ${type}, ID de Recurso: ${resourceId}`);
            
            // ⚠️ Lógica de actualización de DB aquí
            
        } catch (err) {
            console.error('Error al procesar Webhook:', err);
        }
    }

    // Es crucial responder 200 OK
    res.status(200).send('OK'); 
});


export default router;