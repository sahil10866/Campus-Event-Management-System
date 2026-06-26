// controllers/categoryController.js
import Category from '../models/Category.js';

// Create a new category (Admin only)
export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = new Category({
      name: name.trim(),
      description: description || '',
      createdBy: req.user._id,
    });

    await category.save();
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Get all categories (accessible to everyone who is logged in)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Sort alphabetically
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Delete a category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
