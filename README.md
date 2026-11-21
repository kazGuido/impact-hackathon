# Scam Coach local demo

Run `npm ci`, `npx wrangler d1 migrations apply scam-coach-local --local`, then `npm run dev`. Open `http://localhost:8787/` for learner practice and `http://localhost:8787/admin.html` for the content studio. This is a local-only demo. Wrangler serves on localhost by default.

The content studio starts with two cited FBI IC3 alerts (September and October 2026). An admin can also submit a source URL or a private partner topic. For an IC3 source, the draft action reads a short excerpt from the official page; other URLs remain citation metadata and can be supplemented with admin notes. AI drafts a fictional English practice message, two hints, warning signs, and an explanation. The admin edits and explicitly approves it before learners receive it. Publishing is local to the D1 development database. The app does not contact a news outlet or send messages.

Published lessons appear in the learner's question rotation and get an awareness URL (`/?awareness=candidate-<id>`). The admin can copy a labeled practice SMS containing that URL; the person chooses the recipient and sends it. After a lesson, the learner can use the native share sheet to share its awareness page.

Learner progress stays in the browser. The optional home-screen checkbox sends only scenario ID, first-try result, hint count, and practice/check type to local D1. No typed reply or person identifier is stored in analytics. The admin sees aggregate counts and may ask AI to suggest education topics once a scenario has at least three attempts. These numbers describe practice outcomes, not scam prevalence or demographic risk.

Admin APIs accept requests from localhost when `ADMIN_TOKEN` is unset. Set `ADMIN_TOKEN` in ignored `.dev.vars` before making the server available beyond your own machine. If a token is set, admin API requests require `Authorization: Bearer <token>`; the demo admin page currently targets localhost without a token. Never expose the local dev server publicly without adding authentication and rate limiting. `AI_API_KEY` in `.dev.vars` enables AI drafting and learner hints. Keep both secrets out of git.

Sample scenarios and translations have not been professionally reviewed. The fixed alert list is curated for the demo, not a live news feed. AI recommendations depend on opt-in data, and partner demographics are not collected.
