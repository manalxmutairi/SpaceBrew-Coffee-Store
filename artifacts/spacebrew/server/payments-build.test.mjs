import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import app from '../api/payments.mjs';

let server;
let origin;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test('the actual JavaScript deployment entry serves the USD config without a TypeScript loader', async () => {
  const response = await fetch(`${origin}/api/payments/config`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const config = await response.json();
  assert.equal(config.currency, 'usd');
  assert.equal(config.usdPerKwd, 3.25);
  assert.equal(config.testMode, true);
  assert.equal('STRIPE_SECRET_KEY' in config, false);
});

test('the built deployment keeps payment confirmation private', async () => {
  const response = await fetch(`${origin}/api/payments/status?session_id=cs_test_unverified`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'Please sign in to view your payment.');
});
