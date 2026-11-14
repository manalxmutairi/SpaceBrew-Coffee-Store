---
name: Vercel payment build validation
description: Why the serverless backend needs independent production-mode verification.
---

Compile the payment backend during the normal build and deploy a JavaScript adapter, while retaining strict TypeScript checks.

**Why:** The Vite build and local TypeScript runner succeeded while Vercel's separate backend compilation rejected extensionless ESM imports. Explicit extensions fixed those errors, but Vercel still reported missing Express and Supabase type members even though local NodeNext compilation and plain-Node execution passed. The additional Vercel TypeScript pass was not reproduced reliably locally.

**How to apply:** Keep strict backend compilation in the normal production build and test the actual JavaScript deployment adapter. Do not put the implementation back into a TypeScript serverless entry without validating Vercel's separate compiler. Do not suppress TypeScript errors to make deployments pass.
