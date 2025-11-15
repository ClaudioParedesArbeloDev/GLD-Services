import ProductImage from "../models/productImage.model.js";


export const getImagesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const images = await ProductImage.getByProductId(productId);

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las imágenes del producto",
      error: error.message,
    });
  }
};


export const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await ProductImage.getById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la imagen",
      error: error.message,
    });
  }
};

export const getMainImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const image = await ProductImage.getMainImage(productId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "No se encontró imagen principal para este producto",
      });
    }

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la imagen principal",
      error: error.message,
    });
  }
};


export const createImage = async (req, res) => {
  try {
    const imageData = req.body;

    
    if (!imageData.product_id || !imageData.url) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: product_id, url",
      });
    }

    const newImage = await ProductImage.create(imageData);

    res.status(201).json({
      success: true,
      message: "Imagen creada exitosamente",
      data: newImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear la imagen",
      error: error.message,
    });
  }
};


export const createMultipleImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { images } = req.body;

    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de imágenes válido",
      });
    }

    
    const invalidImages = images.filter((img) => !img.url);
    if (invalidImages.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Todas las imágenes deben tener una URL",
      });
    }

    const newImages = await ProductImage.createMultiple(productId, images);

    res.status(201).json({
      success: true,
      message: `${newImages.length} imágenes creadas exitosamente`,
      data: newImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear las imágenes",
      error: error.message,
    });
  }
};


export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imageData = req.body;

    const updated = await ProductImage.update(id, imageData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Imagen actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la imagen",
      error: error.message,
    });
  }
};


export const setMainImage = async (req, res) => {
  try {
    const { id } = req.params;

    await ProductImage.setMainImage(id);

    res.status(200).json({
      success: true,
      message: "Imagen establecida como principal exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al establecer la imagen principal",
      error: error.message,
    });
  }
};


export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductImage.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Imagen no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Imagen eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar la imagen",
      error: error.message,
    });
  }
};


export const deleteImagesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await ProductImage.deleteByProductId(productId);

    res.status(200).json({
      success: true,
      message: `${deleted ? "Imágenes eliminadas" : "No se encontraron imágenes"} para este producto`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar las imágenes del producto",
      error: error.message,
    });
  }
};


export const getAllImages = async (req, res) => {
  try {
    const images = await ProductImage.getAll();

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las imágenes",
      error: error.message,
    });
  }
};