const CategoryModel = require('../models/CategoryModel');

exports.listCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving categories' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        if (!category_name) return res.status(400).json({ message: 'Category Name Required' });
        
        await CategoryModel.create(category_name);
        res.status(201).json({ message: 'Category Created' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Error creating category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await CategoryModel.delete(id);
        if (!success) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete category with associated products' });
        }
        res.status(500).json({ message: 'Error deleting category' });
    }
};
