import { useState } from "react";
import * as shippingAPI from "../services/shippingAPI";

export default function ShippingCalculator({ cart, subtotal, onShippingCalculated }) {
  const [postalCode, setPostalCode] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [shippingData, setShippingData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState("");

  const handleCalculateShipping = async () => {

    if (!shippingAPI.validateZipCode(postalCode)) {
      setError("Ingresá un código postal válido (Ej: 2000 o S2000AAA)");
      return;
    }

    if (!cart || cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    setCalculating(true);
    setError("");
    setShippingData(null);
    setSelectedOption(null);

    try {
      const response = await shippingAPI.calculateShipping(cart, { zipCode: postalCode });

      console.log("📦 Respuesta completa de Zipnova:", response);

      if (response.success) {
 
        const normalizedOptions = normalizeShippingOptions(response);
        
        const shippingInfo = {
          ...response,
          normalizedOptions
        };

        setShippingData(shippingInfo);
        
 
        if (normalizedOptions.length > 0) {
          handleSelectOption(normalizedOptions[0], shippingInfo);
        }
      } else {
        throw new Error(response.error || "No se pudieron obtener opciones de envío");
      }

    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Error al calcular el envío");
    } finally {
      setCalculating(false);
    }
  };

 
  const normalizeShippingOptions = (response) => {
    if (!response) return [];

 
    if (response.isFree) {
      return [{
        carrier: "ENVÍO GRATIS",
        service: "A domicilio",
        cost: 0,
        deliveryDays: response.deliveryTime || "5-10 días hábiles",
        recommended: true,
        isFree: true
      }];
    }

 
    if (response.options && Array.isArray(response.options) && response.options.length > 0) {
      return response.options.map((opt, index) => ({
        carrier: opt.carrier || opt.correo || "Transportista",
        service: opt.service || opt.tipo || "Estándar",
        cost: parseFloat(opt.cost || opt.precio || 0),
        deliveryDays: opt.deliveryDays || opt.tiempo || "N/A",
        recommended: opt.recommended || opt.recomendado || index === 0,
        isFree: (opt.cost || opt.precio) === 0
      }));
    }

 
    return [{
      carrier: response.service?.split(' - ')[0] || "Estimación",
      service: response.service?.split(' - ')[1] || "Estándar",
      cost: parseFloat(response.cost || 0),
      deliveryDays: response.deliveryTime || "N/A",
      recommended: true,
      isFree: response.cost === 0,
      estimatedOnly: response.estimatedOnly || response.fallback || false
    }];
  };

  const handleSelectOption = (option, shippingInfo = shippingData) => {
    setSelectedOption(option);
    
    if (onShippingCalculated) {
      onShippingCalculated({
        method: `${option.carrier} - ${option.service}`,
        cost: option.cost,
        total: option.cost,
        deliveryDays: option.deliveryDays,
        destination: {
          zipCode: postalCode,
          zone: shippingInfo?.zone || shippingInfo?.destination?.zone || "Zona calculada"
        },
        weight: shippingInfo?.weight || {},
        isFree: option.isFree || option.cost === 0,
        estimatedOnly: option.estimatedOnly
      });
    }
  };

 
  const formatWeight = (grams) => {
    if (!grams) return "0.00";
    return (grams / 1000).toFixed(2);
  };

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <i className="fa-solid fa-truck text-2xl text-blue-600"></i>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">Calcular Envío</h3>
          <p className="text-xs text-gray-600">Desde Pérez, Santa Fe (CP 2121)</p>
        </div>
      </div>

      <div className="space-y-3">
 
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código Postal Destino
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => {
                setPostalCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyPress={(e) => e.key === "Enter" && handleCalculateShipping()}
              placeholder="Ej: 2000 o S2000AAA"
              maxLength="8"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-lg font-semibold uppercase"
            />
          </div>
          <button
            onClick={handleCalculateShipping}
            disabled={calculating}
            className="mt-7 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
          >
            {calculating ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-search"></i>
            )}
          </button>
        </div>

 
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg flex items-center gap-2">
            <i className="fa-solid fa-exclamation-circle"></i>
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

 
        {shippingData && shippingData.normalizedOptions && (
          <div className="space-y-3 animate-fade-in">
            {/* Info peso (si está disponible) */}
            {shippingData.weight && (shippingData.weight.realWeight || shippingData.weight.value) && (
              <div className="bg-white rounded-xl p-3 border border-gray-200 text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  {shippingData.weight.realWeight && (
                    <>
                      <div>
                        <span className="font-semibold">Real:</span>{" "}
                        {formatWeight(shippingData.weight.realWeight)} kg
                      </div>
                      <div>
                        <span className="font-semibold">Volumétrico:</span>{" "}
                        {formatWeight(shippingData.weight.volumetricWeight)} kg
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Facturable:</span>{" "}
                        <span className="text-blue-600 font-bold">
                          {formatWeight(shippingData.weight.chargeableWeight)} kg
                        </span>
                      </div>
                    </>
                  )}
                  {shippingData.weight.value && !shippingData.weight.realWeight && (
                    <div className="col-span-2">
                      <span className="font-semibold">Peso total:</span>{" "}
                      <span className="text-blue-600 font-bold">
                        {formatWeight(shippingData.weight.value)} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

 
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                {shippingData.normalizedOptions.length === 1 
                  ? "Opción de envío:" 
                  : "Opciones disponibles:"}
              </p>
              {shippingData.normalizedOptions.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedOption === option
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedOption === option}
                      onChange={() => handleSelectOption(option)}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800 flex items-center gap-2">
                            {option.carrier}
                            {option.service && (
                              <span className="text-sm font-normal text-gray-600">
                                - {option.service}
                              </span>
                            )}
                            {(option.recommended || index === 0) && !option.isFree && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                Recomendado
                              </span>
                            )}
                            {option.estimatedOnly && (
                              <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                Estimado
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <i className="fa-solid fa-clock text-gray-400 mr-1"></i>
                            Llega en {option.deliveryDays}
                          </p>
                        </div>
                        <div className="text-right">
                          {option.isFree || option.cost === 0 ? (
                            <div className="bg-linear-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg">
                              <p className="text-xs font-semibold">GRATIS</p>
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-blue-600">
                              ${option.cost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

 
            {shippingData.fallback && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-start gap-2">
                  <i className="fa-solid fa-exclamation-triangle mt-0.5"></i>
                  <span>
                    <strong>Cotización estimada:</strong> El servicio de cotización está temporalmente no disponible. 
                    El costo final se confirmará en el procesamiento del pedido.
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

 
        <div className="bg-blue-100/50 rounded-xl p-3 text-xs text-gray-700">
          <p className="flex items-start gap-2">
            <i className="fa-solid fa-info-circle text-blue-600 mt-0.5"></i>
            <span>Cálculo basado en peso y dimensiones reales. El costo puede variar según disponibilidad.</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}