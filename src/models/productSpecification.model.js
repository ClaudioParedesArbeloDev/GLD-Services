import pool from "../config/db.js";

const ProductSpecification = {
  
  getByProductId: async (productId) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC, id ASC",
      [productId]
    );
    return rows;
  },

 
  getById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_specifications WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  
  getByKey: async (specKey) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_specifications WHERE spec_key = ? ORDER BY product_id",
      [specKey]
    );
    return rows;
  },

  
  create: async (specData) => {
    const {
      product_id,
      spec_key,
      spec_value,
      display_order = 0,
    } = specData;

    const [result] = await pool.query(
      `INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) 
       VALUES (?, ?, ?, ?)`,
      [product_id, spec_key, spec_value, display_order]
    );

    return { id: result.insertId, ...specData };
  },

  
  createMultiple: async (productId, specifications) => {
    const insertedSpecs = [];

    for (const spec of specifications) {
      const { spec_key, spec_value, display_order = 0 } = spec;

      const [result] = await pool.query(
        `INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) 
         VALUES (?, ?, ?, ?)`,
        [productId, spec_key, spec_value, display_order]
      );

      insertedSpecs.push({
        id: result.insertId,
        product_id: productId,
        spec_key,
        spec_value,
        display_order,
      });
    }

    return insertedSpecs;
  },

  
  update: async (id, specData) => {
    const fields = [];
    const values = [];

    Object.keys(specData).forEach((key) => {
      if (specData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(specData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error("No hay campos para actualizar");
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE product_specifications SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

 
  updateByProductAndKey: async (productId, specKey, specValue) => {
    const [result] = await pool.query(
      `UPDATE product_specifications 
       SET spec_value = ? 
       WHERE product_id = ? AND spec_key = ?`,
      [specValue, productId, specKey]
    );

    return result.affectedRows > 0;
  },

  
  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM product_specifications WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  
  deleteByProductId: async (productId) => {
    const [result] = await pool.query(
      "DELETE FROM product_specifications WHERE product_id = ?",
      [productId]
    );
    return result.affectedRows > 0;
  },

  
  deleteByProductAndKey: async (productId, specKey) => {
    const [result] = await pool.query(
      "DELETE FROM product_specifications WHERE product_id = ? AND spec_key = ?",
      [productId, specKey]
    );
    return result.affectedRows > 0;
  },

  
  getAll: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM product_specifications ORDER BY product_id, display_order ASC"
    );
    return rows;
  },

 
  reorder: async (productId, orderedIds) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      for (let i = 0; i < orderedIds.length; i++) {
        await connection.query(
          "UPDATE product_specifications SET display_order = ? WHERE id = ? AND product_id = ?",
          [i, orderedIds[i], productId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  
  replaceAll: async (productId, specifications) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

     
      await connection.query(
        "DELETE FROM product_specifications WHERE product_id = ?",
        [productId]
      );

     
      const insertedSpecs = [];
      for (const spec of specifications) {
        const { spec_key, spec_value, display_order = 0 } = spec;

        const [result] = await connection.query(
          `INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) 
           VALUES (?, ?, ?, ?)`,
          [productId, spec_key, spec_value, display_order]
        );

        insertedSpecs.push({
          id: result.insertId,
          product_id: productId,
          spec_key,
          spec_value,
          display_order,
        });
      }

      await connection.commit();
      return insertedSpecs;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

export default ProductSpecification;