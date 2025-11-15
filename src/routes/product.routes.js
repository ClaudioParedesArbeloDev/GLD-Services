import express from "express";

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
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.patch("/:id/stock", updateProductStock);
router.delete("/:id", deleteProduct);

export default router;