const express = require('express');
const { getScalingActions, runScaling } = require('../controllers/scalingController');
const validateRequest = require('../middleware/validateRequest');
const { scalingRunSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', getScalingActions);
router.post('/run', validateRequest(scalingRunSchema), runScaling);

module.exports = router;
