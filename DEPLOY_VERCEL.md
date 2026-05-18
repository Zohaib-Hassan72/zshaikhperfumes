# Deploying this app on Vercel

This project is configured to deploy on Vercel using **TanStack Start + Nitro**.

## Build settings

- **Framework preset**: Other
- **Install command**: `bun install`
- **Build command**: `bun run build`
- **Output directory**: `.output/public`

## Environment variables to add in Vercel

Add these in your Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (only if you use order emails)

## Notes

- This app uses SSR and server functions, so the server-side environment variables are required.
- If your custom domain still points to an old project, update the DNS inside Vercel after the first successful deployment.