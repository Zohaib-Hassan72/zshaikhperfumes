// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Only switch to the Nitro Vercel preset when actually building on Vercel.
// Lovable's own build/publish pipeline expects the default Cloudflare output
// (dist/), so we must NOT disable cloudflare or inject nitro there.
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  ...((isVercel && {
    cloudflare: false,
    plugins: [nitro({ preset: "vercel" })],
    tanstackStart: {
      server: { entry: "server" },
    },
  }) ?? {}),
  build: {
    ssr: "src/server.ts",
  },
});
