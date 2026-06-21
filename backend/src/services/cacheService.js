const { deleteCache } = require("../utils/cache");

async function invalidateDashboardSummary() {
 try {
  await deleteCache("dashboard_summary");
 } catch (err) {
  console.log("Cache invalidation failed", err.message || err);
 }
}

module.exports = {
 invalidateDashboardSummary
};
