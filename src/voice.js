// Voice route for the Scam Coach Worker (server side).
// The main worker (src/worker.js) must import this and answer POST /api/speak with it.
// See VOICE-HANDOFF.md for the exact lines.
//
// POST /api/speak   body: { "text": "...", "voice": "scammer" | "coach" }
// Success: MP3 audio from tts-1.
// Any failure: 503 with no body, so the browser uses its own built-in voice.
// The API key stays on the server. It is never sent to the browser.

// tts-1 voices. Scammer: deep and pushy. Coach: warm and calm.
const VOICE_NAME = { scammer: "onyx", coach: "nova" };
const MAX_CHARS = 600;
const MAX_BODY_CHARS = 4000;
const TIMEOUT_MS = 10000;

export async function handleSpeak(request, env) {
  if (!env.AI_API_KEY) return new Response(null, { status: 503 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) return new Response(null, { status: 413 });

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }

  // Keep it to plain text, one line, short enough for one practice message.
  const text = String(body?.text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  if (!text) return new Response(null, { status: 400 });
  const voice = body?.voice === "scammer" ? "scammer" : "coach";

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${env.AI_BASE_URL}/audio/speech`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.AI_API_KEY}` },
      body: JSON.stringify({
        model: env.AI_TTS_MODEL || "tts-1",
        voice: VOICE_NAME[voice],
        input: text,
        response_format: "mp3",
      }),
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error("tts http " + res.status);
    const audio = await res.arrayBuffer();
    return new Response(audio, {
      headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
    });
  } catch (e) {
    // Log only our own short reason (e.g. "tts http 429"), never the key or the text.
    console.log("TTS unavailable:", String(e && e.message).slice(0, 60));
    return new Response(null, { status: 503 });
  } finally {
    clearTimeout(timer);
  }
}
