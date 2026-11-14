import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { Server } from 'node:http';
import app from '../api/payments';
import { catalog, priceLookupKey, validateCart } from './catalog';
import { databaseTls, formatDatabaseUrl } from './database-config';

let server: Server;
let base: string;
const saved = new Map<string, string | undefined>();
before(async () => {
  for (const key of ['STRIPE_SECRET_KEY', 'SUPABASE_DATABASE_URL', 'SITE_URL']) {
    saved.set(key, process.env[key]);
    delete process.env[key];
  }
  process.env.SITE_URL = 'https://shop.example';
  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', (error) => error ? reject(error) : resolve());
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  base = `http://127.0.0.1:${address.port}/api/payments`;
});
after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  for (const [key, value] of saved) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('KWD catalog preserves three-decimal values and stable lookup keys', () => {
  assert.equal(catalog.length, 12);
  assert.equal(catalog.find((p) => p.id === 'sunspell')?.amount, 5750);
  assert.equal(priceLookupKey('moonbeam'), 'cosmic_moonbeam_kwd_test_v1');
});
test('a copied database URI accepts a separate password with reserved characters', () => {
  const password = 'example @:/?#%[]+ password';
  const formatted = formatDatabaseUrl('postgresql://postgres.example:[YOUR-PASSWORD]@pooler.example.com:5432/postgres', password);
  const parsed = new URL(formatted);
  assert.equal(decodeURIComponent(parsed.password), password);
  assert.equal(parsed.hostname, 'pooler.example.com');
  assert.equal(parsed.port, '5432');
});
test('a complete database URI keeps its existing encoded password when no separate password is supplied', () => {
  const formatted = formatDatabaseUrl('postgresql://postgres:example%40password@pooler.example.com:5432/postgres');
  assert.equal(new URL(formatted).password, 'example%40password');
});
test('invalid database URLs and unresolved password placeholders fail without exposing the input', () => {
  for (const value of ['not-a-uri', 'https://example.com/private', 'postgresql://postgres:[YOUR-PASSWORD]@pooler.example.com:5432/postgres']) {
    assert.throws(() => formatDatabaseUrl(value), (error: Error) => !error.message.includes(value));
  }
});
test('connection-string options cannot disable the explicit verified TLS configuration', () => {
  const formatted = formatDatabaseUrl('postgresql://postgres:example@pooler.example.com/postgres?sslmode=disable&ssl=false');
  assert.equal(new URL(formatted).searchParams.has('sslmode'), false);
  assert.equal(new URL(formatted).searchParams.has('ssl'), false);
  assert.equal(databaseTls.rejectUnauthorized, true);
  assert.ok(databaseTls.ca.startsWith('-----BEGIN CERTIFICATE-----'));
});
test('browser price and currency fields never override server prices', () => {
  const result = validateCart([{ id: 'moonbeam', quantity: 2, amount: 1, currency: 'usd' }]);
  assert.equal(result[0].amount, 5500);
  assert.equal(result[0].quantity, 2);
});
test('invalid, unknown, repeated, negative, fractional and oversized items are rejected', () => {
  for (const input of [
    null, {}, [], [{ id: 'unknown', quantity: 1 }],
    [{ id: 'moonbeam', quantity: -1 }], [{ id: 'moonbeam', quantity: 0 }],
    [{ id: 'moonbeam', quantity: 1.5 }], [{ id: 'moonbeam', quantity: 11 }],
    [{ id: 'moonbeam', quantity: '1' }],
    [{ id: 'moonbeam', quantity: 1 }, { id: 'moonbeam', quantity: 1 }],
    [{ id: 'moonbeam', quantity: 10 }, { id: 'sunspell', quantity: 10 }, { id: 'stardust', quantity: 10 }],
  ]) assert.throws(() => validateCart(input));
});
test('readiness is false with missing credentials and reveals no values', async () => {
  const response = await fetch(`${base}/config`);
  assert.deepEqual(await response.json(), { configured: false, testMode: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('checkout refuses a foreign origin', async () => {
  const response = await fetch(`${base}/checkout`, { method: 'POST', headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 403);
});
test('checkout requires an authenticated Supabase user before Stripe or database access', async () => {
  const response = await fetch(`${base}/checkout`, { method: 'POST', headers: { Origin: 'https://shop.example', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 401);
});
test('a fake success URL cannot read or confirm a payment without authentication', async () => {
  const response = await fetch(`${base}/status?session_id=cs_test_fake`);
  assert.equal(response.status, 401);
});
test('order history cannot be read without authentication', async () => {
  const response = await fetch(`${base}/orders`);
  assert.equal(response.status, 401);
});
test('unsigned webhooks are rejected without touching orders', async () => {
  const response = await fetch(`${base}/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 400);
});
test('malformed JSON gets a safe JSON error', async () => {
  const response = await fetch(`${base}/checkout`, { method: 'POST', headers: { Origin: 'https://shop.example', 'Content-Type': 'application/json' }, body: '{broken' });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid payment request.' });
});
