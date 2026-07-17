#!/usr/bin/env python3
"""Analyze a pet's behavioral history and produce a thoughtful observer's report.

Reads pet_behavior_log.json (written by pet_behavior_logger.py), computes the
factual patterns deterministically in Python, then asks Claude to turn that into
a warm, plain-English report: a narrative summary suitable for sharing with a vet
or trainer, a bullet-point behavioral profile, and a 'Questions to ask your vet'
section grounded in the observed patterns.

The report is an observer's account of what was recorded — never a medical
document. It does not diagnose, name conditions, or recommend treatment.
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from statistics import mean
from typing import Optional

import anthropic

MODEL = "claude-opus-4-8"
LOG_FILE = Path(__file__).with_name("pet_behavior_log.json")

SYSTEM_PROMPT = """\
You are a calm, perceptive observer helping a pet owner make sense of a log of \
their pet's behavior. You write like a thoughtful friend who notices patterns — \
not like a clinician filling out a chart.

You will be given (1) the raw behavior records and (2) a set of patterns already \
computed from them (counts, repeated triggers, intensity and recovery-time trends). \
Ground everything you write in that data. Do not invent events, numbers, or \
details that aren't present.

Hard rules:
- NEVER diagnose. Never name a medical or behavioral condition, never speculate \
about causes ("this could be anxiety", "possible pain"), and never recommend \
treatment, medication, or training methods. You describe what was observed and \
what changed — nothing more.
- Frame observations tentatively and factually ("the recovery time recorded after \
the vacuum grew from about 5 to about 20 minutes across three entries"), not as \
conclusions about the pet's inner state or health.
- Warm, readable, non-clinical tone. This should feel like a caring observer's \
report someone would be glad to hand to their vet or trainer, not a medical form.
- If the data is thin, say so plainly rather than over-reading it.

Produce EXACTLY these three sections, using these exact headers on their own lines:

NARRATIVE SUMMARY
A few short paragraphs in plain English summarizing what the log shows: the main \
behaviors, the triggers that recur, and — importantly — any meaningful changes over \
time (rising intensity, longer recovery, a trigger provoking stronger reactions). \
Flag those changes clearly but without alarm or diagnosis.

BEHAVIORAL PROFILE
A concise bullet list (use "- " for each bullet) capturing the pet's observed \
patterns: characteristic behaviors, known triggers, typical intensity, typical \
recovery, and any notable trend.

