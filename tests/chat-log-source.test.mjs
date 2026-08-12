import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { _test, handler } = require("../netlify/functions/chat.js");

test("keeps bounded user message IDs for log source selection", () => {
  const messages = _test.normalizeMessages([
    { id: "event-1", role: "user", content: "She barked at the door." },
    { id: "reply-1", role: "assistant", content: "How long?" },
    { id: "command-1", role: "user", content: "Log what I just described." },
  ]);
  assert.equal(messages[0].source_id, "event-1");
  assert.equal(messages[1].source_id, null);
  assert.equal(messages[2].source_id, "command-1");
});

test("accepts only a source ID supplied with the request", () => {
  const base = { behavior_type: "barking", source_message_id: "event-1" };
  assert.equal(_test.cleanRecord(base, new Set(["event-1"])).source_message_id, "event-1");
  assert.equal(_test.cleanRecord(base, new Set(["other"])).source_message_id, null);
});

test("returns the model-selected source event for a natural-language log command", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  let upstream;
  globalThis.fetch = async (_url, options) => {
    upstream = JSON.parse(options.body);
    return new Response(JSON.stringify({
      output: [{
        type: "function_call",
        name: "record_event",
        arguments: JSON.stringify({
          behavior_type: "barking",
          trigger: "doorbell",
          timestamp: null,
          duration: null,
          intensity: null,
          recovery_period: null,
          source_message_id: "event-1",
        }),
      }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const response = await handler({
    httpMethod: "POST",
    body: JSON.stringify({ messages: [
      { id: "event-1", role: "user", content: "She barked at the doorbell." },
      { id: "command-1", role: "user", content: "Log this." },
    ] }),
  });
  const body = JSON.parse(response.body);

  assert.equal(body.source_message_id, "event-1");
  assert.match(upstream.input[0].content, /<source_message_id>event-1<\/source_message_id>/);
  assert.equal(upstream.tools[0].strict, true);
  assert.deepEqual(upstream.tool_choice, { type: "function", name: "record_event" });
  assert.equal(upstream.store, false);
});
