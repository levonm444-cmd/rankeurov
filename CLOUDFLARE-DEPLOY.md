# Deploy to Cloudflare Workers

This project has been configured for TanStack Start on Cloudflare Workers.

## Deploy from a computer with Node.js 20+

1. Extract this ZIP and open a terminal in the `EurovisionRanking-main` folder.
2. Run `npm install`.
3. Run `npx wrangler login` and finish the Cloudflare login in your browser.
4. Run `npm run deploy`.
5. Wrangler will upload the app and print its public `workers.dev` URL.

You must sign in to your own Cloudflare account to publish the website. Do not share your password or API token with anyone.

The Cloudflare Pages “Upload your static files” screen is not the right workflow for this full-stack TanStack Start app. Deploy it as a Cloudflare Worker using Wrangler, or connect the project repository to a supported build workflow.
