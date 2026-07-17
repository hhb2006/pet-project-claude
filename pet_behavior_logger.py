#!/usr/bin/env python3
"""Pet Behavior Logger — a warm, conversational CLI for logging what your pet did.

You describe something your pet did in plain language; the assistant extracts
structured fields, asks focused follow-up questions one at a time for anything
missing or unclear, then saves a clean JSON record and prints a friendly summary.

The assistant only helps you clarify and record what you observed — it never
suggests diagnoses or medical advice.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import anthropic
from pydantic import BaseModel, Field

MODEL = "claude-opus-4-8"
LOG_FILE = Path(__file__).with_name("pet_behavior_log.json")

SYSTEM_PROMPT = """\
You are a warm, friendly companion helping a pet owner log something their pet \
did. Your job is to gently gather the details of ONE behavioral event and record \
what the owner observed.

You are collecting these fields:
- behavior_type: what the pet actually did (e.g. "barking", "hiding", "pacing")
- trigger: what seemed to set it off, if the owner noticed one (e.g. "the mailman")
- timestamp: when it happened (a date/time, or a natural phrase like "this morning")
- duration: how long the behavior lasted (e.g. "about 10 minutes")
- intensity: how intense it was, on a 1-10 scale (1 = barely noticeable, 10 = extreme)
- recovery_period: how long it took the pet to settle back to normal afterward

Rules of tone and behavior:
- Be warm, conversational, and non-clinical. Talk like a caring friend, not a vet form.
- NEVER suggest a diagnosis, medical cause, or treatment. NEVER speculate about what \
is "wrong" with the pet. Only help the owner clarify and record what THEY observed.
- Extract every field you reasonably can from what the owner has already said. Infer \
sensible values (e.g. map a described intensity to the 1-10 scale) but do not invent \
details the owner never gave.
- Ask about only ONE missing or unclear field at a time. Keep each question short, \
friendly, and specific. Do not bundle multiple questions together.
- If the owner clearly doesn't know a detail or it doesn't apply, accept that: record \
the field as null and move on rather than pressing.
- When every field is either filled in or genuinely unavailable, set complete=true and \
stop asking questions.

Each turn, re-read the whole conversation and return your best current extraction of \
all fields, plus either the single next question to ask, or completion."""


class BehaviorRecord(BaseModel):
    """The assistant's current understanding of the event, refreshed every turn."""

    behavior_type: Optional[str] = Field(
        default=None, description="What the pet did."
    )
    trigger: Optional[str] = Field(
        default=None, description="What seemed to set the behavior off, if noted."
    )
    timestamp: Optional[str] = Field(
        default=None, description="When it happened (date/time or natural phrase)."
    )
    duration: Optional[str] = Field(
        default=None, description="How long the behavior lasted."
    )
    intensity: Optional[int] = Field(
        default=None, description="Intensity on a 1-10 scale."
    )
    recovery_period: Optional[str] = Field(
        default=None, description="How long the pet took to settle afterward."
    )
    complete: bool = Field(
        description="True once every field is filled in or genuinely unavailable."
    )
    next_question: Optional[str] = Field(
        default=None,
        description="The single, warm follow-up question to ask next, or null if complete.",
    )


def build_client() -> anthropic.Anthropic:
    """Create the API client, giving a clear hint if credentials are missing."""
    try:
        return anthropic.Anthropic()
    except Exception as exc:  # pragma: no cover - construction rarely fails
        print(f"\nCouldn't start the Anthropic client: {exc}", file=sys.stderr)
        print(
            "Set ANTHROPIC_API_KEY, or run `ant auth login` to sign in.",
            file=sys.stderr,
        )
        raise SystemExit(1)


def extract(client: anthropic.Anthropic, messages: list[dict]) -> BehaviorRecord:
    """Ask the model to re-extract all fields and decide the next step."""
    response = client.messages.parse(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages,
        output_format=BehaviorRecord,
    )
    return response.parsed_output


def fmt(value: object) -> str:
    return "not recorded" if value in (None, "") else str(value)


def print_summary(record: BehaviorRecord) -> None:
    print("\nHere's what I've got written down:\n")
    print(f"  • Behavior:         {fmt(record.behavior_type)}")
    print(f"  • Possible trigger: {fmt(record.trigger)}")
    print(f"  • When:             {fmt(record.timestamp)}")
    print(f"  • Duration:         {fmt(record.duration)}")
    print(f"  • Intensity (1-10): {fmt(record.intensity)}")
    print(f"  • Recovery period:  {fmt(record.recovery_period)}")


def save_record(record: BehaviorRecord) -> dict:
    """Append the finished record to the JSON log file and return what was saved."""
    entry = {
        "logged_at": datetime.now().isoformat(timespec="seconds"),
        "behavior_type": record.behavior_type,
        "trigger": record.trigger,
        "timestamp": record.timestamp,
        "duration": record.duration,
        "intensity": record.intensity,
        "recovery_period": record.recovery_period,
    }

    if LOG_FILE.exists():
        try:
            log = json.loads(LOG_FILE.read_text())
            if not isinstance(log, list):
                log = [log]
        except json.JSONDecodeError:
            log = []
    else:
        log = []

    log.append(entry)
    LOG_FILE.write_text(json.dumps(log, indent=2))
    return entry


def main() -> None:
    print("🐾 Pet Behavior Logger")
    print("Tell me about something your pet did, and I'll help you write it down.")
    print("(Press Ctrl-C any time to stop.)\n")

    try:
        description = input("What happened? ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\nNo worries — come back whenever you'd like to log something.")
        return

    if not description:
        print("Nothing to log yet. See you next time!")
        return

    client = build_client()
    messages: list[dict] = [{"role": "user", "content": description}]

    try:
        record = extract(client, messages)

        # Ask focused follow-ups one at a time until everything is gathered.
        while not record.complete and record.next_question:
            try:
                answer = input(f"\n{record.next_question} ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nStopping here. I'll save what we have so far.")
                break

            # Mirror the assistant's question and the owner's answer into history.
            messages.append({"role": "assistant", "content": record.next_question})
            messages.append({"role": "user", "content": answer or "(not sure)"})
            record = extract(client, messages)
    except anthropic.APIError as exc:
        print(f"\nSomething went wrong talking to the API: {exc}", file=sys.stderr)
        raise SystemExit(1)

    print_summary(record)
    saved = save_record(record)

    print("\nSaved! Here's the clean record:\n")
    print(json.dumps(saved, indent=2))
    print(f"\nAdded to {LOG_FILE.name} — take care of that little one. 🐾")


if __name__ == "__main__":
    main()
