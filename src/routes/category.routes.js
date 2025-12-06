import { Router } from 'express';
import { protectAdmin } from "../middleware/auth.js";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);


router.post('/', protectAdmin, createCategory);
router.put('/:id', protectAdmin, updateCategory);
router.delete('/:id', protectAdmin, deleteCategory);

export default router;