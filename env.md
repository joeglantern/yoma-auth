# Advanta Integration Credentials

## Webhook Authentication
- `ADVANTA_WEBHOOK_TOKEN`: Token for authenticating webhook requests from Advanta
  - Value: xS4tFJmsHJFyFGb5XQYj1KFol4CIw9jemRRBazHregA=

## SMS API Credentials
- `ADVANTA_SMS_API_URL`: The URL for Advanta's SMS API
  - Value: https://api.advantasms.com/send
- `ADVANTA_SMS_API_KEY`: Your API key for Advanta SMS
  - Value: [Get this from Advanta]
- `ADVANTA_PARTNER_ID`: Your Partner ID from Advanta
  - Value: [Get this from Advanta]
- `ADVANTA_SHORTCODE`: Your assigned shortcode
  - Value: [Get this from Advanta]

## Yoma API Credentials
- `YOMA_API_URL`: The URL for Yoma's API
  - Value: https://staging.yoma.world/api/v1
- `YOMA_API_KEY`: Your API key for Yoma
  - Value: [Your Yoma API key]

## Server Configuration
- `PORT`: The port number for the server
  - Value: 3000
- `NODE_ENV`: The environment (development, production)
  - Value: production

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