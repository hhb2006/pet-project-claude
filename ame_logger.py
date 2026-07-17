#!/usr/bin/env python3
"""A little behavior journal made just for Ame the dog, and for hhb.

Run it, answer a few gentle questions, and it will keep a friendly record of
what Ame did — then tell you something it noticed. No setup, no jargon.

It only reflects back what you observed. It never guesses at causes and never
offers medical or training advice — that's for your vet or trainer.
"""

from __future__ import annotations

import importlib
import json
import subprocess
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from statistics import mean

# ── Personalized just for this pet ─────────────────────────────────────────
PET = "Ame"
SPECIES = "dog"
OWNER = "hhb"
# ────────────────────────────────────────────────────────────────────────────

LOG_FILE = Path(__file__).with_name(f"{PET.lower()}_behavior_log.json")
MODEL = "claude-opus-4-8"


# ── Zero-setup: bring in the one dependency automatically if it's missing ───
def ensure_anthropic():
    """Import anthropic, installing it quietly if needed. Returns the module or None."""
    try:
        return importlib.import_module("anthropic")
    except ImportError:
        pass
    for extra in ([], ["--user"], ["--break-system-packages"]):
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "--quiet", "anthropic", *extra],
                check=True,
            )
            importlib.invalidate_caches()
            return importlib.import_module("anthropic")
        except Exception:
            continue
    return None  # Offline mode — the journal still works beautifully.


# ── Friendly input helpers ──────────────────────────────────────────────────
def ask(prompt: str) -> str:
    return input(prompt).strip()


def ask_choice(prompt: str, options: list[str]) -> str:
    """Show a small numbered menu; the last option is always free-text 'something else'."""
    print(prompt)
    for i, opt in enumerate(options, 1):
        print(f"   {i}. {opt}")
    while True:
        raw = ask("   → ")
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            choice = options[int(raw) - 1]
            if choice.lower().startswith("something else"):
                return ask(f"   Tell me in your own words what {PET} did: ").lower() or "something else"
            return choice.lower()
        print("   (Just type the number next to your answer.)")


def ask_intensity() -> int | None:
    print(f"How worked up did {PET} seem, from 1 to 10?")
    print("   (1 = barely bothered   •   10 = extremely upset)")
    while True:
        raw = ask("   → ")
        if raw == "":
            return None
        if raw.isdigit() and 1 <= int(raw) <= 10:
            return int(raw)
        print("   (A number from 1 to 10 — or press Enter to skip.)")


# ── Behavior wording, so the reflections read naturally ─────────────────────
WHEN_PHRASE = {
    "morning": "in the morning",
    "afternoon": "in the afternoon",
    "evening": "in the evening",
    "overnight": "overnight",
}


def load_log() -> list[dict]:
    if LOG_FILE.exists():
        try:
            data = json.loads(LOG_FILE.read_text())
            return data if isinstance(data, list) else [data]
        except json.JSONDecodeError:
            return []
    return []


def save_log(log: list[dict]) -> None:
    LOG_FILE.write_text(json.dumps(log, indent=2))


# ── The gentle walkthrough ──────────────────────────────────────────────────
def collect_entry() -> dict:
    behavior = ask_choice(
        f"What did {PET} do?",
        ["Barked", "Hid", "Paced or couldn't settle", "Whined or cried",
         "Growled", "Something else"],
    )
    # Normalize a couple of menu picks to a clean noun for later reflections.
    behavior_noun = {
        "barked": "barking", "hid": "hiding", "paced or couldn't settle": "restlessness",
        "whined or cried": "whining", "growled": "growling",
    }.get(behavior, behavior)

    print()
    trigger = ask(f"Was anything going on that seemed to set {PET} off?\n"
                  f"   (A person, a sound, a place… or just press Enter if nothing stood out.)\n   → ")

    print()
    time_of_day = ask_choice(
        "When did it happen?",
        ["Morning", "Afternoon", "Evening", "Overnight"],
    )

    print()
    intensity = ask_intensity()

    print()
    recovery = ask(f"How long until {PET} felt like themselves again?\n"
                   f"   (However you'd say it — 'a few minutes', 'ages'… or press Enter to skip.)\n   → ")

    return {
        "logged_at": datetime.now().isoformat(timespec="seconds"),
        "behavior": behavior,
        "behavior_noun": behavior_noun,
        "trigger": trigger or None,
        "time_of_day": time_of_day,
        "intensity": intensity,
        "recovery": recovery or None,
    }


