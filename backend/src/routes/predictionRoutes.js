const express = require('express');
const { getPredictions, createPrediction } = require('../controllers/predictionController');

const router = express.Router();

router.get('/', getPredictions);
router.post('/', createPrediction);

module.exports = router;
