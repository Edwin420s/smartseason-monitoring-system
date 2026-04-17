/**
 * Field Status Calculation Service
 * 
 * Business logic for determining field status based on:
 * - Current stage of the crop
 * - Time since last update
 * - Stage progression patterns
 */

// Compute field status based on current stage and last update date
const computeFieldStatus = (currentStage, lastUpdateDate) => {
  // If harvested, it's completed
  if (currentStage === 'HARVESTED') {
    return 'Completed';
  }

  // If no updates yet, consider it active
  if (!lastUpdateDate) {
    return 'Active';
  }

  // Calculate days since last update
  const now = new Date();
  const lastUpdate = new Date(lastUpdateDate);
  const daysSince = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

  // Status rules:
  // - More than 7 days without update = At Risk
  // - Otherwise = Active
  if (daysSince > 7) {
    return 'At Risk';
  }

  return 'Active';
};

// Advanced status calculation (for future enhancement)
const computeAdvancedFieldStatus = (field, updates) => {
  const { currentStage, plantingDate } = field;
  
  // Get latest update
  const latestUpdate = updates.length > 0 ? updates[0] : null;
  const lastUpdateDate = latestUpdate ? latestUpdate.createdAt : plantingDate;
  
  // Basic status
  const basicStatus = computeFieldStatus(currentStage, lastUpdateDate);
  
  // Additional factors for advanced logic:
  // 1. Stage progression timing
  const daysSincePlanting = Math.floor((new Date() - new Date(plantingDate)) / (1000 * 60 * 60 * 24));
  
  // 2. Expected duration for each stage (crop-specific - using generic values)
  const expectedStageDurations = {
    PLANTED: { min: 0, max: 14 },      // 0-14 days
    GROWING: { min: 15, max: 60 },     // 15-60 days
    READY: { min: 61, max: 90 },       // 61-90 days
    HARVESTED: { min: 91, max: 365 }   // 91+ days
  };
  
  const expectedDuration = expectedStageDurations[currentStage];
  
  // 3. Check if stage progression is delayed
  if (expectedDuration && daysSincePlanting > expectedDuration.max) {
    return 'At Risk'; // Stayed too long in current stage
  }
  
  // 4. Check frequency of updates
  if (latestUpdate) {
    const daysSinceLastUpdate = Math.floor((new Date() - new Date(lastUpdateDate)) / (1000 * 60 * 60 * 24));
    
    // Critical: No updates for 14+ days
    if (daysSinceLastUpdate > 14) {
      return 'At Risk';
    }
    
    // Warning: No updates for 7-14 days
    if (daysSinceLastUpdate > 7) {
      return 'At Risk';
    }
  }
  
  return basicStatus;
};

// Get status color for UI
const getStatusColor = (status) => {
  const colors = {
    'Active': 'green',
    'At Risk': 'yellow',
    'Completed': 'gray'
  };
  return colors[status] || 'gray';
};

// Get status description
const getStatusDescription = (status) => {
  const descriptions = {
    'Active': 'Field is being monitored regularly',
    'At Risk': 'Field needs attention - no recent updates',
    'Completed': 'Crop has been harvested'
  };
  return descriptions[status] || 'Unknown status';
};

module.exports = {
  computeFieldStatus,
  computeAdvancedFieldStatus,
  getStatusColor,
  getStatusDescription
};
