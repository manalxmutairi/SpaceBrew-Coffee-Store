import Stripe from 'stripe';
import pg from 'pg';
import { runMigrations, StripeSync } from 'stripe-replit-sync';
import { databaseTls, formatDatabaseUrl } from './database-config.js';

export class ConfigurationError extends Error {}

export function requiredSetting(name: string) {
  const value = process.env[name];
  if (!value) throw new ConfigurationError('Test checkout is not configured on this host yet.');
  return value;
}

export function getStripeClient() {
  const key = requiredSetting('STRIPE_SECRET_KEY');
  // This integration is intentionally test-only until the shop is ready to sell.
  if (!key.startsWith('sk_test_') && !key.startsWith('rk_test_')) {
    throw new ConfigurationError('Only Stripe test keys are supported by this checkout.');
  }
  return new Stripe(key);
}

let pool: pg.Pool | undefined;
export function getDatabaseUrl() {
  try {
    return formatDatabaseUrl(requiredSetting('SUPABASE_DATABASE_URL'), process.env.SUPABASE_DATABASE_PASSWORD);
  } catch {
    throw new ConfigurationError('The secure Supabase database settings need to be checked.');
  }
}

export function getPool() {
  return pool ??= new pg.Pool({
    connectionString: getDatabaseUrl(),
    ssl: databaseTls,
    max: 2,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 10000,
  });
}

export function getSiteUrl() {
  const url = new URL(requiredSetting('SITE_URL'));
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new ConfigurationError('SITE_URL must be the HTTPS storefront origin.');
  }
  return url.origin;
}

let ready: Promise<StripeSync> | undefined;
export function getStripeSync() {
  if (!ready) {
    ready = (async () => {
      getStripeClient();
      const databaseUrl = getDatabaseUrl();
      const siteUrl = getSiteUrl();
      await runMigrations({ databaseUrl, ssl: databaseTls });
      const sync = new StripeSync({
        poolConfig: { connectionString: databaseUrl, ssl: databaseTls, max: 2, connectionTimeoutMillis: 8000 },
        stripeSecretKey: requiredSetting('STRIPE_SECRET_KEY'),
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
      });
      await sync.findOrCreateManagedWebhook(`${siteUrl}/api/payments/webhook`);
      await sync.syncBackfill({ object: 'all' });
      return sync;
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
  }
  return ready;
}
