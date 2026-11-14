import express, { type Request, type Response, type NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { ConfigurationError, getPool, getSiteUrl, getStripeClient, getStripeSync, requiredSetting } from './stripe.js';
import { priceLookupKey, validateCart } from './catalog.js';
import { CHECKOUT_CURRENCY, kwdFilsToUsdCents, USD_PER_KWD } from '../src/lib/checkout-pricing.js';

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

async function customerIdentity(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ') || header.length > 8192) return null;
  const supabase = createClient(
    requiredSetting('VITE_SUPABASE_URL'),
    requiredSetting('VITE_SUPABASE_PUBLISHABLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { data, error } = await supabase.auth.getUser(header.slice(7));
  return !error && data.user?.email_confirmed_at ? data.user : null;
}

function failed(res: Response, error: unknown) {
  if (error instanceof ConfigurationError) {
    res.status(503).json({ error: error.message });
    return;
  }
  // Do not expose provider responses, keys, database URLs or account details.
  res.status(502).json({ error: 'Payment service is temporarily unavailable. Your bag has not been cleared.' });
}

app.get('/api/payments/config', (_req, res) => {
  const names = ['STRIPE_SECRET_KEY', 'SUPABASE_DATABASE_URL', 'SITE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];
  const paused = process.env.CHECKOUT_ENABLED !== 'true';
  res.json({ configured: !paused && names.every((name) => Boolean(process.env[name])), paused, testMode: true, currency: CHECKOUT_CURRENCY, usdPerKwd: USD_PER_KWD });
});

// Raw bytes are required for Stripe signature verification; keep before JSON.
app.post('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res): Promise<void> => {
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string' || !Buffer.isBuffer(req.body)) {
    res.status(400).json({ error: 'A signed Stripe payload is required.' });
    return;
  }
  try {
    const sync = await getStripeSync();
    await sync.processWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error) {
    if (error instanceof ConfigurationError) { failed(res, error); return; }
    // Failed deliveries remain retryable; no order is marked paid here.
    res.status(400).json({ error: 'Webhook could not be verified or processed.' });
  }
});

app.use(express.json({ limit: '16kb' }));
app.post('/api/payments/checkout', async (req, res): Promise<void> => {
  if (process.env.CHECKOUT_ENABLED !== 'true') {
    res.status(503).json({ error: 'Checkout is paused. You can keep browsing and your bag is saved.' });
    return;
  }
  try {
    const origin = req.headers.origin;
    if (!origin || origin !== getSiteUrl()) {
      res.status(403).json({ error: 'Checkout must start from the shop.' });
      return;
    }
    const user = await customerIdentity(req);
    if (!user) { res.status(401).json({ error: 'Please sign in with a confirmed account before checkout.' }); return; }
    let items: ReturnType<typeof validateCart>;
    try { items = validateCart(req.body?.items); }
    catch (error) { res.status(400).json({ error: (error as Error).message }); return; }
    const requestId = req.body?.requestId;
    if (typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) {
      res.status(400).json({ error: 'Invalid checkout request. Please reopen your bag.' });
      return;
    }
    await getStripeSync();
    const db = getPool();
    const stripe = getStripeClient();
    // Prices come only from the synced Stripe catalog, checked against the
    // server catalog. KWD is displayed in the shop; Stripe charges USD cents
    // at the approved fixed rate, rounded per unit.
    const lines: { price: string; quantity: number }[] = [];
    for (const item of items) {
      const prices = await db.query(
        `SELECT id, unit_amount, currency FROM stripe.prices
         WHERE lookup_key = $1 AND active = true LIMIT 1`, [priceLookupKey(item.id)],
      );
      const price = prices.rows[0];
      if (!price || Number(price.unit_amount) !== kwdFilsToUsdCents(item.amount) || price.currency !== CHECKOUT_CURRENCY) {
        throw new ConfigurationError('The test product catalog needs setup before checkout.');
      }
      lines.push({ price: price.id, quantity: item.quantity });
    }
    const account = await db.query('SELECT stripe_customer_id FROM public.cosmic_checkout_accounts WHERE user_id = $1', [user.id]);
    let customerId: string = account.rows[0]?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create(
        { email: user.email, metadata: { supabase_user_id: user.id, shop: 'cosmic-beans' } },
        { idempotencyKey: `cosmic-customer-${user.id}` },
      );
      await db.query(
        `INSERT INTO public.cosmic_checkout_accounts (user_id, stripe_customer_id) VALUES ($1,$2)
         ON CONFLICT (user_id) DO NOTHING`, [user.id, customer.id],
      );
      const saved = await db.query('SELECT stripe_customer_id FROM public.cosmic_checkout_accounts WHERE user_id = $1', [user.id]);
      customerId = saved.rows[0].stripe_customer_id;
    }
    let firstOrder = true;
    for await (const previous of stripe.checkout.sessions.list({ customer: customerId, limit: 100 })) {
      if (previous.payment_status === 'paid') { firstOrder = false; break; }
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      client_reference_id: user.id,
      line_items: lines,
      allowed_payment_method_types: ['card'],
      shipping_address_collection: { allowed_countries: ['KW'] },
      billing_address_collection: 'required',
      success_url: `${getSiteUrl()}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/?checkout=cancelled`,
      metadata: { supabase_user_id: user.id, shop: 'cosmic-beans', source_currency: 'kwd', usd_per_kwd: String(USD_PER_KWD) },
      ...(firstOrder ? { discounts: [{ coupon: 'cosmic_first_order_test_v1' }] } : {}),
    }, { idempotencyKey: `cosmic-checkout-${user.id}-${requestId}` });
    await db.query(
      `INSERT INTO public.cosmic_orders (user_id, stripe_checkout_session_id) VALUES ($1,$2)
       ON CONFLICT (stripe_checkout_session_id) DO NOTHING`, [user.id, session.id],
    );
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) { failed(res, error); }
});

