const mongoose = require('mongoose');

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
    },
    reason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScalingAction', scalingActionSchema);
