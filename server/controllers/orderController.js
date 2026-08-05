const OrderModel = require('../models/OrderModel');

exports.listOrders = async (req, res) => {
    try {
        const orders = await OrderModel.findAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order details' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        // req.body: { customer_id, items: [{product_id, quantity}] }
        if (!req.body.customer_id || !req.body.items || req.body.items.length === 0) {
             return res.status(400).json({ message: 'Invalid order data' });
        }
        
        const result = await OrderModel.create(req.body);
        res.status(201).json({ message: 'Order placed successfully', result });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Error creating order' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const success = await OrderModel.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
};
