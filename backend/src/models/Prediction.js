const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true
    },
    modelVersion: {
      type: String,
      default: 'v1'
    },
    horizonMinutes: {
      type: Number,
      default: 60
    },
    values: {
      type: [Number],
      default: []
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
