const express = require('express');
const { getScalingHistory, evaluateScaling } = require('../controllers/scalingController');
const validateRequest = require('../middleware/validateRequest');
const { scalingEvaluateSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/history', getScalingHistory);
router.post('/evaluate', validateRequest(scalingEvaluateSchema), evaluateScaling);

// Backward-compatible aliases
router.get('/', getScalingHistory);
router.post('/run', validateRequest(scalingEvaluateSchema), evaluateScaling);

module.exports = router;
