import express from "express";

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
router.post("/", createVideo);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

router.get("/type/:type", getVideosByType);

router.get("/product/:productId", getVideosByProduct);
router.post("/product/:productId/multiple", createMultipleVideos);
router.delete("/product/:productId", deleteVideosByProduct);

export default router;