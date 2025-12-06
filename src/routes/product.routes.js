import express from "express";
import { protectAdmin } from "../middleware/auth.js";

import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  searchProducts,
  getFilteredProducts,
} from "../controllers/product.controller.js";

const router = express.Router();


router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/filter", getFilteredProducts);
router.get("/:id", getProductById);
router.get("/category/:categoryId", getProductsByCategory);


router.post("/", protectAdmin, createProduct);
router.put("/:id", protectAdmin, updateProduct);
router.patch("/:id/stock", protectAdmin, updateProductStock);
router.delete("/:id", protectAdmin, deleteProduct);

export default router;