# Pet Behavior Logger 🐾

A warm, conversational CLI that helps pet owners log behavioral events. You
describe something your pet did in plain language; the assistant extracts
structured fields, asks focused follow-up questions one at a time for anything
missing, then saves a clean JSON record and prints a friendly summary.

It only helps you clarify and record what you observed — it **never** suggests
diagnoses or medical advice.

## What it captures

Each entry records: **behavior type**, **possible trigger**, **timestamp**,
**duration**, **intensity** (1–10 scale), and **recovery period**.

## Setup

```bash
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
```

Provide Anthropic credentials with either:

- `export ANTHROPIC_API_KEY=sk-ant-...`, or
- the `ant` CLI: `ant auth login` (the client picks up the profile automatically).

## Usage

```bash
./.venv/bin/python pet_behavior_logger.py
```

Describe what happened, answer the follow-up questions, and the record is
appended to `pet_behavior_log.json` in the project directory.

```
🐾 Pet Behavior Logger
What happened? my dog started barking and wouldn't stop when the mailman came

How long did the barking last? about 10 minutes

And how long did it take him to calm down afterward? around 5 minutes
```

## How it works

Uses the Anthropic Claude API (`claude-opus-4-8`) with Pydantic-typed
structured outputs. Each turn the model re-reads the whole conversation,
extracts every field it can, and returns either the single next question to ask
or a signal that everything has been gathered.

## Analyzing the history

Once you've logged a few events, `analyze_behavior_log.py` reads the whole log
and produces a thoughtful observer's report:

```bash
./.venv/bin/python analyze_behavior_log.py
```

It groups records by behavior type and trigger, computes the factual patterns
in Python (recurring triggers, intensity and recovery-time trends), then asks
Claude to write:

- a **plain-English narrative summary** suitable for sharing with a vet or trainer,
- a **bullet-point behavioral profile** of your pet, and
- a **"Questions to ask your vet"** section grounded in the observed patterns.

The report is saved as a dated file, e.g. `pet_behavior_report_2026-07-16.txt`.
Like the logger, it only describes what was observed and any changes over time —
it **never** suggests diagnoses.

## Web app (Netlify)

The same logging experience runs in the browser, with no install for the user.
It is a static page plus one serverless function:

- `public/index.html` — a warm chat UI (the follow-up-one-at-a-time flow).
- `netlify/functions/chat.js` — calls Claude with a forced tool for clean
  structured output. **Your Anthropic API key lives here as an environment
  variable and is never sent to the browser.**
- `netlify.toml` — publishes `public/` and wires up the function. No build step.

Entries are saved privately in the visitor's browser (`localStorage`), with a
"Download log (JSON)" button. There is no shared database, so the log does not
sync across devices — see the note below to upgrade that.

### Deploying

1. Connect this repo to Netlify (Add new site → Import from Git). Leave the build
   command empty; `netlify.toml` already sets publish dir `public` and the
   functions dir.
2. In **Site configuration → Environment variables**, add
   `ANTHROPIC_API_KEY` = your key.
3. **Redeploy** (env var changes need a fresh deploy). Open the site — you should
   see the logger, not a 404.

If you still get a 404, check that the site's build settings in the Netlify UI
haven't overridden `netlify.toml` (the publish directory must be `public`).
Without the env var, the page loads but the assistant replies with a message
asking the owner to set `ANTHROPIC_API_KEY`.

### Making the log sync across devices (optional)

`localStorage` is per-browser. To share one log across devices, move storage into
the function using [Netlify Blobs](https://docs.netlify.com/blobs/overview/) (or a
database) and have the function read/write entries instead of the browser.
