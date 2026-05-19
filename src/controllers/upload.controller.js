import fs from "fs";

export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se recibió ningún archivo",
      });
    }

    // Construir la URL pública del archivo
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
    const fileUrl = `${baseUrl}/uploads/products/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "Imagen subida exitosamente",
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al subir la imagen",
      error: error.message,
    });
  }
};

export const deleteUploadedImage = (req, res) => {
  try {
    const { filename } = req.params;

    // Validar que no tenga path traversal
    if (filename.includes("/") || filename.includes("..")) {
      return res.status(400).json({
        success: false,
        message: "Nombre de archivo inválido",
      });
    }

    const filePath = `uploads/products/${filename}`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado",
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "Archivo eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el archivo",
      error: error.message,
    });
  }
};
