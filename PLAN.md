# Scam Coach – hackathon plan (Shanghai Impact Hackathon, 21 Nov 2026)

Track: Education and AI. Submit by 5:30 PM: demo link, 3-slide deck, build notes, 60-second clip.

## Idea
An app that **teaches** elderly parents to recognize scams themselves, through practice.
Pitch line: "The national anti-fraud app tells you it's a scam. We teach your mother to recognize it herself."

## Core flow (the one journey to demo)
1. **Simulated scam** arrives in a WeChat-style chat (e.g. "your grandson needs money", fake package, fake police).
2. **Attempt:** the user replies or taps big buttons: "Scam" / "Real" / "Not sure".
3. **Hint:** if wrong, the AI does NOT give the answer. It points at one warning sign ("Look: they want money urgently and say keep it secret") and lets them try again.
4. **Reveal:** clearly says "This was a practice exercise", then lists the warning signs.
5. **Check:** a new, different scam to confirm they learned.
6. **Family panel:** the adult child sees first-try accuracy over time (learning evidence).
7. Optional wow: a fake "incoming call" screen with an AI voice (generic voice, never a cloned real person).

## Rules for the AI (responsible AI)
- Hint, don't answer. One warning sign at a time.
- Every simulation is labelled as an exercise once it ends.
- Never says "this is 100% safe". If unsure: "Call your family or 96110" (China anti-fraud hotline – verify).
- No real personal data; sample scams only.

## Tech
- Small Node server holds the API key (from `.env`, never in the browser, never in git).
- API: OpenAI-compatible, base URL `https://api.openai-next.com/v1`, key in env `OPENDEV_API_KEY`.
- Models: `gpt-5.6-sol` (chat/hints), `tts-1` (voice for the call). Copy IDs exactly.
- Frontend: one phone-sized page, big text, Chinese + English toggle.
- Content: `scams.json` with 8–10 scenarios, each with warning signs, hint, and a follow-up check.
- Later: deploy for a shareable link (only when Francesco asks).

## Pitch extras
- Friends test it with their parents and send videos (with permission; label as informal test).
- Research to cite: ROLESafe (CHI 2026, arXiv 2601.12324), Fraud Bingo (Norton), China national anti-fraud AI app (Sept 2026).
