const express = require('express');

const { getDatasets, uploadDataset } = require('../controllers/datasetController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getDatasets);
router.post('/upload', upload.single('file'), uploadDataset);

module.exports = router;
