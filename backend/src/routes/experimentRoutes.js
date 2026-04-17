const express = require('express');
const { getExperiments, createExperiment } = require('../controllers/experimentController');

const router = express.Router();

router.get('/', getExperiments);
router.post('/', createExperiment);

module.exports = router;
