import assert from "node:assert/strict";
import test from "node:test";

await import("../public/log-filter.js");
const { filterEntries } = globalThis.PetLogFilter;

const now = Date.parse("2026-08-10T12:00:00Z");
const entries = [
  { id: "a", behavior_type: "Barking", trigger: "Doorbell", intensity: 8, logged_at: "2026-08-09T12:00:00Z" },
  { id: "b", behavior_type: "Hiding", trigger: "", intensity: 4, logged_at: "2026-07-20T12:00:00Z" },
  { id: "c", behavior_type: "Pacing", trigger: "Thunder", intensity: 6, logged_at: "2026-06-01T12:00:00Z" },
  { id: "d", behavior_type: "Watching", trigger: "Window", intensity: "unknown", logged_at: "2026-06-01T12:00:00Z" },
];

test("searches across the full entry text", () => {
  assert.deepEqual(filterEntries(entries, { query: "doorbell", now }).map(e => e.id), ["a"]);
});

test("filters by recent periods", () => {
  assert.deepEqual(filterEntries(entries, { filter: "last7", now }).map(e => e.id), ["a"]);
  assert.deepEqual(filterEntries(entries, { filter: "last30", now }).map(e => e.id), ["a", "b"]);
});

test("filters high-intensity and triggered entries", () => {
  assert.deepEqual(filterEntries(entries, { filter: "high", now }).map(e => e.id), ["a"]);
  assert.deepEqual(filterEntries(entries, { filter: "trigger", now }).map(e => e.id), ["a", "c", "d"]);
});
