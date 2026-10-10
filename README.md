# RankEurov
A Junior Eurovision 2026 ranking app: pick countries for placements 1–16,
then export a downloadable ranking poster. No login or backend is required;
your ranking is saved in the browser with localStorage.

## Development

Requires Node.js 20+.

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

This project is configured for both Netlify and Vercel. See `DEPLOYMENT.md`.
All visual assets are self-hosted from `public/`.
