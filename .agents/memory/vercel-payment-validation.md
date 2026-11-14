---
name: Vercel payment build validation
description: Why the serverless backend needs independent production-mode verification.
---

Validate the payment backend with Node-style ESM resolution and an emitted-JavaScript import check, not only the browser build or a TypeScript runner.

**Why:** The Vite build and local TypeScript runner succeeded while Vercel's separate backend compilation rejected extensionless ESM imports. A successful frontend build did not mean the payment function could deploy.

**How to apply:** Keep backend checking in the normal production build. When changing backend imports, also verify that plain Node can load the emitted backend. Do not suppress TypeScript errors to make Vercel deployments pass.
