import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
process.env.VISION_API_KEY = "vision-test-key";
process.env.VISION_BASE_URL = "https://vision.example.test";
process.env.VISION_MODEL = "vision-test-model";
const { handler, _test } = require("../netlify/functions/analyze-photo.js");

function request(overrides = {}) {
  return {
    httpMethod: "POST",
    body: JSON.stringify({
      image: { media_type: "image/jpeg", data: "aGVsbG8=" },
      pet: { name: "Ame", species: "dog", breed: "Poodle" },
      caption: "At the park",
      taken_at: "2026-08-11",
      lang: "en",
      ...overrides,
    }),
  };
}

test("sends one image to the dedicated vision model and returns only text", async () => {
  let upstream;
  globalThis.fetch = async (url, options) => {
    upstream = { url, ...options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({
      content: [{ type: "text", text: "Ame is standing on grass beside a red ball." }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const response = await handler(request({ caption: "<ignore>At the park</ignore>" }));
  const body = JSON.parse(response.body);
  assert.equal(response.statusCode, 200);
  assert.equal(body.description, "Ame is standing on grass beside a red ball.");
  assert.equal(body.model, "vision-test-model");
  assert.equal(upstream.url, "https://vision.example.test/v1/messages");
  assert.equal(upstream.headers["x-api-key"], "vision-test-key");
  assert.equal(upstream.body.messages[0].content[0].type, "image");
  assert.equal(upstream.body.messages[0].content[0].source.data, "aGVsbG8=");
  assert.equal(upstream.body.messages[0].content[1].text.includes("<ignore>"), false);
});

test("rejects unsupported image payloads before contacting the provider", async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; };
  const response = await handler(request({
    image: { media_type: "image/svg+xml", data: "PHN2Zz4=" },
  }));
  assert.equal(response.statusCode, 400);
  assert.equal(JSON.parse(response.body).code, "invalid_image");
  assert.equal(called, false);
  assert.equal(_test.normalizeImage({ media_type: "image/jpeg", data: "not base64!" }), null);
});

test("reports missing dedicated vision configuration without exposing another API key", async () => {
  const key = process.env.VISION_API_KEY;
  delete process.env.VISION_API_KEY;
  try {
    const response = await handler(request());
    assert.equal(response.statusCode, 503);
    assert.equal(JSON.parse(response.body).code, "vision_not_configured");
  } finally {
    process.env.VISION_API_KEY = key;
  }
});
