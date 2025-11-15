import pool from "../config/db.js";

const Product = {
  
  getAll: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return rows;
  },

  
  getByCategory: async (categoryId) => {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE category_id = ?",
      [categoryId]
    );
    return rows;
  },

 
  getById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

 
  create: async (productData) => {
    const {
      category_id,
      title,
      description,
      price,
      discount = 0,
      stock = 0,
      weight = null,
      height = null,
      width = null,
      length = null,
      status = "active",
    } = productData;

    const [result] = await pool.query(
      `INSERT INTO products 
       (category_id, title, description, price, discount, stock, weight, height, width, length, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        title,
        description,
        price,
        discount,
        stock,
        weight,
        height,
        width,
        length,
        status,
      ]
    );

    return { id: result.insertId, ...productData };
  },

  
  update: async (id, productData) => {
    const fields = [];
    const values = [];

    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(productData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error("No hay campos para actualizar");
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },


  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },

 
  updateStock: async (id, quantity) => {
    const [result] = await pool.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [quantity, id]
    );
    return result.affectedRows > 0;
  },

  
  search: async (searchTerm) => {
    const [rows] = await pool.query(
      `SELECT * FROM products 
       WHERE title LIKE ? OR description LIKE ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  },

 
  getFiltered: async (filters = {}) => {
    let query = "SELECT * FROM products WHERE 1=1";
    const values = [];

    if (filters.category_id) {
      query += " AND category_id = ?";
      values.push(filters.category_id);
    }

    if (filters.status) {
      query += " AND status = ?";
      values.push(filters.status);
    }

    if (filters.minPrice) {
      query += " AND price >= ?";
      values.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += " AND price <= ?";
      values.push(filters.maxPrice);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, values);
    return rows;
  },
};

export default Product;