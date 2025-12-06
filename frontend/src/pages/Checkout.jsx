import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import * as shippingAPI from "../services/shippingAPI";
import MercadoPagoButton from "../components/MercadoPagoButton";

export default function Checkout() {
  const { cart, getSubtotal, getTotalItems } = useCart();
  const navigate = useNavigate();

  
  const [personalData, setPersonalData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dni: ""
  });

 
  const [shippingAddress, setShippingAddress] = useState({
    zipCode: "",
    state: "",
    city: "",
    street: "",
    number: "",
    floor: "",
    apartment: ""
  });

 
  const [shippingData, setShippingData] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");


  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); 

  
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

 
  const validatePersonalData = () => {
    const newErrors = {};
    
    if (!personalData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    }
    
    if (!personalData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!personalData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    }
    
    if (!personalData.dni.trim()) {
      newErrors.dni = "El DNI es requerido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  const validateShippingAddress = () => {
    const newErrors = {};
    
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = "El código postal es requerido";
    } else if (!shippingAPI.validateZipCode(shippingAddress.zipCode)) {
      newErrors.zipCode = "Código postal inválido (ej: 2000 o S2000AAA)";
    }
    
    if (!shippingAddress.state.trim()) {
      newErrors.state = "La provincia es requerida";
    }
    
    if (!shippingAddress.city.trim()) {
      newErrors.city = "La ciudad es requerida";
    }
    
    if (!shippingAddress.street.trim()) {
      newErrors.street = "La calle es requerida";
    }
    
    if (!shippingAddress.number.trim()) {
      newErrors.number = "La altura es requerida";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  const handleCalculateShipping = async () => {
    if (!validateShippingAddress()) return;
    
    setCalculatingShipping(true);
    setShippingError("");
    setShippingData(null);
    setSelectedShipping(null);

    try {
      const response = await shippingAPI.calculateShipping(cart, {
        zipCode: shippingAddress.zipCode,
        city: shippingAddress.city,
        state: shippingAddress.state
      });

      if (response.success) {
        setShippingData(response);
        
      
        if (response.options && response.options.length > 0) {
          handleSelectShipping(response.options[0]);
        }
        
        setCurrentStep(4); 
      } else {
        throw new Error(response.error || "Error al calcular envío");
      }
    } catch (error) {
      console.error("Error:", error);
      setShippingError(error.message || "Error al calcular el envío");
    } finally {
      setCalculatingShipping(false);
    }
  };

  
  const handleSelectShipping = (option) => {
    setSelectedShipping(option);
  };

 
  const prepareOrderData = () => {
    if (!selectedShipping) return null;

    const itemsMP = cart.map(item => ({
      title: item.title,
      unit_price: parseFloat(item.final_price.toFixed(2)),
      quantity: item.quantity,
      id: item.id.toString()
    }));

    
    if (selectedShipping.cost > 0) {
      itemsMP.push({
        title: `Envío - ${selectedShipping.carrier}`,
        unit_price: parseFloat(selectedShipping.cost.toFixed(2)),
        quantity: 1,
        id: "SHIPPING_COST"
      });
    }

    return {
      items: itemsMP,
      email: personalData.email,
      external_reference: `ORDEN-${Date.now()}`,
      payer: {
        name: personalData.fullName,
        email: personalData.email,
        phone: personalData.phone,
        identification: {
          type: "DNI",
          number: personalData.dni
        }
      },
      shipping_address: {
        zip_code: shippingAddress.zipCode,
        state_name: shippingAddress.state,
        city_name: shippingAddress.city,
        street_name: shippingAddress.street,
        street_number: shippingAddress.number
      },
      shipping_info: {
        carrier: selectedShipping.carrier,
        service: selectedShipping.service,
        cost: selectedShipping.cost,
        delivery_days: selectedShipping.deliveryDays
      }
    };
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const shippingCost = selectedShipping?.cost || 0;
    return subtotal + shippingCost;
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
       
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>

       
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Datos" },
              { num: 2, label: "Dirección" },
              { num: 3, label: "Envío" },
              { num: 4, label: "Pago" }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
                      currentStep >= step.num
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {currentStep > step.num ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">{step.label}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 transition ${
                      currentStep > step.num ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Paso 1: Datos Personales */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <i className="fa-solid fa-user text-blue-600"></i>
                  Datos Personales
                </h2>
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    Editar
                  </button>
                )}
              </div>

              {currentStep === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={personalData.fullName}
                      onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                        errors.fullName ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Juan Pérez"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={personalData.email}
                        onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                          errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                        }`}
                        placeholder="juan@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={personalData.phone}
                        onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                          errors.phone ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                        }`}
                        placeholder="341 1234567"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      DNI *
                    </label>
                    <input
                      type="text"
                      value={personalData.dni}
                      onChange={(e) => setPersonalData({ ...personalData, dni: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                        errors.dni ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="12345678"
                    />
                    {errors.dni && (
                      <p className="text-red-500 text-sm mt-1">{errors.dni}</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (validatePersonalData()) {
                        setCurrentStep(2);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition"
                  >
                    Continuar a Dirección
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                  <p><strong>Nombre:</strong> {personalData.fullName}</p>
                  <p><strong>Email:</strong> {personalData.email}</p>
                  <p><strong>Teléfono:</strong> {personalData.phone}</p>
                </div>
              )}
            </div>

            
            {currentStep >= 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <i className="fa-solid fa-map-marker-alt text-blue-600"></i>
                    Dirección de Envío
                  </h2>
                  {currentStep > 2 && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {currentStep === 2 || currentStep === 3 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Código Postal *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value.toUpperCase() })}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                            errors.zipCode ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                          }`}
                          placeholder="2000"
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Provincia *
                        </label>
                        <select
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                            errors.state ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                          }`}
                        >
                          <option value="">Seleccionar</option>
                          <option value="Buenos Aires">Buenos Aires</option>
                          <option value="CABA">CABA</option>
                          <option value="Catamarca">Catamarca</option>
                          <option value="Chaco">Chaco</option>
                          <option value="Chubut">Chubut</option>
                          <option value="Córdoba">Córdoba</option>
                          <option value="Corrientes">Corrientes</option>
                          <option value="Entre Ríos">Entre Ríos</option>
                          <option value="Formosa">Formosa</option>
                          <option value="Jujuy">Jujuy</option>
                          <option value="La Pampa">La Pampa</option>
                          <option value="La Rioja">La Rioja</option>
                          <option value="Mendoza">Mendoza</option>
                          <option value="Misiones">Misiones</option>
                          <option value="Neuquén">Neuquén</option>
                          <option value="Río Negro">Río Negro</option>
                          <option value="Salta">Salta</option>
                          <option value="San Juan">San Juan</option>
                          <option value="San Luis">San Luis</option>
                          <option value="Santa Cruz">Santa Cruz</option>
                          <option value="Santa Fe">Santa Fe</option>
                          <option value="Santiago del Estero">Santiago del Estero</option>
                          <option value="Tierra del Fuego">Tierra del Fuego</option>
                          <option value="Tucumán">Tucumán</option>
                        </select>
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                            errors.city ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                          }`}
                          placeholder="Rosario"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Calle *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                            errors.street ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                          }`}
                          placeholder="San Martín"
                        />
                        {errors.street && (
                          <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Altura *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.number}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${
                            errors.number ? "border-red-500" : "border-gray-300 focus:border-blue-500"
                          }`}
                          placeholder="1234"
                        />
                        {errors.number && (
                          <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Piso (opcional)
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.floor}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, floor: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                          placeholder="3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Departamento (opcional)
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.apartment}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                          placeholder="B"
                        />
                      </div>
                    </div>

                    {currentStep === 2 && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold transition"
                        >
                          Volver
                        </button>
                        <button
                          onClick={() => {
                            if (validateShippingAddress()) {
                              setCurrentStep(3);
                            }
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition"
                        >
                          Continuar
                        </button>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <button
                        onClick={handleCalculateShipping}
                        disabled={calculatingShipping}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {calculatingShipping ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Calculando envío...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-truck"></i>
                            Calcular Costo de Envío
                          </>
                        )}
                      </button>
                    )}

                    {shippingError && (
                      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-700">
                        <i className="fa-solid fa-exclamation-circle mr-2"></i>
                        {shippingError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                    <p><strong>Dirección:</strong> {shippingAddress.street} {shippingAddress.number}</p>
                    <p><strong>Localidad:</strong> {shippingAddress.city}, {shippingAddress.state}</p>
                    <p><strong>CP:</strong> {shippingAddress.zipCode}</p>
                  </div>
                )}
              </div>
            )}

            
            {currentStep === 4 && shippingData && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-truck text-blue-600"></i>
                  Opciones de Envío
                </h2>

               
                <div className="space-y-3 mb-6">
                  {shippingData.options && shippingData.options.map((option, index) => (
                    <label
                      key={index}
                      className={`block p-4 border-2 rounded-xl cursor-pointer transition ${
                        selectedShipping === option
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          checked={selectedShipping === option}
                          onChange={() => handleSelectShipping(option)}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {option.carrier} - {option.service}
                          </p>
                          <p className="text-sm text-gray-600">
                            <i className="fa-solid fa-clock mr-1"></i>
                            Llega en {option.deliveryDays}
                          </p>
                        </div>
                        <div className="text-right">
                          {option.cost === 0 || option.isFree ? (
                            <span className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold">
                              GRATIS
                            </span>
                          ) : (
                            <p className="text-2xl font-bold text-blue-600">
                              ${option.cost.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                
                {selectedShipping && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <i className="fa-solid fa-credit-card text-blue-600"></i>
                      Método de Pago
                    </h3>
                    <MercadoPagoButton orderData={prepareOrderData()} />
                  </div>
                )}
              </div>
            )}
          </div>

         
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen de Compra</h3>
              
             
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x ${item.final_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
                </div>
                
                {selectedShipping && (
                  <div className="flex justify-between text-gray-700">
                    <span>Envío:</span>
                    <span className="font-semibold">
                      {selectedShipping.cost === 0 ? (
                        <span className="text-green-600">GRATIS</span>
                      ) : (
                        `$${selectedShipping.cost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-blue-600 border-t pt-3">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}