import express from "express";

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
router.post("/", createSpecification);
router.put("/:id", updateSpecification);
router.delete("/:id", deleteSpecification);


router.get("/key/:key", getSpecificationsByKey);


router.get("/product/:productId", getSpecificationsByProduct);
router.post("/product/:productId/multiple", createMultipleSpecifications);
router.put("/product/:productId/reorder", reorderSpecifications);
router.put("/product/:productId/replace", replaceAllSpecifications);
router.delete("/product/:productId", deleteSpecificationsByProduct);


router.put("/product/:productId/key/:key", updateSpecificationByKey);
router.delete("/product/:productId/key/:key", deleteSpecificationByKey);

export default router;