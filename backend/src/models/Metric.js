const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema(
  {
    experimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experiment'
    },
    costReductionPercent: {
      type: Number,
      default: 0
    },
    averageResponseTimeMs: {
      type: Number,
      default: 0
    },
    averageUtilizationPercent: {
      type: Number,
      default: 0
    },
    slaViolations: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Metric', metricSchema);
