import { useState } from "react";
import { calculateShippingCost, calculateFreeShippingProgress, formatWeightInfo } from "../utils/shippingUtils";
import SHIPPING_CONFIG from "../config/shippingConfig";

export default function ShippingCalculator({ cart, subtotal, onShippingCalculated }) {
  const [postalCode, setPostalCode] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [error, setError] = useState("");

  const calculateShipping = async () => {
    if (!postalCode || postalCode.length < 4) {
      setError("Ingresa un código postal válido (mínimo 4 dígitos)");
      return;
    }

    setCalculating(true);
    setError("");

    // DEBUG: Ver información detallada del carrito
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 CALCULANDO ENVÍO - DEBUG INFO");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 CARRITO COMPLETO:", cart);
    console.log("📍 CP Destino:", postalCode);
    console.log("💰 Subtotal:", subtotal);
    console.log("\n📊 DETALLE POR PRODUCTO:");
    
    cart.forEach((item, index) => {
      console.log(`\n--- Producto ${index + 1}: ${item.title} ---`);
      console.log("  ID:", item.id);
      console.log("  Cantidad:", item.quantity);
      console.log("  🏋️ Peso configurado:");
      console.log("    • item.weight:", item.weight);
      console.log("    • item.peso:", item.peso);
      console.log("    • Peso usado:", parseFloat(item.weight) || parseFloat(item.peso) || 0.5, "kg");
      console.log("  📏 Dimensiones configuradas:");
      console.log("    • Largo (length/largo):", item.length || item.largo || "NO DEFINIDO");
      console.log("    • Ancho (width/ancho):", item.width || item.ancho || "NO DEFINIDO");
      console.log("    • Alto (height/alto):", item.height || item.alto || "NO DEFINIDO");
      
      // Calcular para este item
      const itemWeight = parseFloat(item.weight) || parseFloat(item.peso) || 0.5;
      const itemLength = parseFloat(item.length) || parseFloat(item.largo) || 30;
      const itemWidth = parseFloat(item.width) || parseFloat(item.ancho) || 20;
      const itemHeight = parseFloat(item.height) || parseFloat(item.alto) || 15;
      const volume = itemLength * itemWidth * itemHeight;
      const volumetricWeight = volume / 5000;
      
      console.log("  ✅ Valores finales usados:");
      console.log("    • Peso real:", itemWeight, "kg x", item.quantity, "=", itemWeight * item.quantity, "kg");
      console.log("    • Dimensiones:", itemLength, "×", itemWidth, "×", itemHeight, "cm");
      console.log("    • Volumen:", volume.toFixed(0), "cm³");
      console.log("    • Peso volumétrico:", volumetricWeight.toFixed(2), "kg x", item.quantity, "=", (volumetricWeight * item.quantity).toFixed(2), "kg");
      console.log("    • Se cobra por:", volumetricWeight > itemWeight ? "VOLUMEN ⚠️" : "PESO REAL ✅");
    });
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Simulación de delay de API (remover en producción si usas API real)
    setTimeout(() => {
      try {
        // Calcular envío usando peso y dimensiones reales
        const shipping = calculateShippingCost(cart, postalCode, subtotal);
        
        console.log("✅ RESULTADO DEL CÁLCULO:");
        console.log("  Peso real total:", shipping.weight.realWeight.toFixed(2), "kg");
        console.log("  Peso volumétrico total:", shipping.weight.volumetricWeight.toFixed(2), "kg");
        console.log("  Peso facturable:", shipping.weight.chargeableWeight.toFixed(2), "kg");
        console.log("  Cobra por:", shipping.weight.chargeByVolume ? "VOLUMEN" : "PESO REAL");
        console.log("  Zona:", shipping.zone.name);
        console.log("  Costo total:", "$" + shipping.total.toFixed(2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        setShippingInfo(shipping);
        setCalculating(false);

        // Callback para actualizar el componente padre
        if (onShippingCalculated) {
          onShippingCalculated(shipping);
        }
      } catch (err) {
        console.error("❌ ERROR EN CÁLCULO:", err);
        setError(err.message);
        setCalculating(false);
      }
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      calculateShipping();
    }
  };

  const freeShippingProgress = calculateFreeShippingProgress(subtotal);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <i className="fa-solid fa-truck text-2xl text-blue-600"></i>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">Calcular Envío</h3>
          <p className="text-xs text-gray-600">
            Desde {SHIPPING_CONFIG.originCity} (CP {SHIPPING_CONFIG.originPostalCode})
          </p>
        </div>
      </div>

      {/* Input de código postal */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código Postal Destino
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleKeyPress}
              placeholder="Ej: 1000"
              maxLength="8"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-lg font-semibold"
            />
          </div>
          <button
            onClick={calculateShipping}
            disabled={calculating}
            className="mt-7 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Resultado del cálculo */}
        {shippingInfo && !error && (
          <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md animate-fade-in space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-semibold mb-1">
                  <i className="fa-solid fa-map-marker-alt text-blue-600 mr-2"></i>
                  {shippingInfo.origin.city} → {shippingInfo.destination.zone}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {shippingInfo.method}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <i className="fa-solid fa-clock text-gray-500 mr-2"></i>
                  Llega en {shippingInfo.deliveryDays}
                </p>
              </div>
              <div className="text-right">
                {shippingInfo.isFree ? (
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl">
                    <p className="text-xs font-semibold">Envío</p>
                    <p className="text-2xl font-bold">GRATIS</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Costo de envío</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${shippingInfo.total.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Desglose de costos (expandible) */}
            {!shippingInfo.isFree && (
              <details className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-blue-600">
                  Ver desglose de costos
                </summary>
                <div className="mt-2 space-y-1 pl-2">
                  <div className="flex justify-between">
                    <span>📦 Peso facturable:</span>
                    <span className="font-semibold">{formatWeightInfo(shippingInfo.weight)}</span>
                  </div>
                  {shippingInfo.weight.chargeByVolume && (
                    <div className="text-amber-600 text-[10px] mb-1">
                      ⚠️ Se cobra por volumen (peso real: {shippingInfo.weight.realWeight.toFixed(2)}kg)
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Costo base ({shippingInfo.zone.name}):</span>
                    <span className="font-semibold">${shippingInfo.breakdown.base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Por peso ({shippingInfo.zone.costPerKg}/kg):</span>
                    <span className="font-semibold">${shippingInfo.breakdown.weight.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seguro ({(SHIPPING_CONFIG.surcharges.insurance * 100).toFixed(0)}%):</span>
                    <span className="font-semibold">${shippingInfo.breakdown.insurance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Embalaje:</span>
                    <span className="font-semibold">${shippingInfo.breakdown.packaging.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manipulación:</span>
                    <span className="font-semibold">${shippingInfo.breakdown.handling.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${shippingInfo.total.toFixed(2)}</span>
                  </div>
                </div>
              </details>
            )}

            {/* Progreso para envío gratis */}
            {!freeShippingProgress.qualifies && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600">
                    Envío gratis en compras mayores a ${SHIPPING_CONFIG.freeShippingThreshold.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-blue-600">
                    {freeShippingProgress.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Te faltan <span className="font-bold text-green-600">${freeShippingProgress.remaining.toFixed(2)}</span> para envío gratis
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info adicional */}
        <div className="bg-blue-100/50 rounded-xl p-3 text-xs text-gray-700">
          <p className="flex items-start gap-2">
            <i className="fa-solid fa-info-circle text-blue-600 mt-0.5"></i>
            <span>
              <span className="font-semibold">Cálculo basado en peso y dimensiones reales de productos.</span>
              {' '}El costo puede variar según disponibilidad de transportista.
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        details summary::-webkit-details-marker {
          display: none;
        }

        details summary::before {
          content: '▶ ';
          font-size: 10px;
          margin-right: 4px;
        }

        details[open] summary::before {
          content: '▼ ';
        }
      `}</style>
    </div>
  );
}