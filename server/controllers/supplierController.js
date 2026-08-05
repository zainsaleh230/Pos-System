const SupplierModel = require('../models/SupplierModel');

exports.listSuppliers = async (req, res) => {
    try {
        const suppliers = await SupplierModel.findAll();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers' });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        await SupplierModel.create(req.body);
        res.status(201).json({ message: 'Supplier created' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating supplier' });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const success = await SupplierModel.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating supplier' });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const success = await SupplierModel.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete supplier with associated products' });
        }
        res.status(500).json({ message: 'Error deleting supplier' });
    }
};
