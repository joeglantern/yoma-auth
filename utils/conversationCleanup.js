/**
 * Utility to clean up expired conversation states
 */

const logger = require('./logger');

/**
 * Clean up expired conversations
 * @param {Map} conversationsMap - The map storing conversation states
 * @param {number} expiryTimeMs - Time in milliseconds after which a conversation is considered expired
 */
function cleanupExpiredConversations(conversationsMap, expiryTimeMs = 30 * 60 * 1000) {
  try {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [mobile, conversation] of conversationsMap.entries()) {
      if (now - conversation.timestamp > expiryTimeMs) {
        conversationsMap.delete(mobile);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      logger.info(`Cleaned up ${expiredCount} expired conversations`);
    }
  } catch (error) {
    logger.error('Error during conversation cleanup:', error);
  }
}

/**
 * Setup a periodic cleanup job
 * @param {Map} conversationsMap - The map storing conversation states
 * @param {number} intervalMs - Interval in milliseconds between cleanup runs
 * @param {number} expiryTimeMs - Time in milliseconds after which a conversation is considered expired
 * @returns {NodeJS.Timeout} - The interval timer
 */
function setupPeriodicCleanup(conversationsMap, intervalMs = 15 * 60 * 1000, expiryTimeMs = 30 * 60 * 1000) {
  return setInterval(() => {
    cleanupExpiredConversations(conversationsMap, expiryTimeMs);
  }, intervalMs);
}

module.exports = {
  cleanupExpiredConversations,
  setupPeriodicCleanup
}; 