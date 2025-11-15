import React, { useState, useEffect } from 'react';
// Importamos las funciones y componentes específicos del SDK de React
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'; 

// ⚠️ Usamos la clave pública de MP aquí
// Reemplaza con tu clave pública real (idealmente, cargada desde un .env en React)
const MP_PUBLIC_KEY = "APP_USR-7ab12204-7451-46e3-81a3-18889c426dbd"; 

// 1. Inicializa el SDK fuera del componente
// Esto asegura que se configure una sola vez al cargar la app
try {
    initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
} catch (error) {
    console.error("Error al inicializar Mercado Pago SDK:", error);
}

function MercadoPagoButton({ orderData }) {
    const [preferenceId, setPreferenceId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Debemos asegurarnos de que orderData exista y tenga ítems
        if (!orderData || orderData.items.length === 0) {
            setError("No hay datos de la orden para procesar.");
            setIsLoading(false);
            return;
        }

        const createPreference = async () => {
            try {
                // 2. Llamamos al endpoint de Express
                const response = await fetch('http://localhost:8080/api/payment/create_preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderData }),
                });

                if (!response.ok) {
                    // Capturamos el error si la respuesta HTTP no es exitosa
                    const errorDetails = await response.json();
                    throw new Error(errorDetails.error || "Error desconocido al crear la preferencia.");
                }

                const data = await response.json();
                
                if (data.preferenceId) {
                    setPreferenceId(data.preferenceId);
                } else {
                    throw new Error("El servidor no devolvió un preferenceId válido.");
                }
                
                setIsLoading(false);

            } catch (err) {
                console.error("Error en la creación de la preferencia:", err);
                setError(`Error de pago: ${err.message}`);
                setIsLoading(false);
            }
        };

        createPreference();
    }, [orderData]); 
    // Usamos orderData como dependencia para que se recree la preferencia si cambian los ítems/precios.

    if (isLoading) {
        return (
            <div className="w-full py-4 text-center bg-blue-100 text-blue-600 rounded-xl font-semibold">
                Cargando opciones de pago...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full py-4 text-center bg-red-100 text-red-600 rounded-xl font-semibold">
                {error}
            </div>
        );
    }
    
    // 3. Renderizar el componente Wallet con el ID de la preferencia
    return (
        <div className="w-full" onClick={() => console.log("Iniciando pago con MP...")}>
            <Wallet 
                initialization={{ preferenceId: preferenceId }} 
                // Opcional: Define dónde se va a renderizar (por defecto: botón)
                customization={{ 
                    texts: { 
                        action: 'pay', 
                        value: 'Pagar ahora' 
                    } 
                }}
            />
        </div>
    );
}

export default MercadoPagoButton;