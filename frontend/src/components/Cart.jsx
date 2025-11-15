import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import ShippingCalculator from "./ShippingCalculator";
import MercadoPagoButton from "./MercadoPagoButton"; // <--- Importado

export default function Cart() {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
  } = useCart();

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);

  const handleShippingCalculated = (shipping) => {
    // Asegura que tienes el costo de envío y la información
    setShippingCost(shipping.total || shipping.cost || 0);
    setShippingInfo(shipping);
  };

  const getTotal = () => {
    return getSubtotal() + shippingCost;
  };

  /**
   * 💡 Función para preparar el objeto de datos que Mercado Pago necesita.
   * Esto se enviará a tu endpoint /create_preference en Express.
   */
  const prepareOrderData = () => {
    // 1. Formatear los ítems del carrito
    const itemsMP = cart.map(item => ({
      title: item.title,
      unit_price: parseFloat(item.final_price.toFixed(2)), // Asegura que es float
      quantity: item.quantity,
      // Opcional: Agregar el ID o SKU
      id: item.id.toString(), 
    }));

    // 2. Si hay costo de envío, agrégalo como un ítem de servicio
    if (shippingCost > 0 && shippingInfo?.name) {
      itemsMP.push({
        title: `Costo de Envío (${shippingInfo.name})`,
        unit_price: parseFloat(shippingCost.toFixed(2)),
        quantity: 1,
        // Usar un ID distintivo para el envío
        id: "SHIPPING_COST", 
      });
    }

    // 3. Construir el objeto final de la orden
    // ⚠️ NOTA: Necesitarás capturar el email del usuario en un paso previo. 
    // Por ahora, usaremos un mock o una variable global de usuario.
    const orderData = {
      items: itemsMP,
      // El email es crucial para Mercado Pago
      email: "cliente_actual@gldservices.com", // ⬅️ DEBE VENIR DEL USUARIO LOGUEADO
      // Referencia externa para seguimiento en tu DB
      external_reference: `ORDEN-${Date.now()}`, 
      shipping_address: shippingInfo ? shippingInfo.address : null,
    };
    
    return orderData;
  };

  if (!isOpen) return null;

  // Determinar si podemos mostrar el botón de pago
  const canCheckout = cart.length > 0 && shippingInfo !== null;

  return (
    <>
      {/* Overlay y Sidebar (Sin cambios) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      ></div>

      <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header (Sin cambios) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-shopping-cart text-2xl"></i>
            <div>
              <h2 className="text-xl font-bold">Mi Carrito</h2>
              <p className="text-sm text-blue-100">
                {getTotalItems()} {getTotalItems() === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Contenido del carrito (Sin cambios en la lista de ítems) */}
        {cart.length === 0 ? (
          // ... Lógica de carrito vacío (sin cambios)
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-shopping-cart text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-600 mb-6">
              Agrega productos para comenzar tu compra
            </p>
            <button
              onClick={closeCart}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Seguir Comprando
            </button>
          </div>
        ) : (
          <>
            {/* Lista de productos (sin cambios) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-xl p-4 flex gap-4 hover:bg-gray-100 transition"
                >
                  {/* ... Contenido del item (sin cambios) */}
                  <Link
                    to={`/product/${item.id}`}
                    onClick={closeCart}
                    className="flex-shrink-0"
                  >
                    <img
                      // ... (Tu lógica de imagen)
                      src={
                        item.image_url ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%236B7280'%3ESin Imagen%3C/text%3E%3C/svg%3E"
                      }
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        console.log("❌ ERROR CARGANDO IMAGEN:", item.image_url);
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%236B7280'%3ESin Imagen%3C/svg%3E";
                      }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      onClick={closeCart}
                      className="font-semibold text-gray-800 hover:text-blue-600 transition block truncate mb-1"
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-lg font-bold text-blue-600">
                        ${item.final_price.toFixed(2)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-sm text-gray-400 line-through">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Controles de cantidad (sin cambios) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center"
                      >
                        <i className="fa-solid fa-minus text-xs"></i>
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white transition flex items-center justify-center"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>

                    {/* Advertencia de stock */}
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-exclamation-triangle"></i>
                        Stock máximo alcanzado
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con totales y botones (Modificaciones aquí) */}
            <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
              {/* Calculador de envío (sin cambios) */}
              <ShippingCalculator 
                cart={cart}
                subtotal={getSubtotal()} 
                onShippingCalculated={handleShippingCalculated}
              />

              {/* Resumen de costos (sin cambios) */}
              <div className="bg-white rounded-xl p-4 space-y-3 border-2 border-gray-200">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-base">
                  <span className="font-semibold text-gray-700">Subtotal:</span>
                  <span className="font-bold text-xl text-gray-800">
                    ${getSubtotal().toFixed(2)}
                  </span>
                </div>

                {/* Envío */}
                {shippingInfo && (
                  <div className="flex justify-between items-center text-base pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                      <i className="fa-solid fa-truck text-blue-600"></i>
                      Envío:
                    </span>
                    <span className={`font-bold text-xl ${shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {/* Total */}
                {shippingInfo && (
                  <div className="flex justify-between items-center text-lg pt-3 border-t-2 border-blue-200">
                    <span className="font-bold text-gray-800">Total:</span>
                    <span className="font-bold text-3xl text-blue-600">
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Mensaje condicional */}
              {!shippingInfo && (
                <p className="text-xs text-gray-600 text-center">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Calcula el envío para ver el total final y habilitar el pago.
                </p>
              )}

              {/* Botones de acción (MODIFICACIÓN) */}
              <div className="space-y-2">
                {/* 1. Si se puede pagar (carrito lleno Y envío calculado), 
                     mostramos el botón de Mercado Pago.
                */}
                {canCheckout ? (
                    <div onClick={closeCart}>
                        <MercadoPagoButton 
                            orderData={prepareOrderData()} 
                        />
                    </div>
                ) : (
                    /* 2. Si no se puede pagar (falta calcular envío), 
                         mostramos el botón de "Finalizar Compra" desactivado 
                         o el Link anterior para una redirección manual si prefieres.
                    */
                    <Link
                        to={shippingInfo ? "/checkout" : "#"} // Redirige si hay info, o no hace nada
                        onClick={shippingInfo ? closeCart : (e) => e.preventDefault()}
                        className={`w-full py-4 rounded-xl font-bold text-center shadow-lg transition flex items-center justify-center gap-2 
                            ${shippingInfo 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            }`
                        }
                        title={!shippingInfo ? "Calcula el envío primero" : ""}
                    >
                        <i className="fa-solid fa-credit-card"></i>
                        {shippingInfo ? 'Finalizar Compra' : 'Calcular Envío Pendiente'}
                    </Link>
                )}


                <button
                  onClick={closeCart}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
                >
                  Seguir Comprando
                </button>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Estás seguro de que quieres vaciar el carrito?"
                      )
                    ) {
                      clearCart();
                    }
                  }}
                  className="w-full text-red-600 hover:text-red-700 py-2 text-sm font-semibold transition"
                >
                  <i className="fa-solid fa-trash mr-2"></i>
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Estilos para la animación (sin cambios) */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}