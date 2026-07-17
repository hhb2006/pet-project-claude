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
