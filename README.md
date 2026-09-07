# FIKRA | فكرة

Bilingual (Arabic / English) web app that helps you discover a business idea that fits your budget, time, and work style.

Take a short quiz, browse 200+ ideas, save one as **My Idea**, and talk to **FIKRA AI** (a local, rule-based assistant — not a live LLM).

## Run locally

```bash
cd project
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/`). Routes use hash history, so pages look like `/#/explore`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |

## Layout

```
project/          Vite + React + TypeScript app
original/         Public files captured from the live v1 site
docs/RECOVERY.md  How that capture was done
```

## Environment

Copy `project/.env.example` to `project/.env` if you want to point auth at your own Supabase project. Without it, the app uses the public anon client already in the source (email/password + Google OAuth).

Saved ideas, quiz answers, and My Idea data live in the browser (`localStorage` / `sessionStorage`). They are not a server database.

## Deploy (Cloudflare)

Pushes to `main` (and manual **Actions → CI → Run workflow**) build the Vite app and deploy it to Cloudflare Workers with static assets. You do not need Wrangler or the Cloudflare dashboard on your local machine.

Add these GitHub repository secrets (`Settings → Secrets and variables → Actions`):

| Secret | Required | What it is |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Yes | API token with **Account → Workers Scripts → Edit** and **Account → Account Settings → Read** |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Account ID from Cloudflare → Workers & Pages |

Create the token at [Cloudflare API tokens](https://dash.cloudflare.com/profile/api-tokens) using the **Edit Cloudflare Workers** template. After the first successful deploy, the site is at `https://fikra.<your-subdomain>.workers.dev`.

## License

No license file is included yet. Add one before you publish if you want others to reuse the code.
