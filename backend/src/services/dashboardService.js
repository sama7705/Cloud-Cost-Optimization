const Dataset = require('../models/Dataset');
const Experiment = require('../models/Experiment');
const Metric = require('../models/Metric');
const Prediction = require('../models/Prediction');

async function getDashboardOverview() {
  const [datasets, experiments, predictions, metrics] = await Promise.all([
    Dataset.countDocuments(),
    Experiment.countDocuments(),
    Prediction.countDocuments(),
    Metric.find().sort({ createdAt: -1 }).limit(5)
  ]);

  return {
    totalDatasets: datasets,
    totalExperiments: experiments,
    totalPredictions: predictions,
    latestMetrics: metrics
  };
}

module.exports = {
  getDashboardOverview
};
