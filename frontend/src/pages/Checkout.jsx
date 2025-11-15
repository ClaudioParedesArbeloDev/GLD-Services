import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/url";

export default function Checkout() {
  const { cart, getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Estado del formulario de envío
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    streetNumber: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Argentina",
    additionalInfo: "",
  });

  // Estado para método de pago
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  
  // Estado para cálculo de envío
  const [shippingCost, setShippingCost] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [shippingDetails, setShippingDetails] = useState(null);

  // Estado del checkout
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = getSubtotal();
  const total = subtotal + (shippingCost || 0);

  // Cargar datos guardados del localStorage
  useEffect(() => {
    const savedShippingInfo = localStorage.getItem("gld-shipping-info");
    if (savedShippingInfo) {
      try {
        setShippingInfo(JSON.parse(savedShippingInfo));
      } catch (error) {
        console.error("Error cargando datos de envío:", error);
      }
    }
  }, []);

  // Guardar datos de envío en localStorage
  useEffect(() => {
    if (shippingInfo.fullName || shippingInfo.email) {
      localStorage.setItem("gld-shipping-info", JSON.stringify(shippingInfo));
    }
  }, [shippingInfo]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = "Email inválido";
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^\d{10}$/.test(shippingInfo.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Teléfono inválido (10 dígitos)";
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = "La dirección es requerida";
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = "La ciudad es requerida";
    }

    if (!shippingInfo.state.trim()) {
      newErrors.state = "La provincia es requerida";
    }

    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = "El código postal es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular costo de envío con API
  const calculateShipping = async () => {
    if (!validateForm()) {
      setShippingError("Por favor completa todos los campos requeridos");
      return;
    }

    setShippingLoading(true);
    setShippingError(null);
    setShippingCost(null);

    try {
      const response = await api.post("/shipping/calculate", {
        items: cart.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          final_price: item.final_price,
          weight: item.weight || 500, // peso por defecto en gramos
        })),
        destinationZipCode: shippingInfo.zipCode,
        destinationCity: shippingInfo.city,
        destinationState: shippingInfo.state,
      });

      if (response.data.success) {
        setShippingCost(response.data.cost);
        setShippingDetails(response.data);
        setShippingError(null);
      } else {
        throw new Error(response.data.error || "Error al calcular envío");
      }
    } catch (error) {
      console.error("Error calculando envío:", error);
      setShippingError(
        error.response?.data?.error ||
        error.message ||
        "Error al calcular el envío. Por favor intenta de nuevo."
      );
    } finally {
      setShippingLoading(false);
    }
  };

  // Procesar pago con MercadoPago
  const processWithMercadoPago = async () => {
    try {
      const response = await api.post("/mercadopago/create-preference", {
        items: cart.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || item.title,
          quantity: item.quantity,
          final_price: item.final_price,
          image_url: item.image_url,
          category: item.category,
        })),
        payer: {
          fullName: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          streetNumber: shippingInfo.streetNumber,
          zipCode: shippingInfo.zipCode,
          city: shippingInfo.city,
          state: shippingInfo.state,
        },
        shipment: {
          cost: shippingCost,
          zipCode: shippingInfo.zipCode,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
        },
        externalReference: `ORDER-${Date.now()}`,
      });

      if (response.data.success) {
        // Guardar orden en localStorage para referencia
        localStorage.setItem("gld-last-order", JSON.stringify({
          items: cart,
          total,
          shippingInfo,
          preferenceId: response.data.preferenceId,
          date: new Date().toISOString(),
        }));

        // Redirigir a Mercado Pago
        window.location.href = response.data.initPoint;
      } else {
        throw new Error(response.data.error || "Error al crear la preferencia");
      }
    } catch (error) {
      console.error("Error con MercadoPago:", error);
      alert(
        error.response?.data?.error ||
        error.message ||
        "Error al procesar el pago con MercadoPago. Por favor intenta de nuevo."
      );
    }
  };

  // Manejar submit del checkout
  const handleCheckout = async (e) => {
    e.preventDefault();

    // Validaciones
    if (cart.length === 0) {
      alert("Tu carrito está vacío");
      navigate("/");
      return;
    }

    if (!validateForm()) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (!shippingCost) {
      alert("Por favor calcula el costo de envío primero");
      return;
    }

    if (!paymentMethod) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "mercadopago") {
        await processWithMercadoPago();
      }
      // Aquí puedes agregar otros métodos de pago
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Hubo un error al procesar tu compra. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Si el carrito está vacío
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-shopping-cart text-4xl text-gray-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega productos para poder realizar una compra
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  // Provincias de Argentina
  const argentineProvinces = [
    "Buenos Aires",
    "CABA",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <i className="fa-solid fa-credit-card mr-3 text-blue-600"></i>
            Finalizar Compra
          </h1>
          <p className="text-gray-600">
            Completa tus datos para procesar el pedido
          </p>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de envío */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-truck text-blue-600"></i>
                Información de Envío
              </h2>

              <div className="space-y-4">
                {/* Nombre completo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                      errors.fullName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Juan Pérez"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Email y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      placeholder="juan@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      placeholder="1123456789"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Dirección */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Calle *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        errors.address
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      placeholder="Av. Corrientes"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      name="streetNumber"
                      value={shippingInfo.streetNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="1234"
                    />
                  </div>
                </div>

                {/* Ciudad, Provincia, CP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        errors.city
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      placeholder="Buenos Aires"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Provincia *
                    </label>
                    <select
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        errors.state
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      {argentineProvinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition ${
                        errors.zipCode
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      placeholder="C1043"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* Info adicional */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Información Adicional (Opcional)
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={shippingInfo.additionalInfo}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                    placeholder="Piso, departamento, referencias..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Botón calcular envío */}
              <button
                type="button"
                onClick={calculateShipping}
                disabled={shippingLoading}
                className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {shippingLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Calculando envío...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-calculator mr-2"></i>
                    Calcular Costo de Envío
                  </>
                )}
              </button>

              {shippingError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <i className="fa-solid fa-exclamation-circle"></i>
                    {shippingError}
                  </p>
                </div>
              )}

              {shippingCost !== null && shippingDetails && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                  <p className="text-green-800 font-bold flex items-center gap-2 text-lg">
                    <i className="fa-solid fa-check-circle"></i>
                    Envío: ${shippingCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">
                    <i className="fa-solid fa-clock mr-2"></i>
                    Tiempo estimado: {shippingDetails.deliveryTime}
                  </p>
                  <p className="text-sm text-green-700">
                    <i className="fa-solid fa-box mr-2"></i>
                    Servicio: {shippingDetails.service}
                  </p>
                  {shippingDetails.estimatedOnly && (
                    <p className="text-xs text-green-600 italic mt-2">
                      * Costo estimado. El valor final se confirmará en el procesamiento.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-credit-card text-blue-600"></i>
                Método de Pago
              </h2>

              <div className="space-y-3">
                {/* MercadoPago */}
                <label
                  className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "mercadopago"
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mercadopago"
                    checked={paymentMethod === "mercadopago"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">Mercado Pago</p>
                    <p className="text-sm text-gray-600">
                      Tarjetas de crédito/débito, efectivo o saldo en cuenta
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ Hasta 12 cuotas sin interés
                    </p>
                  </div>
                  <div className="text-4xl text-blue-600">
                    <i className="fa-brands fa-cc-visa"></i>
                  </div>
                </label>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <i className="fa-solid fa-info-circle"></i>
                    Serás redirigido a Mercado Pago para completar el pago de forma segura
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-receipt text-blue-600"></i>
                Resumen del Pedido
              </h2>

              {/* Lista de productos */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                    <img
                      src={
                        item.image_url ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23E5E7EB'/%3E%3C/svg%3E"
                      }
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {item.title}
                      </p>
                      <p className="text-gray-600">
                        {item.quantity} x ${item.final_price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ${(item.final_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-truck text-sm"></i>
                    Envío:
                  </span>
                  <span className="font-semibold">
                    {shippingCost !== null
                      ? `$${shippingCost.toFixed(2)}`
                      : "A calcular"}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-800 pt-3 border-t-2 border-gray-200">
                  <span>Total:</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de pago */}
              <button
                type="submit"
                disabled={loading || !shippingCost || !paymentMethod}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock mr-2"></i>
                    Pagar ${total.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-2">
                <i className="fa-solid fa-shield-halved"></i>
                Pago 100% seguro y protegido
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
