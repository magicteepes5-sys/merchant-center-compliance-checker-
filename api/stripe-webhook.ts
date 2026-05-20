import Stripe from 'stripe';
import { ensureSchema, sql } from '../lib/db.js';

async function readRawBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve());
    req.on('error', reject);
  });
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const creditsPerCycle = Number(process.env.STRIPE_CREDITS_PER_CYCLE || '100');

  if (!stripeKey || !webhookSecret) {
    res.statusCode = 500;
    return res.end('Stripe webhook not configured');
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

  try {
    await ensureSchema();

    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      res.statusCode = 400;
      return res.end('Missing stripe-signature');
    }

    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        const existing = await sql`SELECT id FROM billing_events WHERE id = ${event.id} LIMIT 1` as any[];
        if (existing.length === 0) {
          await sql`UPDATE users SET searches_remaining = searches_remaining + ${creditsPerCycle}, is_paid = TRUE WHERE id = ${userId}`;
          await sql`INSERT INTO billing_events (id, event_type, user_id, credits_added) VALUES (${event.id}, ${event.type}, ${userId}, ${creditsPerCycle})`;
        }
      }
    }

    res.statusCode = 200;
    return res.end('ok');
  } catch (error: any) {
    res.statusCode = 400;
    return res.end(`Webhook Error: ${String(error?.message || error)}`);
  }
}
