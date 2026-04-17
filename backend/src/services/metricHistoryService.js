const mongoose = require('mongoose');

const MetricRecord = require('../models/MetricRecord');
const DatasetMetadata = require('../models/DatasetMetadata');

async function getMetricHistory(datasetId) {
  if (!datasetId) {
    const error = new Error('datasetId query parameter is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(datasetId)) {
    const error = new Error('datasetId must be a valid MongoDB ObjectId.');
    error.statusCode = 400;
    throw error;
  }

  const datasetExists = await DatasetMetadata.exists({ _id: datasetId });

  if (!datasetExists) {
    const error = new Error('Dataset not found.');
    error.statusCode = 404;
    throw error;
  }

  return MetricRecord.find({ datasetId }).sort({ timestamp: 1 });
}

module.exports = {
  getMetricHistory
};
