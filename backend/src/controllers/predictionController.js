const predictionService = require('../services/predictionService');

async function getPredictions(req, res, next) {
  try {
    const predictions = await predictionService.listPredictions();
    res.json({ success: true, data: predictions });
  } catch (error) {
    next(error);
  }
}

async function createPrediction(req, res, next) {
  try {
    const prediction = await predictionService.createPrediction(req.body);
    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPredictions,
  createPrediction
};
