const express = require('express');
const { getExperiments, createExperiment } = require('../controllers/experimentController');
const validateRequest = require('../middleware/validateRequest');
const { experimentCreateSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', getExperiments);
router.post('/', validateRequest(experimentCreateSchema), createExperiment);

module.exports = router;
