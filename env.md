# Advanta Integration Credentials

## Production Environment

### Webhook Endpoint
```
URL: https://yoma-auth-le50.onrender.com/advanta-webhook
Method: POST
Content-Type: application/json
```

### Authentication Header
```
X-Advanta-Token: xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=
```

## Request Format
```json
{
  "shortcode": "22317",
  "mobile": "+2547XXXXXXXX",
  "message": "User's message text"
}
```

## Important Notes
1. The authentication token must be included in every request
2. Responses from our webhook will include messages to be sent back to the user

## Test Confirmation
The webhook endpoint has been tested and is operational.

## Support Contact
For technical issues or questions:
- Email: Libanjoe7@gmail.com
- Phone: +254758009278 