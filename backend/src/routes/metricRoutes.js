const express = require('express');
const { getMetrics, createMetric } = require('../controllers/metricController');

const router = express.Router();

router.get('/', getMetrics);
router.post('/', createMetric);

module.exports = router;
