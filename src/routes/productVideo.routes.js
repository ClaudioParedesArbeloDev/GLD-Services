import express from "express";
import { protectAdmin } from "../middleware/auth.js";

import {
  getVideosByProduct,
  getVideoById,
  createVideo,
  createMultipleVideos,
  updateVideo,
  deleteVideo,
  deleteVideosByProduct,
  getAllVideos,
  getVideosByType,
} from "../controllers/productVideo.controller.js";

const router = express.Router();


router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.get("/type/:type", getVideosByType);
router.get("/product/:productId", getVideosByProduct);


router.post("/", protectAdmin, createVideo);
router.put("/:id", protectAdmin, updateVideo);
router.delete("/:id", protectAdmin, deleteVideo);
router.post("/product/:productId/multiple", protectAdmin, createMultipleVideos);
router.delete("/product/:productId", protectAdmin, deleteVideosByProduct);

export default router;