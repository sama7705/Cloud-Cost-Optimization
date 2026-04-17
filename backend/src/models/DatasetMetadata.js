const mongoose = require('mongoose');

const datasetMetadataSchema = new mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: true,
      trim: true
    },
    storageFileName: {
      type: String,
      required: true,
      trim: true
    },
    detectedColumns: {
      type: [String],
      default: []
    },
    requiredColumns: {
      type: [String],
      default: []
    },
    optionalColumns: {
      type: [String],
      default: []
    },
    rowCount: {
      type: Number,
      required: true,
      min: 0
    },
    invalidRowsRemoved: {
      type: Number,
      required: true,
      min: 0
    },
    missingValues: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);

datasetMetadataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DatasetMetadata', datasetMetadataSchema);
