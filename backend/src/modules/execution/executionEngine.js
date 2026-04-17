function simulateScaling({ currentInstances = 2, predictedLoad = 0, scaleUpThreshold = 70, scaleDownThreshold = 30, maxInstances = 10, minInstances = 1 }) {
  let action = 'no_action';
  let toInstances = currentInstances;

  if (predictedLoad > scaleUpThreshold && currentInstances < maxInstances) {
    action = 'scale_up';
    toInstances = currentInstances + 1;
  } else if (predictedLoad < scaleDownThreshold && currentInstances > minInstances) {
    action = 'scale_down';
    toInstances = currentInstances - 1;
  }

  return {
    action,
    fromInstances: currentInstances,
    toInstances,
    reason: `Predicted load: ${predictedLoad}%`
  };
}

module.exports = { simulateScaling };
