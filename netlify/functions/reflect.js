// Serverless backend for Ame's Journal. The browser computes the verified,
// history-grounded observations and posts them here; this function asks Claude to
// phrase them as a warm little note. If the key or the API is unavailable the
// browser falls back to the observations as-is, so the journal never breaks.
// Never diagnoses — it only reflects back what was noticed.

const MODEL = "claude-opus-4-8";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(200, { note: null }); // Browser will use its own gentle phrasing.

  let facts, pet, owner, species;
  try { ({ facts, pet = "your pet", owner = "there", species = "pet" } = JSON.parse(event.body || "{}")); }
  catch { return json(400, { error: "Could not read the request." }); }
  if (!Array.isArray(facts) || facts.length === 0) return json(200, { note: null });

  const system =
    `You are a warm, encouraging friend helping ${owner} keep a little journal about ` +
    `their ${species}, ${pet}. Never use jargon. Never suggest a diagnosis, a cause, or ` +
    `any medical or training advice — only reflect back what ${owner} noticed. Given a few ` +
    `verified observations, write two to three short, warm sentences to ${owner} about ` +
    `${pet} that share those observations naturally. Be gentle and specific. Add no facts ` +
    `beyond the ones given. Output only the note.`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system,
        messages: [{ role: "user", content: "Verified observations:\n- " + facts.join("\n- ") }],
      }),
    });
    if (!resp.ok) return json(200, { note: null });
    const data = await resp.json();
    const note = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
    return json(200, { note: note || null });
  } catch {
    return json(200, { note: null });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) };
}