app.get('/api/payments/status', async (req, res): Promise<void> => {
  try {
    const user = await customerIdentity(req);
    if (!user) { res.status(401).json({ error: 'Please sign in to view your payment.' }); return; }
    const id = req.query.session_id;
    if (typeof id !== 'string' || !/^cs_test_[a-zA-Z0-9_]+$/.test(id)) {
      res.status(400).json({ error: 'Invalid payment reference.' }); return;
    }
    const session = await getStripeClient().checkout.sessions.retrieve(id);
    if (session.client_reference_id !== user.id) { res.status(404).json({ error: 'Payment not found.' }); return; }
    if (session.livemode) throw new ConfigurationError('Only test payments are supported.');
    // This is a server-verified Stripe response, never a trusted URL flag.
    await getPool().query(
      `INSERT INTO public.cosmic_orders (user_id, stripe_checkout_session_id) VALUES ($1,$2)
       ON CONFLICT (stripe_checkout_session_id) DO NOTHING`, [user.id, id],
    );
    res.json({ paid: session.payment_status === 'paid', amount: session.amount_total, currency: session.currency, testMode: true });
  } catch (error) { failed(res, error); }
});

app.get('/api/payments/orders', async (req, res): Promise<void> => {
  try {
    const user = await customerIdentity(req);
    if (!user) { res.status(401).json({ error: 'Please sign in to view your orders.' }); return; }
    await getStripeSync();
    const result = await getPool().query(
      `SELECT o.id, o.created_at, o.stripe_checkout_session_id,
              s._raw_data->>'payment_status' AS payment_status,
              s._raw_data->>'amount_total' AS amount_total,
              s._raw_data->>'currency' AS currency
       FROM public.cosmic_orders o
       LEFT JOIN stripe.checkout_sessions s ON s.id = o.stripe_checkout_session_id
       WHERE o.user_id = $1 ORDER BY o.created_at DESC LIMIT 20`, [user.id],
    );
    res.json({ orders: result.rows });
  } catch (error) { failed(res, error); }
});

app.use((_req, res) => { res.status(404).json({ error: 'Payment endpoint not found.' }); });
app.use((_error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ error: 'Invalid payment request.' });
});
export default app;
