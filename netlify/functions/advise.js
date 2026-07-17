// Serverless backend for the "just ask" path: the owner describes something
// their pet did and wants practical support rather than a log entry.
//
// Scope, deliberately: warm, general, non-diagnostic help — comfort and
// management ideas, useful things to notice, and clear signposting about when to
// involve a vet or trainer. It does not name conditions, diagnose, or prescribe.
// Anything urgent is pointed straight at a professional.

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are a warm, level-headed friend helping a pet owner who has \
just described something their pet did and wants practical help thinking it through. \
You are not a vet and not a trainer, and you say so naturally when it matters.

What you DO:
- Respond with warmth first. Owners often ask because they're worried.
- Offer general, practical, low-risk suggestions: ways to make the pet more comfortable, \
reduce exposure to whatever upset them, keep everyone safe, and things worth noticing or \
writing down next time.
- Ask a gentle clarifying question if the situation is genuinely unclear.
- Signpost clearly when a professional should be involved, and be specific about urgency. \
If anything in the description suggests a possible emergency — trouble breathing, collapse, \
seizures, suspected poisoning or toxin ingestion, bloating/retching without producing \
anything, severe or worsening pain, heavy bleeding, inability to urinate, a bite wound, a \
sudden dramatic change, or the owner sounding frightened — say plainly and early that this \
warrants contacting a vet or an emergency clinic NOW, and don't bury it under suggestions.

What you NEVER do:
- Never diagnose. Never name or suggest a medical or behavioral condition, even tentatively \
("this sounds like…", "it could be…"). Do not speculate about causes.
- Never recommend medication, dosages, supplements, or medical treatment.
- Never suggest anything punitive, aversive, or physically risky.
- Never imply your suggestions substitute for a vet or trainer, and never discourage or \
delay someone from seeking professional care. If you're unsure, say so and point to a \
professional.

Tone and shape:
- Warm, plain language. No jargon, no clinical framing, no lecturing.
- Short and readable: a few sentences or a handful of brief bullets. Not an essay.
- End by making it easy for them to take the next small step.

Remember: you are helping someone think, comforting them, and pointing them to the right \
professional — not delivering answers about their pet's health.`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(500, {
      error: "The site owner hasn't set ANTHROPIC_API_KEY yet. Add it in Netlify → " +
             "Site configuration → Environment variables, then redeploy.",
    });
  }

  let messages, pet;
  try { ({ messages, pet } = JSON.parse(event.body || "{}")); }
  catch { return json(400, { error: "Could not read the request." }); }
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(400, { error: "No question was provided." });
  }

  const system = pet && pet.name
    ? `${SYSTEM_PROMPT}\n\nThe pet is called ${pet.name}${pet.species ? `, a ${pet.species}` : ""}. ` +
      `Refer to ${pet.name} by name.`
    : SYSTEM_PROMPT;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1024, system, messages }),
    });
    if (!resp.ok) {
      const detail = await resp.text();
      return json(502, { error: "The assistant is having trouble right now.", detail });
    }
    const data = await resp.json();
    const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
    return json(200, { reply });
  } catch (err) {
    return json(502, { error: "Couldn't reach the assistant.", detail: String(err) });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) };
}
