---
name: Customer account provider
description: Provider choice for Cosmic Beans customer registration and sign-in.
---

Use the existing Supabase Auth project for customer accounts rather than introducing Clerk.

**Why:** The user dismissed the Clerk integration and explicitly chose “Use existing Supabase Auth.”

**How to apply:** Keep future signup, sign-in, verification, and account-recovery work on Supabase unless the user asks to change providers.
