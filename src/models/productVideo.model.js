import pool from "../config/db.js";

const ProductVideo = {

  getByProductId: async (productId) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_videos WHERE product_id = ? ORDER BY created_at DESC",
      [productId]
    );
    return rows;
  },

  
  getById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_videos WHERE id = ?",
      [id]
    );
    return rows[0];
  },


  create: async (videoData) => {
    const {
      product_id,
      url,
      title = null,
      description = null,
      video_type = "youtube",
    } = videoData;

    const [result] = await pool.query(
      `INSERT INTO product_videos (product_id, url, title, description, video_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [product_id, url, title, description, video_type]
    );

    return { id: result.insertId, ...videoData };
  },


  createMultiple: async (productId, videos) => {
    const insertedVideos = [];

    for (const video of videos) {
      const {
        url,
        title = null,
        description = null,
        video_type = "youtube",
      } = video;

      const [result] = await pool.query(
        `INSERT INTO product_videos (product_id, url, title, description, video_type) 
         VALUES (?, ?, ?, ?, ?)`,
        [productId, url, title, description, video_type]
      );

      insertedVideos.push({
        id: result.insertId,
        product_id: productId,
        url,
        title,
        description,
        video_type,
      });
    }

    return insertedVideos;
  },


  update: async (id, videoData) => {
    const fields = [];
    const values = [];

    Object.keys(videoData).forEach((key) => {
      if (videoData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(videoData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error("No hay campos para actualizar");
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE product_videos SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },


  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM product_videos WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  
  deleteByProductId: async (productId) => {
    const [result] = await pool.query(
      "DELETE FROM product_videos WHERE product_id = ?",
      [productId]
    );
    return result.affectedRows > 0;
  },


  getAll: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM product_videos ORDER BY created_at DESC"
    );
    return rows;
  },


  getByType: async (videoType) => {
    const [rows] = await pool.query(
      "SELECT * FROM product_videos WHERE video_type = ? ORDER BY created_at DESC",
      [videoType]
    );
    return rows;
  },
};

export default ProductVideo;