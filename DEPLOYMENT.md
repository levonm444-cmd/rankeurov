# Deployment

This package is prepared for self-hosting outside Lovable.

## Netlify

- Build command: `npm run build`
- Publish directory: `dist/client`
- `netlify.toml` is included.
- Netlify automatically sets `NETLIFY`, so the Vite config selects the official TanStack Start Netlify plugin.

## Vercel

- Build command: `npm run build`
- Vercel detects TanStack Start + Nitro automatically.
- On Vercel, the Vite config selects Nitro because `NETLIFY` is not set; no Vercel-specific config file is required.

## Assets

The background, Singing Sans font, and country heart flags are served locally from `public/`, so the deployed site no longer depends on Lovable's `/__l5e/` asset CDN.

## Local check

Use Node.js 20+:

```bash
npm install
npm run build
```

The included source was prepared for deployment, but dependency installation/build could not be executed in this environment because outbound package-registry access is unavailable.
