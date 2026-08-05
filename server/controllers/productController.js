const ProductModel = require('../models/ProductModel');

exports.listProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let products;
        if (search) {
            products = await ProductModel.searchByName(search);
        } else if (category) {
            products = await ProductModel.findByCategory(category);
        } else {
            products = await ProductModel.findAll();
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        // Validation skipped for brevity but recommended
        const productId = await ProductModel.create(req.body);
        res.status(201).json({ message: 'Product created', productId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await ProductModel.update(id, req.body);
        res.json({ message: 'Product updated' });
    } catch (error) {
         res.status(500).json({ message: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await ProductModel.delete(id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};
