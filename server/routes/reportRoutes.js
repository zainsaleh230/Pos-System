const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

router.get('/summary', ReportController.getSummaryReport);

module.exports = router;
