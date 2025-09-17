const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories - Get all active categories
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all active categories...');
    
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    
    console.log(`Found ${categories.length} active categories`);
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// GET /api/categories/:id - Get single category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching category with ID: ${id}`);
    
    const category = await Category.findById(id);
    
    if (!category) {
      console.log(`Category not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    console.log(`Found category: ${category.name}`);
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching category:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// POST /api/categories - Create new category (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, coverImage } = req.body;
    
    console.log('Creating new category:', { name, description });
    
    // Validate required fields
    if (!name || !description || !coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and cover image are required'
      });
    }
    
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingCategory) {
      console.log(`Category already exists with name: ${name}`);
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = new Category({
      name,
      description,
      coverImage
    });
    
    const savedCategory = await category.save();
    console.log(`Category created successfully: ${savedCategory.name} (ID: ${savedCategory._id})`);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: savedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, coverImage, isActive } = req.body;
    
    console.log(`Updating category with ID: ${id}`, { name, description, isActive });
    
    const category = await Category.findById(id);
    
    if (!category) {
      console.log(`Category not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        console.log(`Category already exists with name: ${name}`);
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }
    
    // Update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (coverImage) category.coverImage = coverImage;
    if (typeof isActive === 'boolean') category.isActive = isActive;
    
    const updatedCategory = await category.save();
    console.log(`Category updated successfully: ${updatedCategory.name}`);
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting category with ID: ${id}`);
    
    const category = await Category.findById(id);
    
    if (!category) {
      console.log(`Category not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();
    
    console.log(`Category soft deleted: ${category.name}`);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

module.exports = router;