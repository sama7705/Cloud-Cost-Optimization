const express = require('express');
const { getDatasets, createDataset } = require('../controllers/datasetController');

const router = express.Router();

router.get('/', getDatasets);
router.post('/', createDataset);

module.exports = router;