QUESTIONS TO ASK YOUR VET
A bullet list (use "- " for each bullet) of open, observation-based questions the \
owner could raise with a vet or trainer, drawn directly from the patterns found. \
Phrase them as questions a curious owner would ask ("Is the increasing recovery \
time after loud noises worth keeping an eye on?"), never as leading questions that \
imply a diagnosis."""


# --------------------------------------------------------------------------- #
# Deterministic analysis (done in Python so the numbers are exact)            #
# --------------------------------------------------------------------------- #

def load_records(path: Path) -> list[dict]:
    if not path.exists():
        print(f"No log found at {path.name}. Log some behavior first with "
              f"pet_behavior_logger.py.", file=sys.stderr)
        raise SystemExit(1)
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        print(f"{path.name} isn't valid JSON: {exc}", file=sys.stderr)
        raise SystemExit(1)
    if isinstance(data, dict):
        data = [data]
    if not isinstance(data, list) or not data:
        print(f"{path.name} has no records to analyze yet.", file=sys.stderr)
        raise SystemExit(1)
    return data


def _sort_key(rec: dict) -> str:
    # logged_at is a reliable ISO timestamp written at capture time.
    return rec.get("logged_at") or ""


def parse_duration_to_minutes(text: Optional[str]) -> Optional[float]:
    """Best-effort: pull a number + unit out of a free-text duration string."""
    if not text:
        return None
    m = re.search(r"(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b",
                  text.lower())
    if not m:
        return None
    value, unit = float(m.group(1)), m.group(2)
    if unit.startswith(("hour", "hr", "h")):
        return value * 60
    if unit.startswith(("sec", "s")):
        return value / 60
    return value  # minutes


def trend(seq: list[float], min_abs: float = 1.0, min_rel: float = 0.0) -> str:
    """Coarse direction of a numeric sequence, comparing first and second halves.

    A change counts only if it clears BOTH an absolute floor (`min_abs`) and a
    relative floor (`min_rel`, as a fraction of the first-half mean). The relative
    floor keeps trivial swings on open-ended scales (e.g. 5 -> 6 minutes) from
    reading as a real trend, while the absolute floor does the same on bounded
    scales (e.g. intensity 1-10).
    """
    if len(seq) < 2:
        return "insufficient data"
    mid = len(seq) // 2
    first_half = seq[:mid] or seq[:1]
    second_half = seq[mid:]
    base = mean(first_half)
    diff = mean(second_half) - base
    rel = abs(diff) / base if base else float("inf")
    if abs(diff) < min_abs or rel < min_rel:
        return "steady"
    return "increasing" if diff > 0 else "decreasing"


def summarize_group(records: list[dict]) -> dict:
    intensities = [r["intensity"] for r in records
                   if isinstance(r.get("intensity"), (int, float))]
    recoveries_raw = [r.get("recovery_period") for r in records
                      if r.get("recovery_period")]
    recoveries_min = [m for m in (parse_duration_to_minutes(r.get("recovery_period"))
                                  for r in records) if m is not None]
    return {
        "count": len(records),
        "intensity_sequence": intensities,
        # Intensity is a bounded 1-10 scale: a one-point shift is meaningful.
        "intensity_trend": trend([float(i) for i in intensities], min_abs=1.0),
        "recovery_periods": recoveries_raw,
        "recovery_minutes_sequence": [round(m, 1) for m in recoveries_min],
        # Recovery is open-ended minutes: require a couple of minutes AND ~25%.
        "recovery_trend": trend(recoveries_min, min_abs=2.0, min_rel=0.25),
    }


def analyze(records: list[dict]) -> dict:
    records = sorted(records, key=_sort_key)

    by_behavior: dict[str, list[dict]] = defaultdict(list)
    by_trigger: dict[str, list[dict]] = defaultdict(list)
    for r in records:
        by_behavior[(r.get("behavior_type") or "unspecified")].append(r)
        by_trigger[(r.get("trigger") or "unspecified")].append(r)

    behavior_groups = {k: summarize_group(v) for k, v in by_behavior.items()}
    trigger_groups = {k: summarize_group(v) for k, v in by_trigger.items()}

    # Deterministic flags: recurring items and rising trends worth surfacing.
    flags: list[str] = []
    for name, g in trigger_groups.items():
        if name != "unspecified" and g["count"] > 1:
            flags.append(f'Trigger "{name}" appears {g["count"]} times.')
        if g["intensity_trend"] == "increasing":
            flags.append(f'Reactions to "{name}" show increasing intensity '
                         f'({g["intensity_sequence"]}).')
        if g["recovery_trend"] == "increasing":
            flags.append(f'Recovery time after "{name}" appears to be lengthening '
                         f'({g["recovery_minutes_sequence"]} min).')
    for name, g in behavior_groups.items():
        if name != "unspecified" and g["count"] > 1:
            flags.append(f'Behavior "{name}" recurs {g["count"]} times.')

    dates = [r.get("logged_at") for r in records if r.get("logged_at")]
    return {
        "record_count": len(records),
        "date_range": {"first": dates[0] if dates else None,
                       "last": dates[-1] if dates else None},
        "by_behavior": behavior_groups,
        "by_trigger": trigger_groups,
        "flags": flags,
        "records_chronological": records,
    }


# --------------------------------------------------------------------------- #
# Claude report generation                                                    #
# --------------------------------------------------------------------------- #

def build_client() -> anthropic.Anthropic:
    try:
        return anthropic.Anthropic()
    except Exception as exc:  # pragma: no cover
        print(f"\nCouldn't start the Anthropic client: {exc}", file=sys.stderr)
        print("Set ANTHROPIC_API_KEY, or run `ant auth login` to sign in.",
              file=sys.stderr)
        raise SystemExit(1)


def generate_report(client: anthropic.Anthropic, analysis: dict) -> str:
    user_content = (
        "Here is a pet's behavior log and the patterns computed from it. "
        "Write the observer's report as instructed.\n\n"
        f"PATTERNS AND FLAGS:\n{json.dumps({k: v for k, v in analysis.items() if k != 'records_chronological'}, indent=2)}\n\n"
        f"RAW RECORDS (chronological):\n{json.dumps(analysis['records_chronological'], indent=2)}"
    )
    response = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        thinking={"type": "adaptive"},
        output_config={"effort": "high"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )
    return "".join(b.text for b in response.content if b.type == "text").strip()


# --------------------------------------------------------------------------- #

def build_report_text(analysis: dict, body: str) -> str:
    dr = analysis["date_range"]
    span = ""
    if dr["first"] and dr["last"]:
        span = f"Entries span {dr['first'][:10]} to {dr['last'][:10]}.\n"
    header = (
        "PET BEHAVIOR OBSERVER'S REPORT\n"
        f"Generated {datetime.now().strftime('%B %d, %Y')}\n"
        f"Based on {analysis['record_count']} logged "
        f"{'entry' if analysis['record_count'] == 1 else 'entries'}.\n"
        f"{span}"
        "An observational summary of what was recorded — not a medical document.\n"
        + "=" * 70 + "\n\n"
    )
    return header + body + "\n"


def main() -> None:
    records = load_records(LOG_FILE)
    analysis = analyze(records)

    print(f"Analyzing {analysis['record_count']} records "
          f"({len(analysis['by_behavior'])} behavior types, "
          f"{len(analysis['by_trigger'])} triggers)...")
    if analysis["flags"]:
        print("Patterns flagged:")
        for f in analysis["flags"]:
            print(f"  • {f}")

    client = build_client()
    try:
        body = generate_report(client, analysis)
    except anthropic.APIError as exc:
        print(f"\nSomething went wrong talking to the API: {exc}", file=sys.stderr)
        raise SystemExit(1)

    report = build_report_text(analysis, body)

    out_path = LOG_FILE.with_name(
        f"pet_behavior_report_{datetime.now().strftime('%Y-%m-%d')}.txt")
    out_path.write_text(report)

    print(f"\nReport saved to {out_path.name}\n")
    print(report)


if __name__ == "__main__":
    main()
