const express = require('express');

const healthRoutes = require('./healthRoutes');
const datasetRoutes = require('./datasetRoutes');
const metricRoutes = require('./metricRoutes');
const predictionRoutes = require('./predictionRoutes');
const scalingRoutes = require('./scalingRoutes');
const experimentRoutes = require('./experimentRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/datasets', datasetRoutes);
router.use('/metrics', metricRoutes);
router.use('/predictions', predictionRoutes);
router.use('/scaling', scalingRoutes);
router.use('/experiments', experimentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
