import express from 'express';
import { createCategory, getAllCategories, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/categories - Create a new category (Admin only)
router.post('/', verifyToken, createCategory);

// GET /api/categories - Get all categories (any logged-in user)
router.get('/', verifyToken, getAllCategories);

// DELETE /api/categories/:id - Delete a category (Admin only)
router.delete('/:id', verifyToken, deleteCategory);

export default router;
