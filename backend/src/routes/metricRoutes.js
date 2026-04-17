const express = require('express');
const { getMetrics, createMetric } = require('../controllers/metricController');
const validateRequest = require('../middleware/validateRequest');
const { metricCreateSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', getMetrics);
router.post('/', validateRequest(metricCreateSchema), createMetric);

module.exports = router;
