import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Obtener parámetros de MercadoPago
    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status");
    const externalReference = searchParams.get("external_reference");

    // Obtener datos de la última orden del localStorage
    const lastOrder = localStorage.getItem("gld-last-order");
    if (lastOrder) {
      try {
        setOrderDetails(JSON.parse(lastOrder));
      } catch (error) {
        console.error("Error leyendo última orden:", error);
      }
    }

    // Limpiar carrito solo si el pago fue aprobado
    if (status === "approved") {
      clearCart();
      // Aquí podrías hacer una llamada al backend para confirmar el pedido
      // await confirmOrder(paymentId, externalReference);
    }
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Ícono de éxito */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i className="fa-solid fa-check text-5xl text-green-600"></i>
            </div>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto -mt-16 mb-8">
              <i className="fa-solid fa-check text-3xl text-white"></i>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tu compra ha sido procesada correctamente
          </p>

          {/* Detalles del pago */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-semibold">ID de Pago:</span>
                <span className="font-mono text-sm bg-white px-3 py-1 rounded-lg">
                  {searchParams.get("payment_id") || "N/A"}
                </span>
              </div>
              
              {orderDetails && (
                <>
                  <div className="flex justify-between items-center text-gray-700 pt-3 border-t border-green-200">
                    <span className="font-semibold">Total Pagado:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${orderDetails.total?.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Productos:</p>
                    <div className="space-y-1">
                      {orderDetails.items?.slice(0, 3).map((item) => (
                        <p key={item.id} className="text-sm text-gray-700">
                          • {item.title} x{item.quantity}
                        </p>
                      ))}
                      {orderDetails.items?.length > 3 && (
                        <p className="text-sm text-gray-600 italic">
                          +{orderDetails.items.length - 3} productos más
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-blue-800 mb-2 flex items-start gap-2">
              <i className="fa-solid fa-info-circle mt-0.5"></i>
              <span>
                <strong>¿Qué sigue?</strong>
              </span>
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-6">
              <li>• Recibirás un email de confirmación con los detalles de tu pedido</li>
              <li>• Preparamos tu envío y te notificaremos cuando esté listo</li>
              <li>• Podrás rastrear tu pedido con el código de seguimiento</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
            >
              <i className="fa-solid fa-home mr-2"></i>
              Volver a la Tienda
            </button>

            <button
              onClick={() => window.print()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
            >
              <i className="fa-solid fa-print mr-2"></i>
              Imprimir Comprobante
            </button>
          </div>

          {/* Redes sociales */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              ¡Gracias por tu compra! Síguenos en nuestras redes:
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
