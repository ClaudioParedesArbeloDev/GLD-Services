import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'; 
import CurrentURL from "../api/url";


const MP_PUBLIC_KEY = "TEST-7ab12204-7451-46e3-81a3-18889c426dbd";

let mpInitialized = false;

if (!mpInitialized) {
  try {
    initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
    mpInitialized = true;
    console.log("✅ MP SDK inicializado");
  } catch (error) {
    console.error("❌ Error al inicializar MP:", error);
  }
}

export default function MercadoPagoButton({ orderData }) {
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderData?.items || orderData.items.length === 0) {
      setError("No hay productos en la orden.");
      setIsLoading(false);
      return;
    }

    if (!orderData.email) {
      setError("No se pudo obtener el email del usuario.");
      setIsLoading(false);
      return;
    }

    const createPreference = async () => {
      try {
        console.log("📤 Creando preferencia MP:", orderData);

        const response = await fetch(`${CurrentURL}/api/payment/create_preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderData }),
        });

        if (!response.ok) {
          let errorMessage = `Error HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            console.error("❌ Error del servidor:", errorData);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            const textError = await response.text();
            console.error("❌ Respuesta:", textError);
            errorMessage = textError || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("✅ Preferencia creada:", data);

        if (data.preferenceId) {
          setPreferenceId(data.preferenceId);
          setIsLoading(false);
        } else {
          throw new Error("No se recibió preferenceId");
        }

      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message || "Error al procesar el pago");
        setIsLoading(false);
      }
    };

    createPreference();
  }, [orderData]);

  if (isLoading) {
    return (
      <div className="w-full py-4 bg-linear-to-r from-blue-100 to-indigo-100 rounded-xl border-2 border-blue-300">
        <div className="flex items-center justify-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i>
          <span className="font-semibold text-blue-700">
            Preparando pago...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    const isCredentialError = error.includes("UNAUTHORIZED") || error.includes("403") || error.includes("401");
    const isConnectionError = error.includes("fetch") || error.includes("Network");

    return (
      <div className="w-full py-4 bg-linear-to-r from-red-100 to-red-200 rounded-xl border-2 border-red-300">
        <div className="text-center p-4">
          <i className="fa-solid fa-exclamation-circle text-4xl text-red-600 mb-3"></i>
          <p className="font-bold text-red-800 mb-2 text-lg">Error al procesar el pago</p>
          
          <div className="bg-red-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-red-700 font-mono break-word">{error}</p>
          </div>
          
          {isCredentialError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 text-left">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                🔑 Error de credenciales
              </p>
              <ul className="text-xs text-yellow-700 space-y-1 ml-4 list-disc">
                <li>Estás usando credenciales de <strong>PRODUCCIÓN</strong></li>
                <li><strong>SOLUCIÓN:</strong> Cambiar a credenciales de <strong>TEST</strong></li>
                <li>1. Ir a Panel de Desarrolladores de MercadoPago</li>
                <li>2. Obtener credenciales de TEST (TEST-xxxxx)</li>
                <li>3. Actualizar MP_PUBLIC_KEY en frontend</li>
                <li>4. Actualizar ACCESS_TOKEN en backend (.env)</li>
              </ul>
            </div>
          )}

          {isConnectionError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 text-left">
              <p className="text-sm text-yellow-800 font-semibold mb-1">
                🌐 Error de conexión
              </p>
              <ul className="text-xs text-yellow-700 space-y-1 ml-4 list-disc">
                <li>Verificá que el backend esté corriendo</li>
                <li>Puerto: <strong>8080</strong></li>
                <li>URL: <code className="bg-yellow-100 px-1">{CurrentURL}</code></li>
              </ul>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            <i className="fa-solid fa-rotate-right mr-2"></i>
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-3 border-2 border-blue-200">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-shield-halved text-3xl text-blue-600"></i>
          <div className="flex-1">
            <p className="font-bold text-blue-800">Pago 100% Seguro</p>
            <p className="text-sm text-blue-600">Procesado por Mercado Pago</p>
          </div>
        </div>
      </div>

      <Wallet 
        initialization={{ preferenceId: preferenceId }}
        customization={{ texts: { valueProp: 'security_safety' } }}
      />

      <div className="mt-3 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
        <i className="fa-solid fa-lock"></i>
        <span>Tus datos están protegidos</span>
      </div>

      {MP_PUBLIC_KEY.startsWith('TEST-') && (
        <div className="mt-2 text-xs text-amber-600 text-center">
          ⚠️ Modo de prueba - Usar tarjetas de test
        </div>
      )}
    </div>
  );
}