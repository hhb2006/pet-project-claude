# Pet Diary 🐾

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
its own log, documents, and reports. It's a small static site plus serverless
functions and one streaming Edge Function — no build step.

Pages (`public/`):

- `index.html` — your pets. Create one (species and breed from dropdowns), see
  its entry/document counts, open it.
- `pet.html?id=…` — a pet's workspace, with three tabs:
  - **Chat** — talk freely about your pet, in saved sessions you can revisit
    (with a "＋ New chat" for a fresh topic, like any LLM chat app). Replies
    stream into the page, with a collapsible thinking section and a stop
    control. User messages can be edited; assistant replies can be copied or
    regenerated. Editing and regeneration create switchable branches, so the
    original conversation and any log linked to it remain intact. Chat is
    advice by default and **nothing is saved to the log unless you say so**.
    You can use the **"＋ Complete & add to log"** action or say “log this” /
    “把刚才的情况记到日志”. The assistant extracts the details already mentioned,
    identifies the source event message, and opens a review form for corrections
    or missing fields. It saves only after confirmation and reuses the linked entry
    instead of creating a duplicate. The control then becomes
    **"✓ Added · View/edit"**.
  - **Log** — every entry added from chat, newest first, each **editable** (fill
    in what the message didn't mention, or correct it — a blank field records as
    "not recorded") and deletable, plus
    **Create report**: a narrative on the pet's **history and where things
    stand now**, a behavioral profile and proportionate next steps — savable
    to Documents or downloadable as `.txt`. The report is generated from the
    log, so the two live together.
  - **Archives & album** — write notes, attach paperwork, keep saved reports,
    and add photos to a dated album. A newly uploaded album photo can be
    analyzed once by a dedicated vision model; its text note is stored beside
    the photo and becomes bounded, non-binary context for later chat replies.

A pet's name, species and breed can be edited any time via **Edit details**.
- `db.js` — the local data layer (pets, entries, documents, attachments, chat
  sessions and messages). `i18n.js` — English/Chinese strings and the language
  switch. `species.js`, `shared.css`, `app.js` — species/breed data, styling
  and helpers.

The interface is available in **English and Simplified Chinese** (switch at the
top right; remembered per browser, and defaulting to your browser's language).
The chosen language is sent to the functions, so the assistant replies — and
writes reports — in the same language. Species and all 346 breed names are
translated too; the stored values stay English so records are language-neutral
and switching languages never rewrites your data.

Functions (`netlify/functions/`) and the streaming Edge Function
(`netlify/edge-functions/`) — **your OpenAI API key lives here as an
environment variable and is never sent to the browser:**

- `chat.js` — logging; calls the configured model with a forced tool for clean
  structured output.
- `analyze.js` — computes the patterns deterministically (a JS port of
  `analyze_behavior_log.py`), then has the configured model write the narrative
  report.
- `advise.js` — non-streaming compatibility endpoint for general pet chat.
- `analyze-photo.js` — sends a resized copy of a newly added album photo to the
  separately configured vision model and returns one concise visual note. It
  does not store the image.
- `advise-stream.js` — streams OpenAI reasoning summaries and final-answer deltas to the
  chat interface through `/api/advise-stream`.
  General pet chat answers ordinary questions directly without
  turning the conversation into a logging questionnaire, and gives
  **non-diagnostic** help with clear emergency signposting.

Chat, log extraction, reports, and image analysis all use OpenAI's Responses API.
The committed defaults use `gpt-5.6-luna`. For local development, the ignored
`.env` needs the active OpenAI key:

```env
OPENAI_API_KEY=your-openai-key
```

The old Anthropic/DeepSeek key may remain in the local `.env` for a future
provider switch, but the web app does not currently read it:

```env
ANTHROPIC_API_KEY=your-previous-provider-key
```

The endpoint and models are already committed. Optional overrides remain
available locally or in Netlify, but do not need to be added to `.env`:

```env
OPENAI_BASE_URL=https://api.openai.com
OPENAI_MODEL=gpt-5.6-luna
OPENAI_VISION_MODEL=gpt-5.6-luna
```

`OPENAI_MODEL` controls chat, log extraction, and reports. Image analysis uses
the same value unless `OPENAI_VISION_MODEL` is set. Environment variables take
precedence over committed defaults. Never commit `.env`.

### Where your data lives

Records and original files are stored **privately in your own browser**, in
IndexedDB. Chat sends the relevant bounded text context to its configured AI.
When an image is added to chat, a log, archives, or the album, the browser removes
metadata, scales it to at most 1280px and sends that JPEG copy once to the configured
vision AI. The returned text note is stored locally; later chats receive the note,
never the image pixels. An existing single-pet log from an earlier version is migrated
automatically into a pet on first load.

Because storage is per-browser, your pets do **not** sync across devices, and
clearing site data removes them — use the download buttons to keep copies. See
the note below to move storage server-side.

### Deploying

1. Connect this repo to Netlify (Add new site → Import from Git). Leave the build
   command empty; `netlify.toml` already sets publish dir `public` and the
   functions dir.
2. In **Site configuration → Environment variables**, add
   `OPENAI_API_KEY` = your OpenAI API key. `ANTHROPIC_API_KEY` may remain stored
   but is not used by the current web app.
3. **Redeploy** (env var changes need a fresh deploy). Open the site — you should
   see the logger, not a 404.

If you still get a 404, check that the site's build settings in the Netlify UI
haven't overridden `netlify.toml` (the publish directory must be `public`).
Without the env var, the page loads but the assistant replies with a message
asking the owner to set `OPENAI_API_KEY`.

### Regression checks

Run the dependency-free Node tests before deploying:

```bash
node --test tests/*.test.mjs
```

### Making the log sync across devices (optional)

`localStorage` is per-browser. To share one log across devices, move storage into
the function using [Netlify Blobs](https://docs.netlify.com/blobs/overview/) (or a
database) and have the function read/write entries instead of the browser.