# ── What did this entry reveal? (verified against the real history) ─────────
def find_insights(entry: dict, history: list[dict]) -> list[str]:
    """Return up to two true, specific observations comparing this entry to the past."""
    noun = entry["behavior_noun"]
    same = [e for e in history if e.get("behavior_noun") == noun]
    facts: list[str] = []

    if not history:
        facts.append(f"This is your very first entry for {PET} — what a lovely place to start.")
        return facts

    if not same:
        facts.append(f"This is the first time you've logged {PET}'s {noun} — good to have it written down.")
    else:
        prior_times = [e["time_of_day"] for e in same]
        if entry["time_of_day"] not in prior_times:
            dom = Counter(prior_times).most_common(1)[0][0]
            facts.append(
                f"This is the first time you've noticed {PET}'s {noun} "
                f"{WHEN_PHRASE[entry['time_of_day']]} — most of {PET}'s {noun} "
                f"has happened {WHEN_PHRASE[dom]}."
            )
        prior_int = [e["intensity"] for e in same if isinstance(e.get("intensity"), int)]
        if isinstance(entry["intensity"], int) and prior_int:
            avg = mean(prior_int)
            if entry["intensity"] - avg >= 2:
                facts.append(
                    f"{PET} seemed more worked up this time than usual for {noun} — "
                    f"you noted {entry['intensity']}, where before it's been around {round(avg)}."
                )
            elif avg - entry["intensity"] >= 2:
                facts.append(
                    f"{PET} settled more easily this time than usual for {noun} — "
                    f"you noted {entry['intensity']}, where before it's been around {round(avg)}."
                )

    if entry.get("trigger"):
        tkey = entry["trigger"].lower()
        seen = sum(1 for e in history if (e.get("trigger") or "").lower() == tkey)
        if seen >= 1:
            facts.append(
                f'"{entry["trigger"]}" has come up before — that makes {seen + 1} times '
                f"now that it's stirred {PET} up."
            )

    return facts[:2]


def warm_reflection(anthropic, facts: list[str]) -> str:
    """Phrase the verified facts as a warm note. Uses Claude when available, else a gentle default."""
    if anthropic is not None:
        try:
            client = anthropic.Anthropic()
            resp = client.messages.create(
                model=MODEL,
                max_tokens=300,
                output_config={"effort": "low"},
                system=(
                    f"You are a warm, encouraging friend helping {OWNER} keep a little "
                    f"journal about their {SPECIES}, {PET}. Never use jargon. Never suggest "
                    f"a diagnosis, a cause, or any medical or training advice — only reflect "
                    f"back what {OWNER} noticed. Given a few verified observations, write two "
                    f"to three short, warm sentences to {OWNER} about {PET} that share those "
                    f"observations naturally. Be gentle and specific. Add no facts beyond the "
                    f"ones given. Output only the note."
                ),
                messages=[{"role": "user",
                           "content": "Verified observations:\n- " + "\n- ".join(facts)}],
            )
            text = "".join(b.text for b in resp.content if b.type == "text").strip()
            if text:
                return text
        except Exception:
            pass  # Fall through to the gentle built-in phrasing.
    # Offline / no-key: the facts are already warm and specific on their own.
    return " ".join(facts)


# ── Putting it all together ─────────────────────────────────────────────────
def main() -> None:
    anthropic = ensure_anthropic()

    print()
    print(f"  🐾  Ame's Journal")
    print(f"  ─────────────────")
    print(f"  Hi {OWNER} — let's take a moment to note something {PET} did today.")
    print(f"  Just a few easy questions. There are no wrong answers.\n")

    try:
        entry = collect_entry()
    except (EOFError, KeyboardInterrupt):
        print(f"\n\n  No worries, {OWNER} — come back whenever you and {PET} are ready. 🐾")
        return

    history = load_log()
    facts = find_insights(entry, history)

    log = history + [entry]
    save_log(log)

    print("\n  ✓  Saved. Thank you.\n")
    print(f"  Here's something I noticed:\n")
    reflection = warm_reflection(anthropic, facts)
    for line in reflection.split("\n"):
        print(f"    {line}")

    # Encouraging close, with the consistency reminder.
    total = len(log)
    print()
    print(f"  ────────────────────────────────────────────────────────")
    print(f"  That's {total} {'entry' if total == 1 else 'entries'} for {PET} now, {OWNER}.")
    print(f"  Little notes like this add up. If you can keep it going for")
    print(f"  two or three weeks, you'll have a real picture of {PET}'s")
    print(f"  patterns — and that gives a vet or trainer so much more to")
    print(f"  work with than memory alone ever could.")
    print()
    print(f"  You're doing a kind thing for {PET}. See you next time. 🐾")
    print()


if __name__ == "__main__":
    main()
