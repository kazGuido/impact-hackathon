# Scam Coach – context for Claude

Read PLAN.md (product, flow, AI rules, tech) and brief.md (hackathon rules and scoring) before big changes.

## Look Twice V3 UI

- Start the local app with `npm run dev` and review `http://localhost:8787/v3`. V3 is the active design target for the learner app.
- Use [Look Twice · Onboarding & Family loop.html](<Look Twice · Onboarding & Family loop.html>) as the design foundation. Open it in a browser and compare the relevant artboards, including controls, spacing, and navigation, before editing a flow.
- On desktop, show a centered portrait app about 390 px wide and at most 844 px tall. Fit it inside short browser windows. On phones, fill the viewport. Let long content scroll inside the frame and keep the header, bottom tabs, and practice controls clear of the content and device safe areas.
- Edit `public/v3.html` and `public/v3.css` for V3 presentation. `public/v2.js` and `public/v2-practice.js` are shared by V2 and V3. Check both routes if you touch shared markup or behavior. Keep V1's coach thinking animation in V3 and respect reduced motion.
- The content studio at `/admin.html` shares the V3 colors in `public/v3-theme.css`. Keep the wide review queue on desktop and let it stack on small screens. Approved practice links from the studio open V3.
- Before handing off a UI change, check the rendered app at a desktop size, a short desktop window, and a small phone size. Walk through the affected flow and confirm that the last action is reachable, headers and tabs stay clear, and the decision sheet fits inside the frame.

## How to work with me
- I'm not technical: explain simply, tell me exactly what to click or type.
- Working demo first, fancy later. Commit after every working version.
- Never print the API key, never put it in browser code or git.
- Don't deploy or publish until I say so.
- If the Playwright browser tool is available, test the full user flow yourself after changes and fix what breaks.

## Team
- Francesco: builds the app with you.
- Fathiyya: designs the screens (sends PNGs, I drag them in: match them).
- Others: scam content, research, user tests, pitch.
