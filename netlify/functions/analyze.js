// Serverless backend for the Analyzer. The browser posts the logged records;
// this function computes the factual patterns deterministically (a JS port of
// analyze_behavior_log.py), then asks Claude to write a warm observer's report:
// a narrative summary, a bullet behavioral profile, and questions to ask a vet.
// It never diagnoses. The API key stays server side.

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `You are a calm, perceptive observer helping a pet owner make \
sense of a log of their pet's behavior. You write like a thoughtful friend who notices \
patterns — not like a clinician filling out a chart.

You will be given (1) the raw behavior records and (2) a set of patterns already \
computed from them (counts, repeated triggers, intensity and recovery-time trends). \
Ground everything you write in that data. Do not invent events, numbers, or details \
that aren't present.

Hard rules:
- NEVER diagnose. Never name a medical or behavioral condition, never speculate about \
causes, and never recommend treatment. You describe what was observed and what changed.
- Frame observations tentatively and factually, not as conclusions about the pet's \
inner state or health.
- Warm, readable, non-clinical tone — a caring observer's report someone would be glad \
to hand to their vet or trainer, not a medical form.
- If the data is thin, say so plainly rather than over-reading it.

Produce EXACTLY these four sections, using these exact headers on their own lines:

NARRATIVE SUMMARY
A few short paragraphs summarizing what the log shows over its whole history: the main \
behaviors, the triggers that recur, and any meaningful changes over time (rising intensity, \
longer recovery, a trigger provoking stronger reactions). Flag those changes clearly but \
without alarm.

WHERE THINGS STAND NOW
A short paragraph on the current picture, weighted to the most recent entries: what has been \
happening lately, whether things appear to be settling, holding steady, or intensifying \
compared with earlier, and how recent the last entry is. If there are too few recent entries \
to say, say that plainly rather than guessing.

BEHAVIORAL PROFILE
A concise bullet list (use "- " for each bullet) of the pet's observed patterns: \
characteristic behaviors, known triggers, typical intensity, typical recovery, notable trends.

QUESTIONS TO ASK YOUR VET
A bullet list (use "- " for each bullet) of open, observation-based questions the owner \
could raise with a vet or trainer, drawn from the patterns found — never leading questions \
that imply a diagnosis.`;

