import express from "express";
import { protectAdmin } from "../middleware/auth.js";

import {
  getSpecificationsByProduct,
  getSpecificationById,
  getSpecificationsByKey,
  createSpecification,
  createMultipleSpecifications,
  updateSpecification,
  updateSpecificationByKey,
  deleteSpecification,
  deleteSpecificationsByProduct,
  deleteSpecificationByKey,
  getAllSpecifications,
  reorderSpecifications,
  replaceAllSpecifications,
} from "../controllers/productSpecification.controller.js";

const router = express.Router();


router.get("/", getAllSpecifications);
router.get("/:id", getSpecificationById);
router.get("/key/:key", getSpecificationsByKey);
router.get("/product/:productId", getSpecificationsByProduct);


router.post("/", protectAdmin, createSpecification);
router.put("/:id", protectAdmin, updateSpecification);
router.delete("/:id", protectAdmin, deleteSpecification);
router.post("/product/:productId/multiple", protectAdmin, createMultipleSpecifications);
router.put("/product/:productId/reorder", protectAdmin, reorderSpecifications);
router.put("/product/:productId/replace", protectAdmin, replaceAllSpecifications);
router.delete("/product/:productId", protectAdmin, deleteSpecificationsByProduct);
router.put("/product/:productId/key/:key", protectAdmin, updateSpecificationByKey);
router.delete("/product/:productId/key/:key", protectAdmin, deleteSpecificationByKey);

export default router;
