const mongoose = require('mongoose');

const DatasetMetadata = require('../models/DatasetMetadata');
const MetricRecord = require('../models/MetricRecord');
const { preprocessRows } = require('./preprocessingService');
const {
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  parseCsvFile,
  ensureRequiredColumns,
  removeFileIfExists,
  buildStorageFileName
} = require('./csvParsingService');

function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }

  return false;
}

async function uploadDataset(file, options = {}) {
  if (!file) {
    const error = new Error('CSV file is required. Please upload using field name "file".');
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { detectedColumns, rawRows, missingValues } = await parseCsvFile(file.path);

    ensureRequiredColumns(detectedColumns);

    const { cleanedRecords, summary } = preprocessRows(rawRows, {
      normalizeForMl: parseBoolean(options.normalizeForMl)
    });

    if (cleanedRecords.length === 0) {
      const error = new Error('No valid rows found after preprocessing.');
      error.statusCode = 400;
      throw error;
    }

    const [datasetMetadata] = await DatasetMetadata.create(
      [
        {
          originalFileName: file.originalname,
          storageFileName: buildStorageFileName(file.path),
          detectedColumns,
          requiredColumns: REQUIRED_COLUMNS,
          optionalColumns: OPTIONAL_COLUMNS.filter((column) => detectedColumns.includes(column)),
          rowCount: cleanedRecords.length,
          invalidRowsRemoved: summary.invalidTimestampRowsRemoved + summary.duplicateRowsRemoved,
          missingValues,
          preprocessingReport: summary
        }
      ],
      { session }
    );

    const recordsToInsert = cleanedRecords.map((record) => ({
      datasetId: datasetMetadata._id,
      timestamp: record.timestamp,
      cpuUsage: record.cpuUsage,
      memoryUsage: record.memoryUsage,
      requestCount: record.requestCount,
      responseTime: record.responseTime,
      activeInstances: record.activeInstances,
      networkTraffic: record.networkTraffic,
      hourOfDay: record.hourOfDay,
      dayOfWeek: record.dayOfWeek
    }));

    await MetricRecord.insertMany(recordsToInsert, { session, ordered: false });

    await session.commitTransaction();

    return {
      datasetId: datasetMetadata._id,
      rowCount: datasetMetadata.rowCount,
      detectedColumns: datasetMetadata.detectedColumns,
      missingValues: Object.fromEntries(datasetMetadata.missingValues),
      invalidRowsRemoved: datasetMetadata.invalidRowsRemoved,
      preprocessingReport: datasetMetadata.preprocessingReport
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
    removeFileIfExists(file.path);
  }
}

async function listDatasets() {
  return DatasetMetadata.find().sort({ createdAt: -1 });
}

async function getPreprocessingReport(datasetId) {
  if (!mongoose.Types.ObjectId.isValid(datasetId)) {
    const error = new Error('Invalid dataset id.');
    error.statusCode = 400;
    throw error;
  }

  const dataset = await DatasetMetadata.findById(datasetId).select('preprocessingReport rowCount originalFileName createdAt');

  if (!dataset) {
    const error = new Error('Dataset not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    datasetId,
    originalFileName: dataset.originalFileName,
    rowCount: dataset.rowCount,
    createdAt: dataset.createdAt,
    preprocessingReport: dataset.preprocessingReport || null
  };
}

module.exports = {
  uploadDataset,
  listDatasets,
  getPreprocessingReport
};
