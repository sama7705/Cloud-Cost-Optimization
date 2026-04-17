const express = require('express');
const { getScalingActions, runScaling } = require('../controllers/scalingController');

const router = express.Router();

router.get('/', getScalingActions);
router.post('/run', runScaling);

module.exports = router;
