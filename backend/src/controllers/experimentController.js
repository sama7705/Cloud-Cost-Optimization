const experimentService = require('../services/experimentService');

async function getExperiments(req, res, next) {
  try {
    const experiments = await experimentService.listExperiments();
    res.json({ success: true, data: experiments });
  } catch (error) {
    next(error);
  }
}

async function createExperiment(req, res, next) {
  try {
    const experiment = await experimentService.createExperiment(req.body);
    res.status(201).json({ success: true, data: experiment });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExperiments,
  createExperiment
};
