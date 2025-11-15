import ProductVideo from "../models/productVideo.model.js";


export const getVideosByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const videos = await ProductVideo.getByProductId(productId);

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los videos del producto",
      error: error.message,
    });
  }
};


export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await ProductVideo.getById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el video",
      error: error.message,
    });
  }
};


export const createVideo = async (req, res) => {
  try {
    const videoData = req.body;

    
    if (!videoData.product_id || !videoData.url) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: product_id, url",
      });
    }

    const newVideo = await ProductVideo.create(videoData);

    res.status(201).json({
      success: true,
      message: "Video creado exitosamente",
      data: newVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear el video",
      error: error.message,
    });
  }
};


export const createMultipleVideos = async (req, res) => {
  try {
    const { productId } = req.params;
    const { videos } = req.body;

    
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de videos válido",
      });
    }

    
    const invalidVideos = videos.filter((video) => !video.url);
    if (invalidVideos.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Todos los videos deben tener una URL",
      });
    }

    const newVideos = await ProductVideo.createMultiple(productId, videos);

    res.status(201).json({
      success: true,
      message: `${newVideos.length} videos creados exitosamente`,
      data: newVideos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear los videos",
      error: error.message,
    });
  }
};


export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const videoData = req.body;

    const updated = await ProductVideo.update(id, videoData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Video no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el video",
      error: error.message,
    });
  }
};


export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductVideo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Video no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el video",
      error: error.message,
    });
  }
};


export const deleteVideosByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await ProductVideo.deleteByProductId(productId);

    res.status(200).json({
      success: true,
      message: `${deleted ? "Videos eliminados" : "No se encontraron videos"} para este producto`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar los videos del producto",
      error: error.message,
    });
  }
};


export const getAllVideos = async (req, res) => {
  try {
    const videos = await ProductVideo.getAll();

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los videos",
      error: error.message,
    });
  }
};


export const getVideosByType = async (req, res) => {
  try {
    const { type } = req.params;
    const videos = await ProductVideo.getByType(type);

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los videos por tipo",
      error: error.message,
    });
  }
};