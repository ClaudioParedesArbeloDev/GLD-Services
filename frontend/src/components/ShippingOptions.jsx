// ShippingOptions.jsx - Componente para seleccionar opciones de envío
// Coloca este archivo en tu carpeta de components

import { useState } from 'react';

export default function ShippingOptions({ shippingData, onSelectOption }) {
  const [selectedOption, setSelectedOption] = useState(null);

  if (!shippingData || !shippingData.options) {
    return null;
  }

  const handleSelectOption = (option, index) => {
    setSelectedOption(index);
    onSelectOption(option);
  };

  // Si es envío gratis
  if (shippingData.isFree) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-gift text-3xl text-white"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-800 flex items-center gap-2">
              ¡Envío GRATIS! 
              <i className="fa-solid fa-party-horn"></i>
            </h3>
            <p className="text-green-700 mt-1">
              Tu compra califica para envío sin costo
            </p>
            <p className="text-sm text-green-600 mt-2">
              <i className="fa-solid fa-clock mr-2"></i>
              Tiempo estimado: 5-10 días hábiles
            </p>
          </div>
          <div className="text-4xl font-bold text-green-600">
            $0
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Información del peso */}
      {shippingData.weight && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-weight-scale text-blue-600"></i>
              <span className="text-blue-800 font-semibold">Peso del envío:</span>
            </div>
            <span className="text-blue-700">
              {shippingData.weight.chargeable.toFixed(2)} kg
              {shippingData.weight.chargeByVolume && (
                <span className="text-xs ml-1">(volumétrico)</span>
              )}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Desde {shippingData.origin.city}, {shippingData.origin.province} → 
            Zona: <span className="font-semibold">{shippingData.zone}</span>
          </p>
        </div>
      )}

      {/* Título */}
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <i className="fa-solid fa-truck text-blue-600"></i>
        Selecciona el método de envío:
      </h3>

      {/* Opciones de envío */}
      <div className="space-y-3">
        {shippingData.options.map((option, index) => (
          <label
            key={index}
            className={`block p-5 border-2 rounded-xl cursor-pointer transition-all ${
              selectedOption === index
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="shippingOption"
                checked={selectedOption === index}
                onChange={() => handleSelectOption(option, index)}
                className="mt-1 w-5 h-5 text-blue-600"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      {option.correo} - {option.tipo}
                      {option.recomendado && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                          Recomendado
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.descripcion || `Envío por ${option.correo}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ${option.precio.toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <i className="fa-solid fa-clock text-gray-400"></i>
                    {option.tiempo}
                  </p>
                  
                  {option.tipo === 'Sucursal' && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <i className="fa-solid fa-store"></i>
                      Retirá en sucursal
                    </p>
                  )}
                  
                  {option.tipo === 'Domicilio' && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <i className="fa-solid fa-home"></i>
                      Envío a tu domicilio
                    </p>
                  )}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Nota de estimación */}
      {shippingData.estimatedOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 flex items-start gap-2">
            <i className="fa-solid fa-info-circle mt-0.5"></i>
            <span>
              <strong>Nota:</strong> Los costos mostrados son estimados. 
              El valor final puede variar según el peso exacto y las dimensiones del paquete.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}