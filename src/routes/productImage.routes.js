import express from "express";

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
router.post("/", createImage);
router.put("/:id", updateImage);
router.delete("/:id", deleteImage);


router.patch("/:id/set-main", setMainImage);


router.get("/product/:productId", getImagesByProduct);
router.get("/product/:productId/main", getMainImage);
router.post("/product/:productId/multiple", createMultipleImages);
router.delete("/product/:productId", deleteImagesByProduct);

export default router;