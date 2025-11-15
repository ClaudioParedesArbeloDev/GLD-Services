import { Category } from "../models/category.model.js";

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting categories" });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.getById(id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting category" });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const id = await Category.create(name, description || "");
        res.status(201).json({message: "Category created", id});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating category" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        await Category.update(id, name, description || "");
        res.status(200).json({ message: "Category updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating category" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.delete(id);
        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting category" });
    }
};