const express = require('express');
const { getPredictions, createPrediction } = require('../controllers/predictionController');
const validateRequest = require('../middleware/validateRequest');
const { predictionCreateSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', getPredictions);
router.post('/', validateRequest(predictionCreateSchema), createPrediction);

module.exports = router;
