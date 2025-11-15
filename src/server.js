import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import productImageRoutes from './routes/productImage.routes.js';
import productSpecificationRoutes from './routes/productSpecification.routes.js';
import productVideoRoutes from './routes/productVideo.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/images', productImageRoutes);
app.use("/api/product-videos", productVideoRoutes);
app.use("/api/product-specifications", productSpecificationRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});