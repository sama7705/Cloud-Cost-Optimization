const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res, next) {
  try {
    const overview = await dashboardService.getDashboardOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard
};
