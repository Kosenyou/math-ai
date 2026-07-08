export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    env: {
      stripeSecretKeySet: !!process.env.STRIPE_SECRET_KEY,
      stripeSecretKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
      stripeSecretKeyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : null,
      stripePublishableKeySet: !!process.env.VITE_STRIPE_PUBLISHABLE_KEY,
      webhookSecretSet: !!process.env.STRIPE_WEBHOOK_SECRET,
    }
  });
}
