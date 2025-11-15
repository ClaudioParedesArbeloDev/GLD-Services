import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Ícono de pendiente */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <i className="fa-solid fa-clock text-5xl text-yellow-600"></i>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Pago Pendiente
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Tu pago está siendo procesado
          </p>
          <p className="text-gray-500 mb-8">
            Te notificaremos por email cuando se confirme
          </p>

          {/* Detalles del pago */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
            <div className="space-y-3">
              {paymentId && (
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-semibold">ID de Pago:</span>
                  <span className="font-mono text-sm bg-white px-3 py-1 rounded-lg">
                    {paymentId}
                  </span>
                </div>
              )}
              
              {externalReference && (
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-semibold">Referencia:</span>
                  <span className="font-mono text-sm bg-white px-3 py-1 rounded-lg">
                    {externalReference}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-yellow-200">
                <div className="flex items-center justify-center gap-2 text-yellow-700">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span className="font-semibold">Estado: Procesando</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información sobre pagos pendientes */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-blue-800 mb-2 flex items-start gap-2">
              <i className="fa-solid fa-info-circle mt-0.5"></i>
              <span>
                <strong>¿Por qué está pendiente?</strong>
              </span>
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-6">
              <li>• Pagos en efectivo: El pago se confirmará cuando realices el pago en el punto indicado</li>
              <li>• Transferencias: La confirmación puede tardar hasta 2 días hábiles</li>
              <li>• Tarjetas: Estamos esperando la autorización del banco</li>
            </ul>
          </div>

          {/* Próximos pasos */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-green-800 mb-2 flex items-start gap-2">
              <i className="fa-solid fa-list-check mt-0.5"></i>
              <span>
                <strong>¿Qué hacer ahora?</strong>
              </span>
            </p>
            <ul className="text-sm text-green-700 space-y-1 ml-6">
              <li>• Guarda el número de referencia para futuras consultas</li>
              <li>• Revisa tu email para obtener el comprobante de pago</li>
              <li>• Si pagaste en efectivo, completa el pago en el lugar indicado</li>
              <li>• Te notificaremos cuando tu pago se confirme</li>
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

          {/* Contacto */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              ¿Tienes dudas sobre tu pago?
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:soporte@gldimportaciones.com"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
              >
                <i className="fa-solid fa-envelope"></i>
                Contactar Soporte
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
