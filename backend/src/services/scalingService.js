const ScalingAction = require('../models/ScalingAction');
const { executeLocalScalingDecision } = require('../modules/execution/executionEngine');

const DEFAULT_CONFIG = {
  minInstances: 1,
  maxInstances: 10,
  targetCpuPerInstance: 65,
  targetMemoryPerInstance: 70,
  targetRequestsPerInstance: 120,
  responseTimeScaleUpMs: 450,
  responseTimeScaleDownMs: 220
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePredictedWorkload(predictedWorkload = {}, fallbackRequestCount = 0) {
  if (Array.isArray(predictedWorkload)) {
    const numericValues = predictedWorkload.map((value) => toNumber(value, 0));
    const avg = numericValues.length > 0 ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length : fallbackRequestCount;

    return {
      cpuUsage: null,
      memoryUsage: null,
      requestCount: Math.round(avg),
      responseTime: null,
      values: numericValues
    };
  }

  const valuesArray = Array.isArray(predictedWorkload.values)
    ? predictedWorkload.values.map((value) => toNumber(value, 0))
    : [];

  return {
    cpuUsage: predictedWorkload.cpuUsage != null ? toNumber(predictedWorkload.cpuUsage, null) : null,
    memoryUsage: predictedWorkload.memoryUsage != null ? toNumber(predictedWorkload.memoryUsage, null) : null,
    requestCount: predictedWorkload.requestCount != null ? toNumber(predictedWorkload.requestCount, null) : null,
    responseTime: predictedWorkload.responseTime != null ? toNumber(predictedWorkload.responseTime, null) : null,
    values: valuesArray
  };
}

function evaluateDecision({ inputMetrics, predictedWorkload, activeInstances, config }) {
  const currentInstances = Math.max(config.minInstances, Math.round(activeInstances));

  const currentCpu = toNumber(inputMetrics.cpuUsage, 0);
  const currentMemory = toNumber(inputMetrics.memoryUsage, 0);
  const currentRequestCount = toNumber(inputMetrics.requestCount, 0);
  const currentResponseTime = inputMetrics.responseTime == null ? null : toNumber(inputMetrics.responseTime, null);

  const predictedCpu = predictedWorkload.cpuUsage == null ? null : toNumber(predictedWorkload.cpuUsage, null);
  const predictedMemory = predictedWorkload.memoryUsage == null ? null : toNumber(predictedWorkload.memoryUsage, null);
  const predictedRequestCount =
    predictedWorkload.requestCount != null
      ? toNumber(predictedWorkload.requestCount, 0)
      : predictedWorkload.values.length > 0
        ? predictedWorkload.values.reduce((sum, value) => sum + value, 0) / predictedWorkload.values.length
        : currentRequestCount;
  const predictedResponseTime = predictedWorkload.responseTime == null ? null : toNumber(predictedWorkload.responseTime, null);

  const cpuPressure = Math.max(currentCpu, predictedCpu ?? currentCpu);
  const memoryPressure = Math.max(currentMemory, predictedMemory ?? currentMemory);
  const requestPressure = (predictedRequestCount / Math.max(1, currentInstances)) / config.targetRequestsPerInstance;
  const responsePressure = Math.max(
    currentResponseTime != null ? currentResponseTime / config.responseTimeScaleUpMs : 0,
    predictedResponseTime != null ? predictedResponseTime / config.responseTimeScaleUpMs : 0
  );

  const scaleUpSignals = [];
  const scaleDownSignals = [];

  if (cpuPressure >= 80) scaleUpSignals.push(`CPU pressure is high (${cpuPressure.toFixed(1)}%)`);
  if (memoryPressure >= 80) scaleUpSignals.push(`Memory pressure is high (${memoryPressure.toFixed(1)}%)`);
  if (requestPressure >= 1.2) {
    scaleUpSignals.push(`Predicted requests per instance (${(predictedRequestCount / Math.max(1, currentInstances)).toFixed(1)}) exceed target (${config.targetRequestsPerInstance})`);
  }
  if (responsePressure >= 1) {
    const slowResponse = Math.max(currentResponseTime ?? 0, predictedResponseTime ?? 0);
    scaleUpSignals.push(`Response time pressure is high (${slowResponse.toFixed(0)}ms)`);
  }

  if (cpuPressure <= 45) scaleDownSignals.push(`CPU pressure is low (${cpuPressure.toFixed(1)}%)`);
  if (memoryPressure <= 50) scaleDownSignals.push(`Memory pressure is low (${memoryPressure.toFixed(1)}%)`);
  if (requestPressure <= 0.65) {
    scaleDownSignals.push(`Predicted requests per instance (${(predictedRequestCount / Math.max(1, currentInstances)).toFixed(1)}) are below target (${config.targetRequestsPerInstance})`);
  }
  if ((currentResponseTime != null || predictedResponseTime != null) && Math.max(currentResponseTime ?? 0, predictedResponseTime ?? 0) <= config.responseTimeScaleDownMs) {
    scaleDownSignals.push(`Response time is healthy (<= ${config.responseTimeScaleDownMs}ms)`);
  }

  let decision = 'no_action';
  let targetInstances = currentInstances;
  let reason = 'Current and predicted load are balanced for current capacity.';

  const demandEstimate = Math.max(
    Math.ceil(predictedRequestCount / config.targetRequestsPerInstance),
    Math.ceil((predictedCpu ?? currentCpu) / config.targetCpuPerInstance),
    Math.ceil((predictedMemory ?? currentMemory) / config.targetMemoryPerInstance),
    1
  );

  if (scaleUpSignals.length > 0 && currentInstances < config.maxInstances) {
    decision = 'scale_up';
    targetInstances = clamp(Math.max(currentInstances + 1, demandEstimate), config.minInstances, config.maxInstances);
    reason = scaleUpSignals.join('; ');
  } else if (scaleDownSignals.length >= 3 && currentInstances > config.minInstances) {
    decision = 'scale_down';
    targetInstances = clamp(Math.min(currentInstances - 1, demandEstimate), config.minInstances, config.maxInstances);
    reason = scaleDownSignals.join('; ');
  }

  if (decision === 'scale_up' && targetInstances === currentInstances) {
    reason = `${reason}; already at max safe capacity based on policy constraints.`;
  }
  if (decision === 'scale_down' && targetInstances === currentInstances) {
    reason = `${reason}; already at minimum safe capacity based on policy constraints.`;
  }

  return {
    decision,
    targetInstances,
    reason,
    metadata: {
      currentInstances,
      demandEstimate,
      cpuPressure,
      memoryPressure,
      requestPressure,
      responsePressure
    }
  };
}

function estimateImpacts({ decision, currentInstances, targetInstances }) {
  const diff = targetInstances - currentInstances;

  if (decision === 'scale_up') {
    return {
      estimatedCostImpact: {
        type: 'increase',
        summary: `Estimated cost increase of ~${Math.max(5, diff * 8)}% due to ${Math.abs(diff)} additional instance(s).`
      },
      estimatedPerformanceImpact: {
        type: 'improve',
        summary: 'Expected lower response latency and better throughput under predicted load.'
      },
      estimatedSlaImpact: {
        type: 'reduce_risk',
        summary: 'Lower risk of SLA breaches during upcoming traffic increase.'
      }
    };
  }

  if (decision === 'scale_down') {
    return {
      estimatedCostImpact: {
        type: 'decrease',
        summary: `Estimated cost reduction of ~${Math.max(4, Math.abs(diff) * 7)}% by removing ${Math.abs(diff)} instance(s).`
      },
      estimatedPerformanceImpact: {
        type: 'neutral_to_slight_degrade',
        summary: 'Minor latency increase is possible, but still expected within healthy utilization levels.'
      },
      estimatedSlaImpact: {
        type: 'monitor',
        summary: 'SLA should remain stable if predicted workload remains accurate.'
      }
    };
  }

  return {
    estimatedCostImpact: {
      type: 'neutral',
      summary: 'No significant cost change expected because instance count remains unchanged.'
    },
    estimatedPerformanceImpact: {
      type: 'neutral',
      summary: 'Performance is expected to remain stable at the current scale.'
    },
    estimatedSlaImpact: {
      type: 'stable',
      summary: 'No immediate SLA risk change detected.'
    }
  };
}

async function listScalingActions() {
  return ScalingAction.find().sort({ createdAt: -1 });
}

async function evaluateScaling(payload) {
  const currentActiveInstances = toNumber(payload.activeInstances ?? payload.currentInstances, DEFAULT_CONFIG.minInstances);

  const config = {
    minInstances: Math.max(1, toNumber(payload.minInstances, DEFAULT_CONFIG.minInstances)),
    maxInstances: Math.max(1, toNumber(payload.maxInstances, DEFAULT_CONFIG.maxInstances)),
    targetCpuPerInstance: toNumber(payload.targetCpuPerInstance, DEFAULT_CONFIG.targetCpuPerInstance),
    targetMemoryPerInstance: toNumber(payload.targetMemoryPerInstance, DEFAULT_CONFIG.targetMemoryPerInstance),
    targetRequestsPerInstance: toNumber(payload.targetRequestsPerInstance, DEFAULT_CONFIG.targetRequestsPerInstance),
    responseTimeScaleUpMs: toNumber(payload.responseTimeScaleUpMs, DEFAULT_CONFIG.responseTimeScaleUpMs),
    responseTimeScaleDownMs: toNumber(payload.responseTimeScaleDownMs, DEFAULT_CONFIG.responseTimeScaleDownMs)
  };

  if (config.minInstances > config.maxInstances) {
    const temp = config.minInstances;
    config.minInstances = config.maxInstances;
    config.maxInstances = temp;
  }

  const inputMetrics = {
    cpuUsage: toNumber(payload.cpuUsage, 0),
    memoryUsage: toNumber(payload.memoryUsage, 0),
    requestCount: toNumber(payload.requestCount, 0),
    responseTime: payload.responseTime == null ? null : toNumber(payload.responseTime, null)
  };

  const predictedWorkload = normalizePredictedWorkload(payload.predictedWorkload ?? payload.predictedLoad ?? {}, inputMetrics.requestCount);

  const evaluated = evaluateDecision({
    inputMetrics,
    predictedWorkload,
    activeInstances: currentActiveInstances,
    config
  });

  const impacts = estimateImpacts({
    decision: evaluated.decision,
    currentInstances: evaluated.metadata.currentInstances,
    targetInstances: evaluated.targetInstances
  });

  const executionResult = executeLocalScalingDecision({
    currentInstances: evaluated.metadata.currentInstances,
    targetInstances: evaluated.targetInstances,
    minInstances: config.minInstances,
    maxInstances: config.maxInstances
  });

  const actionPayload = {
    experimentId: payload.experimentId,
    timestamp: new Date(),
    inputMetrics,
    predictedWorkload,
    decision: evaluated.decision,
    targetInstances: executionResult.newInstances,
    reason: evaluated.reason,
    ...impacts,
    executionResult,

    // Backward-compatible fields.
    action: evaluated.decision,
    fromInstances: executionResult.previousInstances,
    toInstances: executionResult.newInstances
  };

  const savedAction = await ScalingAction.create(actionPayload);

  return {
    decision: savedAction.decision,
    targetInstances: savedAction.targetInstances,
    reason: savedAction.reason,
    estimatedCostImpact: savedAction.estimatedCostImpact,
    estimatedPerformanceImpact: savedAction.estimatedPerformanceImpact,
    estimatedSlaImpact: savedAction.estimatedSlaImpact,
    executionResult: savedAction.executionResult,
    config,
    savedAction
  };
}

module.exports = {
  listScalingActions,
  evaluateScaling
};
