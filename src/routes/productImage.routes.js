import express from "express";
import { protectAdmin } from "../middleware/auth.js";

import {
  getImagesByProduct,
  getImageById,
  getMainImage,
  createImage,
  createMultipleImages,
  updateImage,
  setMainImage,
  deleteImage,
  deleteImagesByProduct,
  getAllImages,
} from "../controllers/productImage.controller.js";

const router = express.Router();


router.get("/", getAllImages);
router.get("/:id", getImageById);
router.get("/product/:productId", getImagesByProduct);
router.get("/product/:productId/main", getMainImage);


router.post("/", protectAdmin, createImage);
router.put("/:id", protectAdmin, updateImage);
router.delete("/:id", protectAdmin, deleteImage);
router.patch("/:id/set-main", protectAdmin, setMainImage);
router.post("/product/:productId/multiple", protectAdmin, createMultipleImages);
router.delete("/product/:productId", protectAdmin, deleteImagesByProduct);

export default router;