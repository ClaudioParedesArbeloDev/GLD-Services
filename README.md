<h1 align="center">GLD Servicios · E-commerce</h1>

<p align="center">
  Tienda online full stack con pagos y envíos integrados · Full stack online store with integrated payments and shipping
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Mercado_Pago-00B1EA?style=for-the-badge&logo=mercadopago&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth0-EB5424?style=for-the-badge&logo=auth0&logoColor=white" />
</p>

<p align="center">
  <a href="#-español">Español</a> · <a href="#-english">English</a>
</p>

---

## 🇪🇸 Español

### Qué es

E-commerce desarrollado para un cliente (**GLD Servicios**): catálogo con categorías y filtros, carrito, cálculo de envío por código postal, pago con **Mercado Pago** y un panel de administración protegido con **Auth0**.

### Funcionalidades

**Tienda**
- Catálogo con búsqueda, filtros por categoría/tipo y producto destacado.
- Ficha de producto con galería de imágenes, videos y especificaciones técnicas.
- Carrito persistente (Context API).
- Cotización de envío con **Zipnova** (validación de código postal y opciones de envío).
- Checkout con **Mercado Pago** (preferencias + webhook de notificaciones).
- Botón de contacto por WhatsApp.

**Panel de administración** (rutas protegidas, solo admin)
- ABM de productos y categorías, control de stock.
- Subida, reordenamiento y reemplazo de imágenes; imagen principal.
- Videos y especificaciones clave/valor por producto.

### Estructura

```
GLD-Services/
├── src/                 # API Express
│   ├── config/          # conexión MySQL
│   ├── middleware/      # auth (JWT Auth0), upload (Multer)
│   ├── models/          # acceso a datos
│   ├── controllers/
│   ├── services/        # integración Zipnova
│   ├── routes/          # /api/products, /categories, /shipping, /payment…
│   └── server.js
└── frontend/            # React + Vite + Tailwind
    └── src/{pages, components, context, services}
```

### Instalación

```bash
git clone https://github.com/ClaudioParedesArbeloDev/GLD-Services.git
cd GLD-Services

# Backend
npm install
npm start                # nodemon src/server.js

# Frontend
cd frontend
npm install
npm run dev
```

Variables de entorno del backend (`.env`):

```env
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=
DB_NAME=
BASE_URL=
FRONTEND_URL=
MP_ACCESS_TOKEN=
```

---

## 🇬🇧 English

### What it is

E-commerce built for a client (**GLD Servicios**): catalogue with categories and filters, cart, shipping quotes by postal code, **Mercado Pago** checkout and an **Auth0**-protected admin panel.

### Features

- Product search, category/type filters and featured product.
- Product page with image gallery, videos and technical specs.
- Persistent cart (Context API).
- Shipping quotes through **Zipnova** (postal-code validation and carrier options).
- **Mercado Pago** checkout with preferences and a notification webhook.
- WhatsApp contact button.
- **Admin panel:** product & category CRUD, stock control, image upload/reorder/replace, product videos and key/value specs.

### Getting started

```bash
npm install && npm start          # API
cd frontend && npm install && npm run dev   # web app
```

Set the environment variables listed above in a `.env` file at the project root.

---

<p align="center">
  Hecho por / Built by <a href="https://github.com/ClaudioParedesArbeloDev"><b>Claudio Paredes Arbelo</b></a> · <a href="https://www.claudioparedes.site">Code & Lens Solutions</a>
</p>
