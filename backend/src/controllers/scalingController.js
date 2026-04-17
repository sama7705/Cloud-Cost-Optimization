const scalingService = require('../services/scalingService');

async function getScalingHistory(req, res, next) {
  try {
    const actions = await scalingService.listScalingActions();
    res.json({ success: true, data: actions });
  } catch (error) {
    next(error);
  }
}

async function evaluateScaling(req, res, next) {
  try {
    const result = await scalingService.evaluateScaling(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getScalingHistory,
  evaluateScaling
};
