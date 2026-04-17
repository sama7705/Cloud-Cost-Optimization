const mongoose = require('mongoose');

const metricRecordSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DatasetMetadata',
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    cpuUsage: {
      type: Number,
      required: true,
      min: 0
    },
    memoryUsage: {
      type: Number,
      required: true,
      min: 0
    },
    requestCount: {
      type: Number,
      min: 0,
      default: null
    },
    responseTime: {
      type: Number,
      min: 0,
      default: null
    },
    activeInstances: {
      type: Number,
      min: 0,
      default: null
    },
    networkTraffic: {
      type: Number,
      min: 0,
      default: null
    },
    hourOfDay: {
      type: Number,
      min: 0,
      max: 23,
      required: true
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true
    }
  },
  { timestamps: true }
);

metricRecordSchema.index({ datasetId: 1, timestamp: 1 });

module.exports = mongoose.model('MetricRecord', metricRecordSchema);
