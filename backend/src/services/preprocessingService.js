const { REQUIRED_COLUMNS, OPTIONAL_COLUMNS } = require('./csvParsingService');

const NUMERIC_COLUMNS = [...REQUIRED_COLUMNS.filter((col) => col !== 'timestamp'), ...OPTIONAL_COLUMNS];

function isMissingValue(value) {
  return value === '' || value === null || value === undefined;
}

function toNumber(value) {
  if (isMissingValue(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTimestamp(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeRow(rawRow) {
  const normalized = {};

  Object.entries(rawRow).forEach(([key, value]) => {
    normalized[key.trim()] = typeof value === 'string' ? value.trim() : value;
  });

  return normalized;
}

function buildDuplicateKey(record) {
  const values = [
    record.timestamp.toISOString(),
    record.cpuUsage,
    record.memoryUsage,
    record.requestCount,
    record.responseTime,
    record.activeInstances,
    record.networkTraffic
  ];

  return values.join('|');
}

function computeColumnStats(records) {
  const stats = {};

  NUMERIC_COLUMNS.forEach((column) => {
    const values = records
      .map((record) => record[column])
      .filter((value) => value !== null && Number.isFinite(value));

    if (values.length === 0) {
      stats[column] = { mean: 0, min: 0, max: 0 };
      return;
    }

    const sum = values.reduce((acc, value) => acc + value, 0);
    stats[column] = {
      mean: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });

  return stats;
}

function preprocessRows(rawRows, options = {}) {
  const normalizeForMl = Boolean(options.normalizeForMl);

  const summary = {
    inputRowCount: rawRows.length,
    invalidTimestampRowsRemoved: 0,
    duplicateRowsRemoved: 0,
    missingValuesFilled: {},
    numericConversionIssues: {},
    sortedByTimestamp: true,
    normalizationApplied: normalizeForMl,
    featureEngineering: ['hourOfDay', 'dayOfWeek'],
    outputRowCount: 0
  };

  NUMERIC_COLUMNS.forEach((column) => {
    summary.missingValuesFilled[column] = 0;
    summary.numericConversionIssues[column] = 0;
  });

  const parsedRows = [];

  rawRows.forEach((rawRow) => {
    const row = normalizeRow(rawRow);
    const timestamp = parseTimestamp(row.timestamp);

    if (!timestamp) {
      summary.invalidTimestampRowsRemoved += 1;
      return;
    }

    const parsed = {
      timestamp,
      hourOfDay: timestamp.getUTCHours(),
      dayOfWeek: timestamp.getUTCDay()
    };

    NUMERIC_COLUMNS.forEach((column) => {
      const rawValue = row[column];
      const numericValue = toNumber(rawValue);

      if (isMissingValue(rawValue)) {
        parsed[column] = null;
        return;
      }

      if (numericValue === null || numericValue < 0) {
        summary.numericConversionIssues[column] += 1;
        parsed[column] = null;
        return;
      }

      parsed[column] = numericValue;
    });

    parsedRows.push(parsed);
  });

  parsedRows.sort((a, b) => a.timestamp - b.timestamp);

  const deduplicated = [];
  const seen = new Set();

  parsedRows.forEach((record) => {
    const key = buildDuplicateKey(record);

    if (seen.has(key)) {
      summary.duplicateRowsRemoved += 1;
      return;
    }

    seen.add(key);
    deduplicated.push(record);
  });

  const columnStats = computeColumnStats(deduplicated);

  deduplicated.forEach((record) => {
    NUMERIC_COLUMNS.forEach((column) => {
      if (record[column] === null) {
        record[column] = columnStats[column].mean;
        summary.missingValuesFilled[column] += 1;
      }
    });
  });

  if (normalizeForMl) {
    deduplicated.forEach((record) => {
      NUMERIC_COLUMNS.forEach((column) => {
        const { min, max } = columnStats[column];
        const denominator = max - min;

        if (denominator === 0) {
          record[`${column}Normalized`] = 0;
          return;
        }

        record[`${column}Normalized`] = (record[column] - min) / denominator;
      });
    });
  }

  summary.outputRowCount = deduplicated.length;

  return {
    cleanedRecords: deduplicated,
    summary
  };
}

module.exports = {
  preprocessRows,
  NUMERIC_COLUMNS,
  isMissingValue
};
