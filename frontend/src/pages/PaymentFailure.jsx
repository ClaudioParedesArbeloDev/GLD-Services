import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  // Mensajes de error según el estado
  const getErrorMessage = () => {
    const statusDetail = searchParams.get("status_detail");
    
    const errorMessages = {
      cc_rejected_insufficient_funds: "Fondos insuficientes en la tarjeta",
      cc_rejected_bad_filled_card_number: "Número de tarjeta incorrecto",
      cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta",
      cc_rejected_bad_filled_security_code: "Código de seguridad incorrecto",
      cc_rejected_call_for_authorize: "Debes autorizar el pago con tu banco",
      cc_rejected_card_disabled: "Tarjeta deshabilitada",
      cc_rejected_duplicated_payment: "Pago duplicado",
      cc_rejected_high_risk: "Pago rechazado por alto riesgo",
      cc_rejected_max_attempts: "Máximo de intentos alcanzado",
      cc_rejected_other_reason: "El pago fue rechazado",
    };

    return errorMessages[statusDetail] || "El pago no pudo ser procesado";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Ícono de error */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <i className="fa-solid fa-times text-5xl text-red-600"></i>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Pago Rechazado
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {getErrorMessage()}
          </p>
          <p className="text-gray-500 mb-8">
            No te preocupes, puedes intentar nuevamente con otro método de pago
          </p>

          {/* Detalles del error */}
          {paymentId && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-semibold">ID de Intento:</span>
                  <span className="font-mono text-sm bg-white px-3 py-1 rounded-lg">
                    {paymentId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-semibold">Estado:</span>
                  <span className="text-red-600 font-semibold capitalize">
                    {status || "Rechazado"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sugerencias */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-blue-800 mb-2 flex items-start gap-2">
              <i className="fa-solid fa-lightbulb mt-0.5"></i>
              <span>
                <strong>Sugerencias:</strong>
              </span>
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-6">
              <li>• Verifica que los datos de tu tarjeta sean correctos</li>
              <li>• Asegúrate de tener fondos suficientes</li>
              <li>• Intenta con otra tarjeta o método de pago</li>
              <li>• Contacta a tu banco si el problema persiste</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
            >
              <i className="fa-solid fa-rotate-right mr-2"></i>
              Intentar Nuevamente
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
            >
              <i className="fa-solid fa-home mr-2"></i>
              Volver a la Tienda
            </button>
          </div>

          {/* Soporte */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              ¿Necesitas ayuda?
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:soporte@gldimportaciones.com"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
              >
                <i className="fa-solid fa-envelope"></i>
                Email
              </a>
              <a
                href="https://wa.me/5491123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp"></i>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
