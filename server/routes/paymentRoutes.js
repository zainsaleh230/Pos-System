const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/:orderId', paymentController.getPaymentsByOrder);
router.post('/', paymentController.createPayment);

module.exports = router;
