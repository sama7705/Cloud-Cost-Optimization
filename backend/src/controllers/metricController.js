const metricHistoryService = require('../services/metricHistoryService');

async function getMetricHistory(req, res, next) {
  try {
    const { datasetId } = req.query;
    const metrics = await metricHistoryService.getMetricHistory(datasetId);

    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMetricHistory
};
