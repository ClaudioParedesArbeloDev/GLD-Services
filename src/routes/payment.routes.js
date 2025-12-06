import express from 'express';

import { MercadoPagoConfig, Preference } from 'mercadopago'; 

const router = express.Router();


const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN, 
    options: { timeout: 5000 },
});

const preferenceAPI = new Preference(client);



router.post("/create_preference", async (req, res) => {
    const { orderData } = req.body; 


    let preferenceBody = {
        
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
        
        const response = await preferenceAPI.create(preferenceBody);
        
       
        res.status(200).json({ preferenceId: response.id });

    } catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(500).json({ error: error.message });
    }
});




router.post('/webhook', async (req, res) => {
   
    const type = req.query.topic; 
    const resourceId = req.query.id; 

    if (type === 'payment') {
        try {
           
            console.log(`Webhook recibido. Tipo: ${type}, ID de Recurso: ${resourceId}`);
            
        } catch (err) {
            console.error('Error al procesar Webhook:', err);
        }
    }

    
    res.status(200).send('OK'); 
});


export default router;