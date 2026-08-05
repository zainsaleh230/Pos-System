const InventoryModel = require('../models/InventoryModel');

exports.getInventory = async (req, res) => {
    try {
        const inventory = await InventoryModel.findAll();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory' });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const items = await InventoryModel.getLowStock();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock' });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        await InventoryModel.updateStock(productId, quantity);
        res.json({ message: 'Stock updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating stock' });
    }
};
