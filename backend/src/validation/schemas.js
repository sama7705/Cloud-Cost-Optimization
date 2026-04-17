const datasetCreateSchema = [
  { field: 'name', required: true, type: 'string' },
  { field: 'sourceFile', required: true, type: 'string' },
  { field: 'description', required: false, type: 'string' }
];

const metricCreateSchema = [
  { field: 'experimentId', required: false, type: 'objectId' },
  { field: 'costReductionPercent', required: false, type: 'number' },
  { field: 'averageResponseTimeMs', required: false, type: 'number', min: 0 },
  { field: 'averageUtilizationPercent', required: false, type: 'number', min: 0 },
  { field: 'slaViolations', required: false, type: 'number', min: 0 }
];

const predictionCreateSchema = [
  { field: 'datasetId', required: true, type: 'objectId' },
  { field: 'modelVersion', required: false, type: 'string' },
  { field: 'horizonMinutes', required: false, type: 'number', min: 1 },
  { field: 'values', required: false, type: 'array' },
  { field: 'notes', required: false, type: 'string' }
];

const scalingEvaluateSchema = [
  { field: 'cpuUsage', required: true, type: 'number', min: 0 },
  { field: 'memoryUsage', required: true, type: 'number', min: 0 },
  { field: 'requestCount', required: true, type: 'number', min: 0 },
  { field: 'responseTime', required: false, type: 'number', min: 0 },
  { field: 'activeInstances', required: false, type: 'number', min: 1 },
  { field: 'currentInstances', required: false, type: 'number', min: 1 },
  { field: 'predictedLoad', required: false, type: 'number', min: 0 },
  { field: 'minInstances', required: false, type: 'number', min: 1 },
  { field: 'maxInstances', required: false, type: 'number', min: 1 },
  { field: 'targetCpuPerInstance', required: false, type: 'number', min: 1 },
  { field: 'targetMemoryPerInstance', required: false, type: 'number', min: 1 },
  { field: 'targetRequestsPerInstance', required: false, type: 'number', min: 1 },
  { field: 'responseTimeScaleUpMs', required: false, type: 'number', min: 1 },
  { field: 'responseTimeScaleDownMs', required: false, type: 'number', min: 1 }
];

const experimentCreateSchema = [
  { field: 'name', required: true, type: 'string' },
  { field: 'datasetId', required: true, type: 'objectId' },
  { field: 'policyType', required: false, type: 'string', enum: ['baseline', 'predictive'] },
  { field: 'status', required: false, type: 'string', enum: ['draft', 'running', 'completed', 'failed'] }
];

module.exports = {
  datasetCreateSchema,
  metricCreateSchema,
  predictionCreateSchema,
  scalingEvaluateSchema,
  experimentCreateSchema
};
