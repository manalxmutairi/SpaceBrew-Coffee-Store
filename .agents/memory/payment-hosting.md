---
name: Payment hosting and currency
description: Hosting choice and currency constraints for Cosmic Beans payments.
---

Keep the payment backend on Vercel and customer accounts/order relationships in the existing Supabase project.

Keep KWD and pause checkout.

**Why:** The user explicitly chose “Keep KWD and pause checkout” after Stripe reported no KWD support.

**How to apply:** Do not activate payments or switch currency as part of setup, testing or follow-up work. Wait for a later user request to resume.

**Why:** The user explicitly chose “Vercel and Supabase” and asked to keep prices in KWD.

**How to apply:** Do not move checkout to Replit hosting, replace Supabase, or silently convert the checkout currency to work around a provider limitation. Confirm the selected Stripe account supports KWD before creating prices. The initially connected test sandbox rejected KWD, so test-account availability must be rechecked rather than assumed.
