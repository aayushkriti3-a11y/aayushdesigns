# aayushdesigns.com

Aayush Kriti's portfolio, the Chef's menu.

- `public/`: the site that goes live (static files).
- `functions/`: Cloudflare Pages Functions. They put the EWM and MaaS360 case studies behind a password check on the server.

## Cloudflare Pages settings
- Framework preset: None
- Build command: (leave empty)
- Build output directory: `public`
- Environment variable: `NDA_PASSWORD` (the password for the NDA case studies; set it as a secret)

The design source lives on the Claude canvas. Changes there are rebuilt into `public/` and pushed here, and Cloudflare redeploys on every push.
