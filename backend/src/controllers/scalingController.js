const scalingService = require('../services/scalingService');

async function getScalingActions(req, res, next) {
  try {
    const actions = await scalingService.listScalingActions();
    res.json({ success: true, data: actions });
  } catch (error) {
    next(error);
  }
}

async function runScaling(req, res, next) {
  try {
    const result = await scalingService.runScalingDecision(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getScalingActions,
  runScaling
};
