const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sourceFile: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['uploaded', 'processed'],
      default: 'uploaded'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dataset', datasetSchema);
