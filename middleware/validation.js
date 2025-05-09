/**
 * Validation middleware for Advanta webhook payload
 */

const { body, validationResult } = require('express-validator');

// Validation rules for webhook payload
const validateWebhookPayload = [
  body('firstName')
    .notEmpty().withMessage('firstName is required')
    .isString().withMessage('firstName must be a string'),
    
  body('surname')
    .notEmpty().withMessage('surname is required')
    .isString().withMessage('surname must be a string'),
    
  body('countryCodeAlpha2')
    .notEmpty().withMessage('countryCodeAlpha2 is required')
    .isString().withMessage('countryCodeAlpha2 must be a string')
    .isLength({ min: 2, max: 2 }).withMessage('countryCodeAlpha2 must be a 2-letter ISO code'),
    
  body('email')
    .optional()
    .isEmail().withMessage('email must be a valid email address'),
    
  body('phoneNumber')
    .optional()
    .isString().withMessage('phoneNumber must be a string')
    .matches(/^\+[1-9]\d{1,14}$/).withMessage('phoneNumber must be in E.164 format'),
    
  body()
    .custom(body => {
      if (!body.email && !body.phoneNumber) {
        throw new Error('Either email or phoneNumber must be provided');
      }
      return true;
    }),
    
  // Optional fields validation
  body('displayName')
    .optional()
    .isString().withMessage('displayName must be a string'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('dateOfBirth must be a valid ISO date format (YYYY-MM-DD)'),
    
  body('educationId')
    .optional()
    .isUUID().withMessage('educationId must be a valid UUID'),
    
  body('genderId')
    .optional()
    .isUUID().withMessage('genderId must be a valid UUID')
];

// Middleware to check validation results
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateWebhookPayload,
  checkValidationResult
}; 