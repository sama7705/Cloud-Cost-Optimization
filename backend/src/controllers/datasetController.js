const datasetService = require('../services/datasetService');

async function getDatasets(req, res, next) {
  try {
    const datasets = await datasetService.listDatasets();
    res.json({ success: true, data: datasets });
  } catch (error) {
    next(error);
  }
}

async function createDataset(req, res, next) {
  try {
    const { name, sourceFile, description } = req.body;

    const dataset = await datasetService.createDataset({
      name,
      sourceFile,
      description
    });

    res.status(201).json({ success: true, data: dataset });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDatasets,
  createDataset
};
