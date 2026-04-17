const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true
    },
    policyType: {
      type: String,
      enum: ['baseline', 'predictive'],
      default: 'predictive'
    },
    status: {
      type: String,
      enum: ['draft', 'running', 'completed', 'failed'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experiment', experimentSchema);
