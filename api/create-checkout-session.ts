import Stripe from 'stripe';
import { ensureSchema } from '../lib/db.js';
import { getSession, send } from './_shared.js';

function appBaseUrl(req: any): string {
  const envUrl = process.env.APP_URL || process.env.VITE_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripeKey || !priceId) return send(res, 500, { error: 'Stripe is not configured' });

  await ensureSchema();

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
    const base = appBaseUrl(req);
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/?billing=success`,
      cancel_url: `${base}/?billing=cancel`,
      customer_email: session.email,
      metadata: {
        userId: session.userId,
        email: session.email,
      },
      subscription_data: {
        metadata: {
          userId: session.userId,
          email: session.email,
        }
      }
    });

    return send(res, 200, { url: checkout.url });
  } catch (error: any) {
    return send(res, 500, { error: 'Failed to create checkout session', detail: String(error?.message || error) });
  }
}
