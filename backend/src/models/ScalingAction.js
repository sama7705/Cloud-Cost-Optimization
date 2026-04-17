const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    summary: { type: String, required: true }
  },
  { _id: false }
);

const executionResultSchema = new mongoose.Schema(
  {
    status: { type: String, default: 'simulated' },
    action: { type: String, enum: ['scale_up', 'scale_down', 'no_action'], required: true },
    previousInstances: { type: Number, required: true },
    newInstances: { type: Number, required: true },
    simulationNote: { type: String, default: '' },
    executedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const scalingActionSchema = new mongoose.Schema(
  {
    experimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experiment'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    inputMetrics: {
      cpuUsage: { type: Number, default: 0 },
      memoryUsage: { type: Number, default: 0 },
      requestCount: { type: Number, default: 0 },
      responseTime: { type: Number, default: null }
    },
    predictedWorkload: {
      cpuUsage: { type: Number, default: null },
      memoryUsage: { type: Number, default: null },
      requestCount: { type: Number, default: null },
      responseTime: { type: Number, default: null },
      values: [{ type: Number }]
    },
    decision: {
      type: String,
      enum: ['scale_up', 'scale_down', 'no_action'],
      required: true
    },
    targetInstances: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    estimatedCostImpact: {
      type: impactSchema,
      required: true
    },
    estimatedPerformanceImpact: {
      type: impactSchema,
      required: true
    },
    estimatedSlaImpact: {
      type: impactSchema,
      required: true
    },
    executionResult: {
      type: executionResultSchema,
      required: true
    },

    // Backward-compatible fields used by earlier API response and existing records.
    action: {
      type: String,
      enum: ['scale_up', 'scale_down', 'no_action'],
      required: true
    },
    fromInstances: {
      type: Number,
      required: true
    },
    toInstances: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScalingAction', scalingActionSchema);
