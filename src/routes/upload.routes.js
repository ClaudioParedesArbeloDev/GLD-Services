import express from "express";
import upload from "../middleware/upload.js";
import { protectAdmin } from "../middleware/auth.js";
import { uploadImage, deleteUploadedImage } from "../controllers/upload.controller.js";

const router = express.Router();

// POST /api/upload/image  → sube una imagen al servidor
router.post("/image", protectAdmin, upload.single("image"), uploadImage);

// DELETE /api/upload/image/:filename  → elimina un archivo del servidor
router.delete("/image/:filename", protectAdmin, deleteUploadedImage);

export default router;
