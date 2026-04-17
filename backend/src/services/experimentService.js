const Experiment = require('../models/Experiment');

async function listExperiments() {
  return Experiment.find().sort({ createdAt: -1 });
}

async function createExperiment(payload) {
  return Experiment.create(payload);
}

module.exports = {
  listExperiments,
  createExperiment
};
