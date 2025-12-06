import api from "./api";


/**
 * 
 * @param {Array} items 
 * @param {Object} destination 
 * @returns {Promise} 
 */
export const calculateShipping = async (items, destination) => {
  try {
    const postalCode = destination.zipCode || destination.postalCode;
    
    if (!postalCode) {
      throw new Error("Código postal es requerido");
    }

    
    const itemsFormatted = items.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      weight: parseFloat(item.weight) || 500,  
      length: parseFloat(item.length) || 30,   
      width: parseFloat(item.width) || 20,     
      height: parseFloat(item.height) || 15,   
      price: parseFloat(item.final_price) || parseFloat(item.price) || 0,
      peso: parseFloat(item.weight) || 500,
      largo: parseFloat(item.length) || 30,
      ancho: parseFloat(item.width) || 20,
      alto: parseFloat(item.height) || 15
    }));

    
    const payload = {
      items: itemsFormatted,
      destinationZipCode: postalCode,
      destinationCity: destination.city || "",
      destinationProvince: destination.province || ""
    };

    console.log("📦 Payload enviado a backend:", JSON.stringify(payload, null, 2));

    const response = await api.post("/shipping/calculate", payload);

    console.log("✅ Respuesta de Zipnova:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error al calcular envío:", error);
    console.error("📋 Response data:", error.response?.data);
    console.error("📋 Response status:", error.response?.status);
    
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message 
      || error.message 
      || "Error al calcular el envío";

    throw new Error(errorMessage);
  }
};


export const validateZipCode = (zipCode) => {
  if (!zipCode) return false;
  const cleanZip = String(zipCode).trim().replace(/\s/g, "");
  const oldFormat = /^\d{4}$/;
  const newFormat = /^[A-Z]\d{4}[A-Z]{3}$/i;
  return oldFormat.test(cleanZip) || newFormat.test(cleanZip);
};

export default {
  calculateShipping,
  validateZipCode
};