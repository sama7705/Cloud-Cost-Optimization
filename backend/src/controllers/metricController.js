const metricService = require('../services/metricService');

async function getMetrics(req, res, next) {
  try {
    const metrics = await metricService.listMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
}

async function createMetric(req, res, next) {
  try {
    const metric = await metricService.createMetric(req.body);
    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMetrics,
  createMetric
};
