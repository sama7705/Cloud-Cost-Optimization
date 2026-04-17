const Metric = require('../models/Metric');

async function listMetrics() {
  return Metric.find().sort({ createdAt: -1 });
}

async function createMetric(payload) {
  return Metric.create(payload);
}

module.exports = {
  listMetrics,
  createMetric
};
