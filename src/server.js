import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import paymentRoutes from './routes/payment.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import productImageRoutes from './routes/productImage.routes.js';
import productSpecificationRoutes from './routes/productSpecification.routes.js';
import productVideoRoutes from './routes/productVideo.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

// Servir imágenes subidas estáticamente
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));



app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/images', productImageRoutes);
app.use("/api/product-videos", productVideoRoutes);
app.use("/api/product-specifications", productSpecificationRoutes);
app.use("/api/shipping", shippingRoutes);
app.use('/api/payment', paymentRoutes);


app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }

  // Error de multer (archivo muy grande, tipo no permitido, etc.)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`🔐 Auth0 protection enabled for admin routes`);
  console.log(`📦 ZipNova shipping integration active`);
});