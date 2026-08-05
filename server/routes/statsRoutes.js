const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/statsController');

router.get('/dashboard', StatsController.getDashboardStats);

module.exports = router;
