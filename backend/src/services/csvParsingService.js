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

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTimestamp(value) {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const cleanedRecords = [];
    const missingValues = {};
    let detectedColumns = [];
    let invalidRowsRemoved = 0;

    const stream = fs.createReadStream(filePath).pipe(csv());

    stream.on('headers', (headers) => {
      detectedColumns = headers.map((header) => header.trim());
      SUPPORTED_COLUMNS.forEach((column) => {
        missingValues[column] = 0;
      });
    });

    stream.on('data', (row) => {
      const normalizedRow = normalizeRow(row);

      SUPPORTED_COLUMNS.forEach((column) => {
        if (isMissingValue(normalizedRow[column])) {
          missingValues[column] += 1;
        }
      });

      const timestamp = parseTimestamp(normalizedRow.timestamp);
      const cpuUsage = toNumber(normalizedRow.cpuUsage);
      const memoryUsage = toNumber(normalizedRow.memoryUsage);

      const requiredRowValid = Boolean(timestamp) && cpuUsage !== null && cpuUsage >= 0 && memoryUsage !== null && memoryUsage >= 0;

      if (!requiredRowValid) {
        invalidRowsRemoved += 1;
        return;
      }

      const requestCount = toNumber(normalizedRow.requestCount);
      const responseTime = toNumber(normalizedRow.responseTime);
      const activeInstances = toNumber(normalizedRow.activeInstances);
      const networkTraffic = toNumber(normalizedRow.networkTraffic);

      cleanedRecords.push({
        timestamp,
        cpuUsage,
        memoryUsage,
        requestCount: requestCount !== null && requestCount >= 0 ? requestCount : null,
        responseTime: responseTime !== null && responseTime >= 0 ? responseTime : null,
        activeInstances: activeInstances !== null && activeInstances >= 0 ? activeInstances : null,
        networkTraffic: networkTraffic !== null && networkTraffic >= 0 ? networkTraffic : null
      });
    });

    stream.on('end', () => {
      resolve({
        detectedColumns,
        cleanedRecords,
        invalidRowsRemoved,
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
