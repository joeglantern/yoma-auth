# Testing Your Deployed Webhook

This guide explains how to test your Advanta-Yoma Integration Service after deploying it to Render or another platform.

## Prerequisites

- Your deployed webhook URL (e.g., `https://advanta-yoma-integration.onrender.com/advanta-webhook`)
- Your Advanta token (the same one you set in the environment variables)
- A tool for making HTTP requests (cURL, Postman, Insomnia, etc.)

## Setting Up for Testing

Before testing your deployed service, make sure you have correctly set up your environment variables:

1. If testing in development mode:
   ```bash
   npm run setup
   # Choose "dev" when prompted
   ```

2. If testing in production:
   ```bash
   npm run setup
   # Choose "prod" when prompted
   # Enter your real credentials when asked
   ```

3. Deploy your application with the correct environment variables

## Test Steps

### 1. Health Check

First, test the health endpoint to ensure your service is running:

```bash
curl https://advanta-yoma-integration.onrender.com/health
```

Expected response:
```json
{
  "status": "UP",
  "message": "Service is running",
  "timestamp": "2023-05-09T12:34:56.789Z"
}
```

### 2. Testing the Webhook with cURL

Use cURL to send a test request to your webhook:

```bash
curl -X POST https://advanta-yoma-integration.onrender.com/advanta-webhook \
  -H "Content-Type: application/json" \
  -H "X-Advanta-Token: your_real_advanta_token" \
  -d '{
    "firstName": "Liban",
    "surname": "Joe",
    "phoneNumber": "+254758009278",
    "email": "Libanjoe7@gmail.com",
    "countryCodeAlpha2": "KE",
    "displayName": "Liban Joe",
    "dateOfBirth": "2003-08-03"
  }'
```

Expected success response:
```json
{
  "success": true,
  "message": "User successfully created in Yoma",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "username": "Libanjoe7@gmail.com",
    "email": "Libanjoe7@gmail.com",
    "firstName": "Liban",
    "surname": "Joe",
    "displayName": "Liban Joe",
    "phoneNumber": "+254758009278",
    "countryCodeAlpha2": "KE"
  }
}
```

### 3. Testing Authentication

Test that your service properly rejects requests without the correct authentication token:

```bash
curl -X POST https://advanta-yoma-integration.onrender.com/advanta-webhook \
  -H "Content-Type: application/json" \
  -H "X-Advanta-Token: wrong_token" \
  -d '{
    "firstName": "Liban",
    "surname": "Joe",
    "phoneNumber": "+254758009278",
    "countryCodeAlpha2": "KE"
  }'
```

Expected error response:
```json
{
  "success": false,
  "error": "Authentication failed: Invalid token"
}
```

### 4. Testing Validation

Test that your service properly validates the required fields:

```bash
curl -X POST https://advanta-yoma-integration.onrender.com/advanta-webhook \
  -H "Content-Type: application/json" \
  -H "X-Advanta-Token: your_real_advanta_token" \
  -d '{
    "firstName": "Liban",
    "surname": "Joe"
  }'
```

Expected validation error response:
```json
{
  "success": false,
  "errors": [
    { "msg": "countryCodeAlpha2 is required", "param": "countryCodeAlpha2", "location": "body" },
    { "msg": "Either email or phoneNumber must be provided" }
  ]
}
```

## Using Postman

If you prefer a GUI tool, you can use Postman to test your webhook:

1. Create a new POST request to your webhook URL
2. Add headers:
   - `Content-Type: application/json`
   - `X-Advanta-Token: your_real_advanta_token`
3. Set the request body to JSON and add the test user data
4. Send the request and check the response

## Checking Logs

After running your tests, check the logs in your Render dashboard to see how your service processed the requests:

1. Go to your Render dashboard
2. Select your web service
3. Click on the "Logs" tab
4. Look for log entries related to your test requests

## Troubleshooting

If your tests fail, check the following:

- Ensure your environment variables are set correctly
- Verify the webhook URL is correct
- Check the authentication token matches what's in your environment variables
- Look at the logs for any error messages
- Verify your service has proper internet access to reach the Yoma API