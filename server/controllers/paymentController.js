const PaymentModel = require('../models/PaymentModel');

exports.getPaymentsByOrder = async (req, res) => {
    try {
        const payments = await PaymentModel.findByOrderId(req.params.orderId);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.createPayment = async (req, res) => {
    try {
        await PaymentModel.create(req.body);
        res.status(201).json({ message: 'Payment recorded' });
    } catch (error) {
        res.status(500).json({ message: 'Error recording payment' });
    }
};
