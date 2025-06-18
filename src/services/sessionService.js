const NodeCache = require('node-cache');

// Create a cache instance with a 30 minute TTL (time to live)
const sessionCache = new NodeCache({ 
  stdTTL: 1800, // 30 minutes in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Store/retrieve actual objects instead of clones for better performance
});

const STATES = {
  FIRST_NAME: 'first_name',
  SURNAME: 'surname',
  GENDER: 'gender',
  EDUCATION: 'education',
  COMPLETE: 'complete'
};

const getSession = (phoneNumber) => {
  try {
    const session = sessionCache.get(phoneNumber);
    console.log('Retrieved session for', phoneNumber, ':', session);
    return session || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

const saveSession = (phoneNumber, sessionData) => {
  try {
    const success = sessionCache.set(phoneNumber, sessionData);
    console.log('Saved session for', phoneNumber, ':', sessionData, 'Success:', success);
    return success;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
};

const clearSession = (phoneNumber) => {
  try {
    const success = sessionCache.del(phoneNumber);
    console.log('Cleared session for', phoneNumber, 'Success:', success);
    return success;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
};

// Get all active sessions (for debugging)
const getAllSessions = () => {
  try {
    const keys = sessionCache.keys();
    const sessions = {};
    keys.forEach(key => {
      sessions[key] = sessionCache.get(key);
    });
    return sessions;
  } catch (error) {
    console.error('Error getting all sessions:', error);
    return {};
  }
};

// Get session stats (for monitoring)
const getStats = () => {
  return sessionCache.getStats();
};

module.exports = {
  STATES,
  getSession,
  saveSession,
  clearSession,
  getAllSessions,
  getStats
}; 