import pool from "../config/db.js";

export const Category = {
    getAll: async () => {
        const [rows] = await pool.query("SELECT * FROM categories ORDER BY id DESC");
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
        return rows[0];
    },

    create: async (name, description = "") => {
        const [result] = await pool.query(
            "INSERT INTO categories (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
            [name, description]
            );
            return result.insertId;
    },
        
    update: async (id, name, description) => {
        await pool.query(
            "UPDATE categories SET name = ?, description = ?, updated_at = NOW() WHERE id = ?",
            [name, description, id]
            );
        },

    delete: async (id) => {
        await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    }
        
}