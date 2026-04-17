function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function executeLocalScalingDecision({
  currentInstances,
  targetInstances,
  minInstances = 1,
  maxInstances = 10
}) {
  const safeCurrentInstances = Math.max(1, Number(currentInstances) || 1);
  const safeTargetInstances = clamp(Math.round(Number(targetInstances) || safeCurrentInstances), minInstances, maxInstances);

  const action =
    safeTargetInstances > safeCurrentInstances
      ? 'scale_up'
      : safeTargetInstances < safeCurrentInstances
        ? 'scale_down'
        : 'no_action';

  return {
    status: 'simulated',
    action,
    previousInstances: safeCurrentInstances,
    newInstances: safeTargetInstances,
    simulationNote: `Local simulation applied: ${safeCurrentInstances} -> ${safeTargetInstances} instances`,
    executedAt: new Date()
  };
}

module.exports = {
  executeLocalScalingDecision
};
