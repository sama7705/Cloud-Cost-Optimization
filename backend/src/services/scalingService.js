const ScalingAction = require('../models/ScalingAction');
const { simulateScaling } = require('../modules/execution/executionEngine');

async function listScalingActions() {
  return ScalingAction.find().sort({ createdAt: -1 });
}

async function runScalingDecision(payload) {
  const decision = simulateScaling(payload);
  const savedAction = await ScalingAction.create(decision);

  return {
    decision,
    savedAction
  };
}

module.exports = {
  listScalingActions,
  runScalingDecision
};
