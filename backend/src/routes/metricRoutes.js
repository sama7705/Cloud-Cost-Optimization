const express = require('express');

const { getMetricHistory } = require('../controllers/metricController');

const router = express.Router();

router.get('/history', getMetricHistory);

module.exports = router;
