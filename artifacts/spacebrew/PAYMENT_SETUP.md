# Cosmic Beans test checkout

The storefront stays usable when payment credentials are absent. Checkout must
remain in test mode until a merchant account, fulfillment, shipping fees and
policies have been finalized.

## What is prepared

- Vercel Node function at `/api/payments`, separate from the static Vite build.
- Verified Supabase authentication before checkout or order access.
- Server-controlled catalog, KWD amounts in fils, quantity limits, and checkout
  idempotency.
- Stripe-hosted test checkout, Kuwait address collection and eligible first-order
  discount.
- Signed Stripe webhook processing through `stripe-replit-sync`.
- Private Supabase customer relationships and order references. Stripe products,
  prices and payment states are maintained in the sync engine's `stripe` schema,
  not duplicated in public application tables.
- Saved shopping bag; only a server-verified paid return removes purchased items.

## Current blockers

The connected Replit Stripe test sandbox rejected KWD prices. One Moonbeam Blend
test product was created, but no prices or checkout sessions were created. Do not
silently substitute USD or any other currency.

The Vercel host also needs the server settings below. A Replit connector does not
automatically provide credentials to Vercel.

## Vercel environment variables

Keep the Root Directory at `artifacts/spacebrew`. Set values in Vercel's secure
environment-variable settings for each target environment, then rebuild:

| Name | Source | Browser-visible? |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | A newly rotated **test** key from the merchant's Stripe account | Never |
| `SUPABASE_DATABASE_URL` | Existing Supabase project's Connect → Session pooler URL, with database password | Never |
| `SITE_URL` | Actual HTTPS storefront origin, without a trailing path | Public origin |
| `VITE_SUPABASE_URL` | Existing Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Existing Supabase public/publishable key | Yes |

Do not prefix a secret with `VITE_`. Do not commit secret values, paste them in
chat, or put them in `vercel.json`. The Stripe publishable key is not needed for
Stripe-hosted Checkout. No Supabase service-role key is required.

The Supabase connection must support TLS with certificate verification. Use the
provider's recommended session-pooler settings; never disable certificate checks.

## Activation sequence

1. Rotate the Stripe secret that was shared in chat.
2. Select a Stripe test account that supports KWD. The connected sandbox's currency
   rejection must be resolved in Stripe; the application cannot enable it.
3. Run `pnpm --filter @workspace/spacebrew run setup:payments` in a secure server
   environment containing the settings below. It idempotently creates the 12
   products and KWD prices, the 10% first-order coupon, then initializes migrations,
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
`pnpm run build` builds the static storefront without payment credentials.

These checks do not constitute a successful Stripe payment or a live webhook test.
