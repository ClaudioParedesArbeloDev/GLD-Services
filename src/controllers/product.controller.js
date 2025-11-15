import Product from "../models/product.model.js";


import pool from '../config/db.js';

export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        c.name as category_name,
        pi.url as image_url,
        pi.alt_text as image_alt
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el producto",
      error: error.message,
    });
  }
};


export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        c.name as category_name,
        pi.url as image_url,
        pi.alt_text as image_alt
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `, [categoryId]);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener productos por categoría",
      error: error.message,
    });
  }
};


export const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    
    if (!productData.category_id || !productData.title || !productData.price) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: category_id, title, price",
      });
    }

    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
      error: error.message,
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const updated = await Product.update(id, productData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el producto",
      error: error.message,
    });
  }
};


export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el campo quantity",
      });
    }

    const updated = await Product.updateStock(id, quantity);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el stock",
      error: error.message,
    });
  }
};


export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el parámetro de búsqueda 'q'",
      });
    }

    const products = await Product.search(q);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al buscar productos",
      error: error.message,
    });
  }
};


export const getFilteredProducts = async (req, res) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    const products = await Product.getFiltered(filters);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener productos filtrados",
      error: error.message,
    });
  }
};