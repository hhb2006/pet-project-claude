import assert from "node:assert/strict";
import test from "node:test";

await import("../public/pet-memory.js");
const { build } = globalThis.PetMemory;

test("builds newest-first log and archive memory without binary photo data", () => {
  const memory = build({
    entries: [
      { behavior_type: "older", logged_at: "2026-01-01T00:00:00Z", intensity: 4 },
      { behavior_type: "no intensity", logged_at: "2026-01-15T00:00:00Z", intensity: null },
      { behavior_type: "newer", logged_at: "2026-02-01T00:00:00Z", intensity: "8" },
    ],
    documents: [{ kind: "note", title: "Diet", body: "Prefers wet food", created_at: "2026-03-01T00:00:00Z" }],
    attachments: [
      { kind: "photo", name: "pet.jpg", type: "image/jpeg", blob: { secret: true }, created_at: "2026-04-01" },
      {
        kind: "photo",
        name: "park.jpg",
        type: "image/jpeg",
        blob: { hiddenBinary: true },
        caption: "At the park",
        ai_description: "Standing on grass beside a red ball",
        taken_at: "2026-04-03",
        ai_analyzed_at: "2026-04-03T12:00:00Z",
        created_at: "2026-04-03",
      },
      { kind: "file", name: "lab.pdf", caption: "Blood test", type: "application/pdf", blob: { secret: true }, created_at: "2026-04-02" },
    ],
  });

  assert.deepEqual(memory.log_entries.map(entry => entry.behavior), ["newer", "no intensity", "older"]);
  assert.equal(memory.log_entries[0].intensity, 8);
  assert.equal(memory.log_entries[1].intensity, null);
  assert.equal(memory.archive_documents[0].body, "Prefers wet food");
  assert.deepEqual(memory.archive_files.map(file => file.name), ["lab.pdf"]);
  assert.equal(memory.album_photos[0].owner_caption, "At the park");
  assert.equal(memory.album_photos[0].visual_note, "Standing on grass beside a red ball");
  assert.equal(JSON.stringify(memory).includes("secret"), false);
  assert.equal(JSON.stringify(memory).includes("hiddenBinary"), false);
  assert.equal(JSON.stringify(memory).includes("pet.jpg"), false);
  assert.equal(JSON.stringify(memory).includes("park.jpg"), false);
});

test("caps individual fields and total archive document memory", () => {
  const documents = Array.from({ length: 30 }, (_, index) => ({
    kind: "note",
    title: `Note ${index}`,
    body: "x".repeat(5000),
    created_at: new Date(2026, 0, index + 1).toISOString(),
  }));
  const memory = build({ documents });

  assert.ok(memory.archive_documents.length < documents.length);
  assert.ok(memory.archive_documents.every(document => document.body.length <= 1200));
  assert.ok(JSON.stringify(memory.archive_documents).length <= 7600);
});
