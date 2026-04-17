const express = require('express');
const { getDatasets, createDataset } = require('../controllers/datasetController');
const validateRequest = require('../middleware/validateRequest');
const { datasetCreateSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', getDatasets);
router.post('/', validateRequest(datasetCreateSchema), createDataset);

module.exports = router;
