import paypal from '@paypal/checkout-server-sdk';

function environment() {
  return new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
  // For production:
  // return new paypal.core.LiveEnvironment(...);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export default { client };
