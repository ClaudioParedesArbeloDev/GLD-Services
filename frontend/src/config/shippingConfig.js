// Configuración del sistema de envíos
export const SHIPPING_CONFIG = {
  // Tu código postal de origen (depósito/tienda)
  originPostalCode: "2000",
  originCity: "Rosario",
  originProvince: "Santa Fe",
  
  // Umbral para envío gratis
  freeShippingThreshold: 10000,
  
  // Factor de peso volumétrico (cm³ / factor = kg)
  // Estándar: 5000 para la mayoría de transportistas
  volumetricFactor: 5000,
  
  // Costos base por zona (código postal destino)
  zones: [
    {
      name: "Rosario y alrededores",
      postalCodes: /^2(0|1|1[0-8])/,  // 2000-2118
      baseCost: 400,
      costPerKg: 40,
      deliveryDays: "24-48 horas",
      method: "Envío Local Express"
    },
    {
      name: "Santa Fe (interior)",
      postalCodes: /^(2[2-9]|3[0-6])/,  // 2200-3699
      baseCost: 600,
      costPerKg: 60,
      deliveryDays: "2-4 días hábiles",
      method: "Envío Provincial"
    },
    {
      name: "CABA y GBA",
      postalCodes: /^1/,  // 1xxx
      baseCost: 800,
      costPerKg: 80,
      deliveryDays: "3-5 días hábiles",
      method: "Envío Nacional Estándar"
    },
    {
      name: "Buenos Aires (interior)",
      postalCodes: /^(6|7)/,  // 6xxx, 7xxx
      baseCost: 900,
      costPerKg: 90,
      deliveryDays: "4-6 días hábiles",
      method: "Envío Nacional"
    },
    {
      name: "Centro (Córdoba, Entre Ríos, etc.)",
      postalCodes: /^(4|5|37|38|39)/,  // 4xxx, 5xxx, 37xx-39xx
      baseCost: 850,
      costPerKg: 85,
      deliveryDays: "4-6 días hábiles",
      method: "Envío Nacional"
    },
    {
      name: "Patagonia",
      postalCodes: /^(8|9)/,  // 8xxx, 9xxx
      baseCost: 1500,
      costPerKg: 150,
      deliveryDays: "7-10 días hábiles",
      method: "Envío Nacional Patagonia"
    },
    {
      name: "Norte (NOA y NEA)",
      postalCodes: /^(3[7-9]|4[4-9])/,  // Resto del norte
      baseCost: 1200,
      costPerKg: 120,
      deliveryDays: "6-8 días hábiles",
      method: "Envío Nacional Norte"
    }
  ],
  
  // Zona por defecto si no coincide con ninguna
  defaultZone: {
    name: "Nacional",
    baseCost: 1000,
    costPerKg: 100,
    deliveryDays: "5-7 días hábiles",
    method: "Envío Nacional Estándar"
  },
  
  // Recargos adicionales
  surcharges: {
    insurance: 0.02, // 2% del valor declarado
    packaging: 100,   // Costo fijo de embalaje
    handling: 50      // Costo de manipulación
  },
  
  // Dimensiones máximas permitidas (cm)
  maxDimensions: {
    length: 150,
    width: 100,
    height: 100
  },
  
  // Peso máximo permitido (kg)
  maxWeight: 30
};

export default SHIPPING_CONFIG;
