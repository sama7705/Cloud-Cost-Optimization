const express = require('express');

const { getDatasets, uploadDataset, getPreprocessingReport } = require('../controllers/datasetController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getDatasets);
router.post('/upload', upload.single('file'), uploadDataset);
router.get('/:id/preprocessing-report', getPreprocessingReport);

module.exports = router;
