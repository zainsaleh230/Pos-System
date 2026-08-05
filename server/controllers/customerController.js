const CustomerModel = require('../models/CustomerModel');

exports.listCustomers = async (req, res) => {
    try {
        const customers = await CustomerModel.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers' });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const id = await CustomerModel.create(req.body);
        res.status(201).json({ message: 'Customer created', id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer' });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const success = await CustomerModel.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const success = await CustomerModel.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer' });
    }
};

exports.getCustomerHistory = async (req, res) => {
    try {
        const history = await CustomerModel.getHistory(req.params.id);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer history' });
    }
};
