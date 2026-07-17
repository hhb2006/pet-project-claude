// Serverless backend for the Pet Behavior Logger web app.
//
// The browser sends the running conversation; this function calls Claude with a
// single forced tool so the reply is always clean structured JSON (the extracted
// fields plus either the next follow-up question or a "complete" flag), and hands
// that back to the page. The Anthropic API key lives here as an environment
// variable and is never sent to the browser.

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are a warm, friendly companion helping a pet owner log \
something their pet did. Your job is to gently gather the details of ONE behavioral \
event and record what the owner observed.

You are collecting these fields:
- behavior_type: what the pet actually did (e.g. "barking", "hiding", "pacing")
- trigger: what seemed to set it off, if the owner noticed one (e.g. "the mailman")
- timestamp: when it happened (a date/time, or a natural phrase like "this morning")
- duration: how long the behavior lasted (e.g. "about 10 minutes")
- intensity: how intense it was, on a 1-10 scale (1 = barely noticeable, 10 = extreme)
- recovery_period: how long it took the pet to settle back to normal afterward

Rules of tone and behavior:
- Be warm, conversational, and non-clinical. Talk like a caring friend, not a vet form.
- NEVER suggest a diagnosis, medical cause, or treatment. NEVER speculate about what is \
"wrong" with the pet. Only help the owner clarify and record what THEY observed.
- Extract every field you reasonably can from what the owner has already said. Infer \
sensible values but do not invent details the owner never gave.
- Ask about only ONE missing or unclear field at a time. Keep each question short, \
friendly, and specific. Do not bundle multiple questions together.
- If the owner clearly doesn't know a detail or it doesn't apply, accept that: record the \
field as null and move on rather than pressing.
- When every field is either filled in or genuinely unavailable, set complete=true and \
stop asking questions.

Each turn, re-read the whole conversation and call the record_event tool with your best \
current extraction of all fields, plus either the single next question to ask, or completion.`;

const TOOL = {
  name: "record_event",
  description:
    "Record the current understanding of the behavioral event and decide the next step.",
  input_schema: {
    type: "object",
    properties: {
      behavior_type: { type: ["string", "null"], description: "What the pet did." },
      trigger: { type: ["string", "null"], description: "What seemed to set it off, if noted." },
      timestamp: { type: ["string", "null"], description: "When it happened." },
      duration: { type: ["string", "null"], description: "How long the behavior lasted." },
      intensity: {
        type: ["integer", "null"],
        minimum: 1,
        maximum: 10,
        description: "Intensity on a 1-10 scale.",
      },
      recovery_period: {
        type: ["string", "null"],
        description: "How long the pet took to settle afterward.",
      },
      complete: {
        type: "boolean",
        description: "True once every field is filled in or genuinely unavailable.",
      },
      next_question: {
        type: ["string", "null"],
        description: "The single warm follow-up question to ask next, or null if complete.",
      },
    },
    required: ["complete"],
  },
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(500, {
      error:
        "The site owner hasn't set ANTHROPIC_API_KEY yet. Add it in Netlify → Site " +
        "configuration → Environment variables, then redeploy.",
    });
  }

  let messages;
  try {
    ({ messages } = JSON.parse(event.body || "{}"));
  } catch {
    return json(400, { error: "Could not read the request." });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return json(400, { error: "No conversation was provided." });
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "record_event" },
        messages,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json(502, { error: "The assistant is having trouble right now.", detail });
    }

    const data = await resp.json();
    const toolUse = (data.content || []).find((b) => b.type === "tool_use");
    if (!toolUse) {
      return json(502, { error: "The assistant didn't return a usable answer." });
    }
    return json(200, toolUse.input);
  } catch (err) {
    return json(502, { error: "Couldn't reach the assistant.", detail: String(err) });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj),
  };
}
