import { defineNitroConfig } from 'nitro/config';

export default defineNitroConfig({
  preset: process.env.VERCEL ? 'vercel' : 'cloudflare',
  compatibilityDate: '2025-05-21',
});
