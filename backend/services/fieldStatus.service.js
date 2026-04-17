/**
 * Computes the field status based on current stage and last update date.
 * @param {string} currentStage - PLANTED, GROWING, READY, HARVESTED
 * @param {Date} lastUpdateDate - Timestamp of the most recent update (or creation date)
 * @returns {string} - 'Active', 'At Risk', or 'Completed'
 */
const computeFieldStatus = (currentStage, lastUpdateDate) => {
  if (currentStage === 'HARVESTED') {
    return 'Completed';
  }

  const today = new Date();
  const lastUpdate = new Date(lastUpdateDate);
  const diffTime = today - lastUpdate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // If more than 7 days since last update, field is at risk
  if (diffDays > 7) {
    return 'At Risk';
  }

  return 'Active';
};

module.exports = { computeFieldStatus };