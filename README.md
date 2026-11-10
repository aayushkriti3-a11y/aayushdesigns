# aayushdesigns.com

Aayush Kriti's portfolio, the Chef's menu.

- `public/`: the site that goes live (static files).
- `src/worker.js`: the Cloudflare Worker. It serves `public/` and keeps the EWM and MaaS360 case studies behind a password check on the server.
- `lib/`: helpers for the NDA gate, shared by the Worker and the legacy Pages `functions/`.
- `wrangler.jsonc`: the Worker config.

## Cloudflare setup (Workers)
- Deploy command: `npx wrangler deploy` (Cloudflare's default for Git-connected Workers)
- Variable: `NDA_PASSWORD`, set under Settings → Variables and Secrets as a Secret. `keep_vars` stops deploys from wiping it.
- Custom domains: aayushdesigns.com and www.aayushdesigns.com, under Domains.

The design source lives on the Claude canvas. Changes there are rebuilt into `public/` and pushed here, and Cloudflare redeploys on every push.

## Drafts
`drafts/` holds earlier versions of pages for reference. Nothing in it is served.
- `drafts/home-v1.dc.html`: the previous home page (before "table service").
