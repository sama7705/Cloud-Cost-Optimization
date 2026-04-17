const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const REQUIRED_COLUMNS = ['timestamp', 'cpuUsage', 'memoryUsage'];
const OPTIONAL_COLUMNS = ['requestCount', 'responseTime', 'activeInstances', 'networkTraffic'];
const SUPPORTED_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

function normalizeRow(rawRow) {
  const normalized = {};

  Object.entries(rawRow).forEach(([key, value]) => {
    normalized[key.trim()] = typeof value === 'string' ? value.trim() : value;
  });

  return normalized;
}

function isMissingValue(value) {
  return value === '' || value === null || value === undefined;
}

function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const rawRows = [];
    const missingValues = {};
    let detectedColumns = [];

    const stream = fs.createReadStream(filePath).pipe(csv());

    stream.on('headers', (headers) => {
      detectedColumns = headers.map((header) => header.trim());
      SUPPORTED_COLUMNS.forEach((column) => {
        missingValues[column] = 0;
      });
    });

    stream.on('data', (row) => {
      const normalizedRow = normalizeRow(row);
      rawRows.push(normalizedRow);

      SUPPORTED_COLUMNS.forEach((column) => {
        if (isMissingValue(normalizedRow[column])) {
          missingValues[column] += 1;
        }
      });
    });

    stream.on('end', () => {
      resolve({
        detectedColumns,
        rawRows,
        missingValues
      });
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

function ensureRequiredColumns(detectedColumns) {
  const missingRequiredColumns = REQUIRED_COLUMNS.filter(
    (column) => !detectedColumns.includes(column)
  );

  if (missingRequiredColumns.length > 0) {
    const error = new Error(`CSV is missing required columns: ${missingRequiredColumns.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
}

function removeFileIfExists(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function buildStorageFileName(filePath) {
  return path.basename(filePath);
}

module.exports = {
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  parseCsvFile,
  ensureRequiredColumns,
  removeFileIfExists,
  buildStorageFileName
};