// ── Deterministic analysis (ported from analyze_behavior_log.py) ────────────
function parseDurationToMinutes(text) {
  if (!text) return null;
  const m = String(text).toLowerCase().match(
    /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const unit = m[2];
  if (/^(hour|hr|h)/.test(unit)) return value * 60;
  if (/^(sec|s)/.test(unit)) return value / 60;
  return value;
}

function mean(xs) { return xs.reduce((a, b) => a + b, 0) / xs.length; }

function trend(seq, minAbs = 1.0, minRel = 0.0) {
  if (seq.length < 2) return "insufficient data";
  const mid = Math.floor(seq.length / 2);
  const firstHalf = mid ? seq.slice(0, mid) : seq.slice(0, 1);
  const secondHalf = seq.slice(mid);
  const base = mean(firstHalf);
  const diff = mean(secondHalf) - base;
  const rel = base ? Math.abs(diff) / base : Infinity;
  if (Math.abs(diff) < minAbs || rel < minRel) return "steady";
  return diff > 0 ? "increasing" : "decreasing";
}

function summarizeGroup(records) {
  const intensities = records.map(r => r.intensity).filter(v => typeof v === "number");
  const recoveriesRaw = records.map(r => r.recovery_period).filter(Boolean);
  const recoveriesMin = records.map(r => parseDurationToMinutes(r.recovery_period))
    .filter(v => v !== null);
  return {
    count: records.length,
    intensity_sequence: intensities,
    intensity_trend: trend(intensities.map(Number), 1.0),
    recovery_periods: recoveriesRaw,
    recovery_minutes_sequence: recoveriesMin.map(m => Math.round(m * 10) / 10),
    recovery_trend: trend(recoveriesMin, 2.0, 0.25),
  };
}

function analyze(records) {
  records = [...records].sort((a, b) => String(a.logged_at || "").localeCompare(String(b.logged_at || "")));
  const byBehavior = {}, byTrigger = {};
  for (const r of records) {
    (byBehavior[r.behavior_type || "unspecified"] ||= []).push(r);
    (byTrigger[r.trigger || "unspecified"] ||= []).push(r);
  }
  const behaviorGroups = Object.fromEntries(Object.entries(byBehavior).map(([k, v]) => [k, summarizeGroup(v)]));
  const triggerGroups = Object.fromEntries(Object.entries(byTrigger).map(([k, v]) => [k, summarizeGroup(v)]));

  const flags = [];
  for (const [name, g] of Object.entries(triggerGroups)) {
    if (name !== "unspecified" && g.count > 1) flags.push(`Trigger "${name}" appears ${g.count} times.`);
    if (g.intensity_trend === "increasing") flags.push(`Reactions to "${name}" show increasing intensity (${JSON.stringify(g.intensity_sequence)}).`);
    if (g.recovery_trend === "increasing") flags.push(`Recovery time after "${name}" appears to be lengthening (${JSON.stringify(g.recovery_minutes_sequence)} min).`);
  }
  for (const [name, g] of Object.entries(behaviorGroups)) {
    if (name !== "unspecified" && g.count > 1) flags.push(`Behavior "${name}" recurs ${g.count} times.`);
  }

  const dates = records.map(r => r.logged_at).filter(Boolean);
  return {
    record_count: records.length,
    date_range: { first: dates[0] || null, last: dates[dates.length - 1] || null },
    by_behavior: behaviorGroups,
    by_trigger: triggerGroups,
    flags,
    records_chronological: records,
  };
}

// ── Handler ─────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(500, { error: "The site owner hasn't set ANTHROPIC_API_KEY yet." });

  let records, pet, lang;
  try { ({ records, pet, lang } = JSON.parse(event.body || "{}")); }
  catch { return json(400, { error: "Could not read the request." }); }
  if (!Array.isArray(records) || records.length === 0) {
    return json(400, { error: "There are no logged entries to analyze yet. Log a few events first." });
  }

  const base = pet && pet.name
    ? `${SYSTEM_PROMPT}\n\nThe pet is called ${pet.name}${describe(pet)}. Refer to ${pet.name} by ` +
      `name throughout. Their breed is background only — base every observation on the logged ` +
      `records, never on breed generalizations.`
    : SYSTEM_PROMPT;
  const system = base + reportLangNote(lang);

  const analysis = analyze(records);
  const { records_chronological, ...meta } = analysis;
  const userContent =
    "Here is a pet's behavior log and the patterns computed from it. Write the " +
    "observer's report as instructed.\n\nPATTERNS AND FLAGS:\n" +
    JSON.stringify(meta, null, 2) +
    "\n\nRAW RECORDS (chronological):\n" + JSON.stringify(records_chronological, null, 2);

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    if (!resp.ok) {
      const detail = await resp.text();
      return json(502, { error: "The assistant is having trouble right now.", detail });
    }
    const data = await resp.json();
    const body = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
    return json(200, {
      report_body: body,
      record_count: analysis.record_count,
      date_range: analysis.date_range,
      flags: analysis.flags,
    });
  } catch (err) {
    return json(502, { error: "Couldn't reach the assistant.", detail: String(err) });
  }
};

// The report is written in the interface language, with matching section headers.
function reportLangNote(lang) {
  if (lang !== "zh") return "";
  return "\n\nIMPORTANT: Write the entire report in Simplified Chinese (简体中文). Use these exact " +
    "section headers, each on its own line, instead of the English ones above:\n" +
    "综述\n目前状况\n行为特征\n可以问兽医的问题\n" +
    "All the rules above still apply — especially never diagnosing.";
}

// "Ame, a Labrador Retriever dog" / "Ame, a dog" / "Ame"
function describe(pet) {
  const kind = [pet.breed, pet.species].filter(Boolean).join(" ").trim();
  return kind ? `, a ${kind}` : "";
}

function json(statusCode, obj) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) };
}
