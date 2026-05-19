# Deploying this app on Vercel

This project is configured to deploy on Vercel using **TanStack Start + Nitro (vercel preset)**.

The build produces a standard **Vercel Build Output API v3** directory at `.vercel/output/`, which Vercel auto-detects.

## Vercel project settings

In **Project Settings → Build & Development Settings**, use:

- **Framework Preset**: `Other` (do NOT pick "Vite" — that overrides everything)
- **Install Command**: `bun install` (or leave default)
- **Build Command**: `bun run build` (or leave default)
- **Output Directory**: **LEAVE BLANK / EMPTY** ⚠️

> ⚠️ Do NOT set the Output Directory. Vercel auto-detects `.vercel/output` (Build Output API). Setting it to `dist`, `public`, or `.output/public` will cause a 404.

If any of those fields show an "Override" toggle that's ON with a wrong value, turn the override OFF.

## Required environment variables

Add these in **Project Settings → Environment Variables** (Production, Preview, Development):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (only if you use order emails)

After adding variables, click **Redeploy** (uncheck "Use existing build cache").

## If you still get a 404

1. Open the failed deployment → **Build Logs** → confirm you see `Generated .vercel/output/nitro.json` near the end.
2. Open the deployment → **Deployment Summary** → confirm it says "Build Output API" (not "Static" / "Vite").
3. If it says "Static" or "Vite", the Framework Preset or Output Directory in the UI is overriding `vercel.json`. Reset them per the section above and redeploy.
