import { catalog, priceLookupKey } from './catalog';
import { getStripeClient, getStripeSync } from './stripe';

// Run explicitly after secure Vercel/test configuration is supplied.
// Never imported by Vite or called automatically while browsing.
async function setup() {
  const stripe = getStripeClient();
  for (const item of catalog) {
    const lookupKey = priceLookupKey(item.id);
    const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
    if (existing.data.length) {
      const price = existing.data[0];
      if (price.currency !== 'kwd' || price.unit_amount !== item.amount || !price.active) {
        throw new Error('The existing catalog price does not match the server catalog.');
      }
      continue;
    }
    const products = await stripe.products.search({
      query: `metadata['shop']:'cosmic-beans' AND metadata['catalog_id']:'${item.id}'`,
      limit: 1,
    });
    const product = products.data[0] ?? await stripe.products.create({
      name: item.name,
      metadata: { shop: 'cosmic-beans', catalog_id: item.id },
    }, { idempotencyKey: `cosmic-test-product-${item.id}-v1` });
    await stripe.prices.create({
      product: product.id, currency: 'kwd', unit_amount: item.amount, lookup_key: lookupKey,
    }, { idempotencyKey: `cosmic-test-price-${item.id}-v1` });
  }
  try {
    const coupon = await stripe.coupons.retrieve('cosmic_first_order_test_v1');
    if (coupon.percent_off !== 10 || coupon.duration !== 'once' || !coupon.valid) {
      throw new Error('Existing first-order coupon is not valid.');
    }
  } catch (error) {
    if ((error as {statusCode?: number}).statusCode !== 404) throw error;
    await stripe.coupons.create({
      id: 'cosmic_first_order_test_v1',
      name: 'Cosmic Beans first order · 10% off',
      percent_off: 10,
      duration: 'once',
    }, { idempotencyKey: 'cosmic-first-order-coupon-test-v1' });
  }
  await getStripeSync();
  process.stdout.write('Test catalog, signed webhook and Supabase Stripe sync are ready.\n');
}

setup().catch(() => {
  process.stderr.write('Payment setup did not finish. Verify secure server settings, KWD support, database access and the stable SITE_URL. No real payment was attempted.\n');
  process.exitCode = 1;
});
