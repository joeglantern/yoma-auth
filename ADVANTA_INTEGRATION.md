# Advanta Integration Guide

This document provides instructions for Advanta to integrate with the Yoma Auth webhook.

## Webhook Details

- **Endpoint URL**: `https://yoma-auth.onrender.com/advanta-webhook`
- **Method**: POST
- **Content-Type**: application/json

## Authentication

All requests must include the following header:
```
X-Advanta-Token: test-token
```

Note: For production, you will be provided with a secure token. The test token should only be used for initial testing.

## Request Format

The webhook expects a JSON payload with the following structure:

```json
{
  "firstName": "String",          // Required
  "surname": "String",            // Required
  "email": "String",              // Required if phoneNumber not provided
  "phoneNumber": "String",        // Required if email not provided
  "countryCodeAlpha2": "String",  // Required (2-letter country code)
  "dateOfBirth": "YYYY-MM-DD"     // Optional
}
```

### Field Requirements:
- **firstName**: Required, the user's first name
- **surname**: Required, the user's last name
- **email** or **phoneNumber**: At least one contact method is required
- **countryCodeAlpha2**: Required, ISO 3166-1 alpha-2 country code (e.g., "KE" for Kenya)
- **dateOfBirth**: Optional, format must be YYYY-MM-DD

## Response Formats

### Successful Response (201 Created)
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "email-or-phone",
    "firstName": "String",
    "surname": "String",
    "email": "String",
    "emailConfirmed": false,
    "phoneNumber": "String",
    "phoneNumberConfirmed": false,
    "dateOfBirth": "YYYY-MM-DD"
  }
}
```

### Error Responses

#### Authentication Error (401 Unauthorized)
```json
{
  "success": false,
  "error": "Authentication failed: Invalid token"
}
```

#### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation failed: Missing required fields"
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Failed to create user in Yoma"
}
```

## Implementation Steps for Advanta

To integrate your shortcode service with the Yoma Auth webhook, please follow these steps:

1. **Set up shortcode service**:
   - Register a shortcode with local telecom providers
   - Configure the shortcode to receive user data via SMS

2. **Build data collection flow**:
   - Create SMS prompts to collect required user information (first name, surname, email/phone, country, DOB)
   - Implement logic to handle multi-message conversations if needed
   - Store partially collected data until submission is complete

3. **Develop webhook client**:
   - Create code to format collected user data into the JSON structure specified above
   - Implement HTTP POST requests to our webhook endpoint
   - Add the authentication header with the provided token
   - Build error handling and retry logic (recommended: 3 retries with exponential backoff)

4. **Implement response handling**:
   - Parse response JSON from the webhook
   - Store user IDs returned from successful registrations
   - Send confirmation SMS to users upon successful registration
   - Notify users of any errors that need correction

## Testing Environment

For integration testing, please use our staging environment:

- **Staging Endpoint**: `https://yoma-auth-staging.onrender.com/advanta-webhook`
- **Staging Token**: `staging-advanta-token`

The staging environment is a separate deployment that does not affect production data. Use this environment to test your integration before going live.

## Production Environment

Once your integration has been tested and is ready for production:

1. We will provide you with a secure production token
2. Update your webhook client to use the production endpoint and token
3. Coordinate with our team on the go-live date

## Testing

For testing purposes, you can use the provided test-token and send a request with valid data:

```
curl -X POST https://yoma-auth.onrender.com/advanta-webhook \
  -H "Content-Type: application/json" \
  -H "X-Advanta-Token: test-token" \
  -d '{
    "firstName": "Liban",
    "surname": "Joe",
    "email": "Libanjoe7@gmail.com",
    "phoneNumber": "+254758009278",
    "countryCodeAlpha2": "KE",
    "dateOfBirth": "2003-08-03"
  }'
```

## Support

For any issues or questions regarding this integration, please contact Libanjoe7@gmail.com or +254758009278.
 