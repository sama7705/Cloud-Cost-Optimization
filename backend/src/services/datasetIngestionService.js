const mongoose = require('mongoose');

const DatasetMetadata = require('../models/DatasetMetadata');
const MetricRecord = require('../models/MetricRecord');
const {
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  parseCsvFile,
  ensureRequiredColumns,
  removeFileIfExists,
  buildStorageFileName
} = require('./csvParsingService');

async function uploadDataset(file) {
  if (!file) {
    const error = new Error('CSV file is required. Please upload using field name "file".');
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { detectedColumns, cleanedRecords, invalidRowsRemoved, missingValues } = await parseCsvFile(file.path);

    ensureRequiredColumns(detectedColumns);

    if (cleanedRecords.length === 0) {
      const error = new Error('No valid rows found after CSV validation and cleaning.');
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
          invalidRowsRemoved,
          missingValues
        }
      ],
      { session }
    );

    const recordsToInsert = cleanedRecords.map((record) => ({
      ...record,
      datasetId: datasetMetadata._id
    }));

    await MetricRecord.insertMany(recordsToInsert, { session, ordered: false });

    await session.commitTransaction();

    return {
      datasetId: datasetMetadata._id,
      rowCount: datasetMetadata.rowCount,
      detectedColumns: datasetMetadata.detectedColumns,
      missingValues: Object.fromEntries(datasetMetadata.missingValues),
      invalidRowsRemoved: datasetMetadata.invalidRowsRemoved
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

module.exports = {
  uploadDataset,
  listDatasets
};
