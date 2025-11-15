import ProductSpecification from "../models/productSpecification.model.js";


export const getSpecificationsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const specifications = await ProductSpecification.getByProductId(productId);

    res.status(200).json({
      success: true,
      data: specifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las especificaciones del producto",
      error: error.message,
    });
  }
};


export const getSpecificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const specification = await ProductSpecification.getById(id);

    if (!specification) {
      return res.status(404).json({
        success: false,
        message: "Especificación no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      data: specification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la especificación",
      error: error.message,
    });
  }
};


export const getSpecificationsByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const specifications = await ProductSpecification.getByKey(key);

    res.status(200).json({
      success: true,
      data: specifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener especificaciones por clave",
      error: error.message,
    });
  }
};


export const createSpecification = async (req, res) => {
  try {
    const specData = req.body;

    
    if (!specData.product_id || !specData.spec_key || !specData.spec_value) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: product_id, spec_key, spec_value",
      });
    }

    const newSpecification = await ProductSpecification.create(specData);

    res.status(201).json({
      success: true,
      message: "Especificación creada exitosamente",
      data: newSpecification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear la especificación",
      error: error.message,
    });
  }
};


export const createMultipleSpecifications = async (req, res) => {
  try {
    const { productId } = req.params;
    const { specifications } = req.body;

    if (!specifications || !Array.isArray(specifications) || specifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de especificaciones válido",
      });
    }

   
    const invalidSpecs = specifications.filter(
      (spec) => !spec.spec_key || !spec.spec_value
    );
    if (invalidSpecs.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Todas las especificaciones deben tener spec_key y spec_value",
      });
    }

    const newSpecifications = await ProductSpecification.createMultiple(
      productId,
      specifications
    );

    res.status(201).json({
      success: true,
      message: `${newSpecifications.length} especificaciones creadas exitosamente`,
      data: newSpecifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear las especificaciones",
      error: error.message,
    });
  }
};


export const updateSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    const specData = req.body;

    const updated = await ProductSpecification.update(id, specData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Especificación no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Especificación actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la especificación",
      error: error.message,
    });
  }
};


export const updateSpecificationByKey = async (req, res) => {
  try {
    const { productId, key } = req.params;
    const { spec_value } = req.body;

    if (!spec_value) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el campo spec_value",
      });
    }

    const updated = await ProductSpecification.updateByProductAndKey(
      productId,
      key,
      spec_value
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Especificación no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Especificación actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la especificación",
      error: error.message,
    });
  }
};


export const deleteSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductSpecification.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Especificación no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Especificación eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar la especificación",
      error: error.message,
    });
  }
};


export const deleteSpecificationsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await ProductSpecification.deleteByProductId(productId);

    res.status(200).json({
      success: true,
      message: `${deleted ? "Especificaciones eliminadas" : "No se encontraron especificaciones"} para este producto`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar las especificaciones del producto",
      error: error.message,
    });
  }
};


export const deleteSpecificationByKey = async (req, res) => {
  try {
    const { productId, key } = req.params;
    const deleted = await ProductSpecification.deleteByProductAndKey(
      productId,
      key
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Especificación no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Especificación eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar la especificación",
      error: error.message,
    });
  }
};


export const getAllSpecifications = async (req, res) => {
  try {
    const specifications = await ProductSpecification.getAll();

    res.status(200).json({
      success: true,
      data: specifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las especificaciones",
      error: error.message,
    });
  }
};


export const reorderSpecifications = async (req, res) => {
  try {
    const { productId } = req.params;
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de IDs ordenados",
      });
    }

    await ProductSpecification.reorder(productId, orderedIds);

    res.status(200).json({
      success: true,
      message: "Especificaciones reordenadas exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al reordenar las especificaciones",
      error: error.message,
    });
  }
};


export const replaceAllSpecifications = async (req, res) => {
  try {
    const { productId } = req.params;
    const { specifications } = req.body;

    if (!specifications || !Array.isArray(specifications)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de especificaciones",
      });
    }

    const newSpecifications = await ProductSpecification.replaceAll(
      productId,
      specifications
    );

    res.status(200).json({
      success: true,
      message: "Especificaciones reemplazadas exitosamente",
      data: newSpecifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al reemplazar las especificaciones",
      error: error.message,
    });
  }
};