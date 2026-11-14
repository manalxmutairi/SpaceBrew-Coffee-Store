# Cosmic Beans test checkout

**Approved currency policy:** Display KWD in the shop and charge USD in test
checkout at a fixed shop rate of **1 KWD = US$3.25**. This is not a live market
rate. Convert each unit to USD cents and round before multiplying by quantity.
Show the USD subtotal and rate before payment. The user has approved resuming
test checkout under this policy; live payments remain prohibited by the code.

The storefront stays usable when payment credentials are absent. Checkout must
remain in test mode until a merchant account, fulfillment, shipping fees and
policies have been finalized.

## What is prepared

- Vercel Node function at `/api/payments`, separate from the static Vite build.
- A JavaScript API adapter backed by strictly compiled TypeScript. The normal
  build emits the backend into `dist/payments`, which the function explicitly
  includes. This avoids a second, incompatible Vercel TypeScript pass without
  disabling application type checks.
- Verified Supabase authentication before checkout or order access.
- Server-controlled catalog, KWD display amounts converted to USD cents, quantity limits, and checkout
  idempotency.
- Stripe-hosted test checkout, Kuwait address collection and eligible first-order
  discount.
- Signed Stripe webhook processing through `stripe-replit-sync`.
- Private Supabase customer relationships and order references. Stripe products,
  prices and payment states are maintained in the sync engine's `stripe` schema,
  not duplicated in public application tables.
- Saved shopping bag; only a server-verified paid return removes purchased items.

## Current blockers

The Stripe account rejected KWD prices, so the user approved USD test checkout
at the fixed rate above. The 12 USD test prices, 10% coupon, signed webhook
configuration and Supabase Stripe synchronization have now been prepared.
A temporary test session confirmed a Moonbeam Blend subtotal of US$17.88 and a
discounted total of US$16.09, then was expired without payment.
Never change the fixed rate or checkout currency without user approval.

The Vercel host also needs the server settings below. A Replit connector does not
automatically provide credentials to Vercel. The provided public Vercel URL
currently returns the storefront HTML at the payment API route; deploy the new
Node function and configure Vercel before attempting an end-to-end payment.

## Vercel environment variables

Keep the Root Directory at `artifacts/spacebrew`. Set values in Vercel's secure
environment-variable settings for each target environment, then rebuild:

| Name | Source | Browser-visible? |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | A newly rotated **test** key from the merchant's Stripe account | Never |
| `SUPABASE_DATABASE_URL` | Existing Supabase project's Connect → Session pooler URL, copied unchanged | Never |
| `SUPABASE_DATABASE_PASSWORD` | Database password, entered separately; the server safely encodes it into the copied URL | Never |
| `SITE_URL` | Actual HTTPS storefront origin, without a trailing path | Public origin |
| `CHECKOUT_ENABLED` | Set to `true` only for configured, verified test checkout | No secret |
| `VITE_SUPABASE_URL` | Existing Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Existing Supabase public/publishable key | Yes |

Do not prefix a secret with `VITE_`. Do not commit secret values, paste them in
chat, or put them in `vercel.json`. The Stripe publishable key is not needed for
Stripe-hosted Checkout. No Supabase service-role key is required.

The server safely inserts the separate database password and uses Supabase's
published root CA with certificate and hostname verification for database access,
Stripe migrations and sync. The copied URI's SSL flags cannot disable this
protection. Never disable certificate checks to bypass a connection error.

## Activation sequence

1. Rotate the Stripe secret that was shared in chat.
2. Use the same verified Stripe test account for catalog setup and the Vercel
   backend. USD is the approved checkout currency.
3. Run `pnpm --filter @workspace/spacebrew run setup:payments` in a secure server
   environment containing the settings below. It idempotently creates the 12
   products and USD prices, the 10% first-order coupon, then initializes migrations,
   the signed webhook and sync. It does not print keys or connection strings.
4. Confirm the setup command succeeded against the same test account used by the
   Vercel backend. Do not create prices in one account and use a key from another.
5. Apply `supabase/checkout.sql` only if setting up another Supabase project. It
   has already been applied to the existing project.
6. Add the Vercel settings above. On the first initialized payment request,
   `stripe-replit-sync` runs its migrations, establishes a managed signed webhook,
   then backfills the Stripe catalog into the existing Supabase PostgreSQL
   database. It does not replace the database or modify the existing products
   table. Schema initialization needs the database owner connection.
7. Confirm the `stripe` schema is not exposed in Supabase's Data API. It includes
   internal synchronization metadata and managed webhook secrets.
8. Test signup/signin, declined and successful test-card checkout, cancellation,
   payment confirmation, order ownership, duplicate requests and webhook retries
   on the actual Vercel deployment before enabling a real selling flow.

Changing `SITE_URL` also changes the managed webhook URL. Use a stable Vercel
production domain rather than a new per-deployment preview URL.

## Verification without credentials

`pnpm run typecheck` checks both browser and server code.
`pnpm run test:payments` covers cart validation and safe unconfigured API behavior.
It also builds the backend and runs plain-Node checks against the actual
JavaScript serverless entry, without a TypeScript runtime loader.
`pnpm run build` builds the static storefront without payment credentials.

These checks do not constitute a successful Stripe payment or a live webhook test.
