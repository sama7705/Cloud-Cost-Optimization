const Prediction = require('../models/Prediction');

async function listPredictions() {
  return Prediction.find().sort({ createdAt: -1 });
}

async function createPrediction(payload) {
  return Prediction.create(payload);
}

module.exports = {
  listPredictions,
  createPrediction
};
