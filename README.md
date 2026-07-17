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

The web app organizes everything **by pet**: each pet is its own project, with
its own log, documents, and reports. It's a small static site plus three
serverless functions — no build step.

Pages (`public/`):

- `index.html` — your pets. Create one, see its entry/document counts, open it.
- `pet.html?id=…` — a pet's workspace, with three tabs:
  - **Chat** — talk freely about your pet, in saved sessions you can revisit
    (with a "＋ New chat" for a fresh topic, like any LLM chat app). Chat is
    advice by default and **nothing is saved to the log unless you say so**:
    every message you send carries its own **"＋ Add to log"** action, which
    starts the follow-up-one-at-a-time flow and records a structured entry,
    then marks the message "✓ Added to log".
  - **Documents** — write notes (vet visits, medication, diet), attach files
    (photos, paperwork), and keep saved reports.
  - **Analyze** — a report on the pet's **history and where things stand now**,
    savable to Documents or downloadable as `.txt`.
- `db.js` — the local data layer (pets, entries, documents, attachments, chat
  sessions and messages). `shared.css`, `app.js` — styling and helpers.

Functions (`netlify/functions/`) — **your Anthropic API key lives here as an
environment variable and is never sent to the browser:**

- `chat.js` — logging; calls Claude with a forced tool for clean structured output.
- `analyze.js` — computes the patterns deterministically (a JS port of
  `analyze_behavior_log.py`), then has Claude write the narrative report.
- `advise.js` — the "just ask" path: warm, practical, **non-diagnostic** help with
  clear signposting about when to involve a vet or trainer, and emergencies
  pointed straight at a professional.

### Where your data lives

Everything is stored **privately in your own browser**, in IndexedDB (which,
unlike `localStorage`, holds real files so attachments work). Nothing is uploaded;
only the text you send to the assistant leaves the page. An existing single-pet
log from an earlier version is migrated automatically into a pet on first load.

Because storage is per-browser, your pets do **not** sync across devices, and
clearing site data removes them — use the download buttons to keep copies. See
the note below to move storage server-side.

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
