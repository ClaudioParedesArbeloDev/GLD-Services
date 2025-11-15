import pool from "../config/db.js";

const ProductImage = {
  
  getByProductId: async (productId) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, created_at ASC",
      [productId]
    );
    return rows;
  },

  
  getById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_images WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  
  getMainImage: async (productId) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_images WHERE product_id = ? AND is_main = TRUE LIMIT 1",
      [productId]
    );
    return rows[0];
  },

  
  create: async (imageData) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { product_id, url, alt_text = null, is_main = false } = imageData;

      
      if (is_main) {
        await connection.query(
          "UPDATE product_images SET is_main = FALSE WHERE product_id = ?",
          [product_id]
        );
      }

      const [result] = await connection.query(
        `INSERT INTO product_images (product_id, url, alt_text, is_main) 
         VALUES (?, ?, ?, ?)`,
        [product_id, url, alt_text, is_main]
      );

      await connection.commit();

      return { id: result.insertId, ...imageData };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  
  createMultiple: async (productId, images) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const insertedImages = [];

      for (const image of images) {
        const { url, alt_text = null, is_main = false } = image;

        
        if (is_main) {
          await connection.query(
            "UPDATE product_images SET is_main = FALSE WHERE product_id = ?",
            [productId]
          );
        }

        const [result] = await connection.query(
          `INSERT INTO product_images (product_id, url, alt_text, is_main) 
           VALUES (?, ?, ?, ?)`,
          [productId, url, alt_text, is_main]
        );

        insertedImages.push({
          id: result.insertId,
          product_id: productId,
          url,
          alt_text,
          is_main,
        });
      }

      await connection.commit();
      return insertedImages;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  
  update: async (id, imageData) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const fields = [];
      const values = [];

     
      if (imageData.is_main === true) {
        
        const [currentImage] = await connection.query(
          "SELECT product_id FROM product_images WHERE id = ?",
          [id]
        );

        if (currentImage.length > 0) {
          
          await connection.query(
            "UPDATE product_images SET is_main = FALSE WHERE product_id = ? AND id != ?",
            [currentImage[0].product_id, id]
          );
        }
      }

      Object.keys(imageData).forEach((key) => {
        if (imageData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(imageData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error("No hay campos para actualizar");
      }

      values.push(id);

      const [result] = await connection.query(
        `UPDATE product_images SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  
  setMainImage: async (id) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      
      const [image] = await connection.query(
        "SELECT product_id FROM product_images WHERE id = ?",
        [id]
      );

      if (image.length === 0) {
        throw new Error("Imagen no encontrada");
      }

      const productId = image[0].product_id;

      
      await connection.query(
        "UPDATE product_images SET is_main = FALSE WHERE product_id = ?",
        [productId]
      );

      
      await connection.query(
        "UPDATE product_images SET is_main = TRUE WHERE id = ?",
        [id]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  
  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM product_images WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  
  deleteByProductId: async (productId) => {
    const [result] = await pool.query(
      "DELETE FROM product_images WHERE product_id = ?",
      [productId]
    );
    return result.affectedRows > 0;
  },

  
  getAll: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM product_images ORDER BY product_id, is_main DESC, created_at ASC"
    );
    return rows;
  },
};

export default ProductImage;