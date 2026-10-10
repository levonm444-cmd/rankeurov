# JESC 2026 My Ranking — Build Guide

A Junior Eurovision 2026 ranking app: pick countries for placements 1–16,
then export a downloadable ranking poster. No login, no backend — your
ranking is saved in the browser (localStorage).

## Requirements

- Node.js 20 or newer

## Install and run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deployment

### Netlify

The project includes `netlify.toml` and uses the official TanStack Start Netlify
Vite plugin. Netlify builds with `npm run build` and publishes `dist/client`.

### Vercel

Vercel detects TanStack Start and Nitro. The Vite configuration selects Nitro
when the `NETLIFY` environment variable is absent, so the same source can be
deployed to Vercel without a platform-specific adapter file.

## Self-hosted assets

The background, Singing Sans font, and all country heart flags are stored in
`public/`. The app does not depend on Lovable's asset CDN.
