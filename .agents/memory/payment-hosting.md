---
name: Payment hosting and currency
description: Hosting choice and currency constraints for Cosmic Beans payments.
---

Keep the payment backend on Vercel and customer accounts/order relationships in the existing Supabase project.

**Why:** The user explicitly chose “Vercel and Supabase” and asked to keep prices in KWD.

**How to apply:** Do not move checkout to Replit hosting or replace Supabase.

Keep storefront prices in KWD, but use USD for Stripe test checkout at the approved fixed shop rate of 1 KWD = US$3.25.

**Why:** After the Stripe account reported no KWD support, the user explicitly requested USD checkout and approved this conversion rate. This supersedes their earlier choice to pause checkout.

**How to apply:** Show the USD subtotal and fixed rate before redirecting to Stripe. Round each unit to USD cents before multiplying by quantity. Do not change the rate silently or enable real payments.
