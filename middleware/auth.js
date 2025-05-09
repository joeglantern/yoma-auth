/**
 * Authentication middleware for Advanta webhook requests
 */

// Middleware to verify Advanta token
const verifyAdvantaToken = (req, res, next) => {
  const token = req.headers['x-advanta-token'];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed: Missing token' 
    });
  }
  
  if (token !== process.env.ADVANTA_TOKEN) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed: Invalid token' 
    });
  }
  
  next();
};

module.exports = {
  verifyAdvantaToken
}; 