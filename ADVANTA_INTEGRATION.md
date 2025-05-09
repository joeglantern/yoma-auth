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

Note: For production, this token should be updated to a more secure value.

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

For any issues or questions regarding this integration, please contact your Yoma representative. 