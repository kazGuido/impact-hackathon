# Scam Coach local demo

Run `npm ci`, `npx wrangler d1 migrations apply scam-coach-local --local`, then `npm run dev`. Open `http://localhost:8787/` for learner practice and `http://localhost:8787/admin.html` for the content studio. This is a local-only demo. Wrangler serves on localhost by default.

Open `http://localhost:8787/v3` for the latest Look Twice learner UI. It presents a centered phone frame on desktop and fills the viewport on smaller screens. The demo covers onboarding, the weekly scam overview, practice and checks, results, progress, and family sharing. `/v2` offers the earlier presentation of the shared learner flows. See [CLAUDE.md](CLAUDE.md) for the V3 design and browser verification guidance.

The content studio starts with two cited FBI IC3 alerts (September and October 2026). An admin can also submit a source URL or a private partner topic. For an IC3 source, the draft action reads a short excerpt from the official page; other URLs remain citation metadata and can be supplemented with admin notes. AI drafts a fictional English practice message, two hints, warning signs, and an explanation. The admin edits and explicitly approves it before learners receive it. Publishing is local to the D1 development database. The app does not contact a news outlet or send messages.

Published lessons appear in the learner's question rotation and get an awareness URL (`/?awareness=candidate-<id>`). The admin can copy a labeled practice SMS containing that URL; the person chooses the recipient and sends it. After a lesson, the learner can use the native share sheet to share its awareness page.

Learner progress stays in the browser. The optional home-screen checkbox sends only scenario ID, first-try result, hint count, and practice/check type to local D1. No typed reply or person identifier is stored in analytics. The admin sees aggregate counts and may ask AI to suggest education topics once a scenario has at least three attempts. These numbers describe practice outcomes, not scam prevalence or demographic risk.

Local admin access works on localhost when `ADMIN_TOKEN` is unset. With a token configured, the admin page prompts for username `admin` and uses the token as the password. Admin API clients can also send the token as a Bearer credential. `AI_API_KEY` in `.dev.vars` enables AI drafting and learner hints. Keep both secrets out of git.

Sample scenarios and translations have not been professionally reviewed. AI recommendations depend on opt-in data, and partner demographics are not collected.

## Daily source collection

The collector checks the official [FBI IC3 PSA RSS feed](https://www.ic3.gov/PSA/RSS) and uses a small set of cited IC3 alerts if the feed has too few relevant items. Each day it creates enough AI-drafted, unpublished candidates to bring that day's review queue to at least three. Repeated runs on the same day are idempotent. It fetches IC3 article excerpts where available, records the source URL and date, and leaves publication to an admin. If the feed or AI provider fails, the response reports errors and may contain fewer than three drafts; it never invents a source to fill the quota.

The Worker has a 07:00 UTC cron trigger for a future Cloudflare deployment. Locally, `bash scripts/collect-daily.sh` runs one collection even when the development server is closed; a host cron entry can invoke it daily. The admin's “Collect today's candidates” button runs the same collection on demand.

## Hosted demo

Deploy the approved demo branch using the `demo` environment in `wrangler.jsonc`. It uses a separate hosted database and blocks admin access when the admin secret is missing.

1. Sign in with `npx wrangler login` and confirm the target account with `npx wrangler whoami`.
2. Create the demo database once using `npx wrangler d1 create look-twice-demo`. Put the returned database UUID in `env.demo.d1_databases`, then run `npx wrangler d1 migrations apply DB --env demo --remote`. The local database contents stay local.
3. Prepare a private JSON secrets file outside the repo with a new random `ADMIN_TOKEN` and an `AI_API_KEY` for the provider configured in `env.demo.vars`. Run `npx wrangler deploy --env demo --dry-run`, then deploy with `npx wrangler deploy --env demo --secrets-file /path/to/private-secrets.json`.
4. Check `/v3`, `/api/published`, and the admin sign-in at `/admin.html` on the HTTPS URL. Check that admin API calls require authentication, then verify collection or a coaching hint using the hosted AI configuration.

For a custom hostname, attach it to the deployed Worker in Cloudflare after its DNS zone is active. The domain can stay registered at Namecheap. The `workers.dev` URL is available independently of the custom domain.
