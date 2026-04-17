const Dataset = require('../models/Dataset');

async function listDatasets() {
  return Dataset.find().sort({ createdAt: -1 });
}

async function createDataset(payload) {
  return Dataset.create(payload);
}

module.exports = {
  listDatasets,
  createDataset
};
