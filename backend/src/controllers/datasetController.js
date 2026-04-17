const datasetIngestionService = require('../services/datasetIngestionService');

async function uploadDataset(req, res, next) {
  try {
    const summary = await datasetIngestionService.uploadDataset(req.file, {
      normalizeForMl: req.body?.normalizeForMl ?? req.query?.normalizeForMl
    });

    res.status(201).json({
      success: true,
      message: 'Dataset uploaded and processed successfully.',
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

async function getDatasets(req, res, next) {
  try {
    const datasets = await datasetIngestionService.listDatasets();
    res.json({ success: true, data: datasets });
  } catch (error) {
    next(error);
  }
}

async function getPreprocessingReport(req, res, next) {
  try {
    const report = await datasetIngestionService.getPreprocessingReport(req.params.id);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDataset,
  getDatasets,
  getPreprocessingReport
};
