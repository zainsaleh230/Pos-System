const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrderDetails);
router.post('/', orderController.createOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
