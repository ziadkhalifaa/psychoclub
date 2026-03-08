# PsychoClub Space

## Paymob Integration (Accept Egypt)

This project uses Paymob for handling payments securely.

### Setup Instructions

1. **Create a Paymob Account**: Go to [Paymob Accept](https://accept.paymob.com/) and create an account.
2. **Get API Key**: From your Paymob dashboard, go to Settings -> Workspace Settings and copy your `API Key`.
3. **Get HMAC Secret**: From your Paymob dashboard, go to Settings -> Workspace Settings and copy your `HMAC Secret`.
4. **Create an Integration**: Go to Developers -> Payment Integrations and create a new integration (e.g., Online Card). Copy the `Integration ID`.
5. **Create an Iframe (Optional)**: Go to Developers -> Iframes and create an iframe. Copy the `Iframe ID`.

### Environment Variables

Add the following environment variables to your Render Web Service:

- `PAYMOB_API_KEY`: Your Paymob API Key.
- `PAYMOB_INTEGRATION_ID`: Your Paymob Integration ID.
- `PAYMOB_HMAC_SECRET`: Your Paymob HMAC Secret.
- `PAYMOB_IFRAME_ID`: Your Paymob Iframe ID (optional, defaults to 0).
- `APP_BASE_URL`: The base URL of your application (e.g., `https://phychoclub.space`).

### Testing

You can test the integration using Paymob's test cards in the Sandbox environment.

### Deployment

The application is configured to deploy on Render. Ensure all environment variables are set correctly before deploying.
