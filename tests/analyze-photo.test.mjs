import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
process.env.OPENAI_API_KEY = "openai-test-key";
process.env.OPENAI_BASE_URL = "https://openai.example.test";
process.env.OPENAI_VISION_MODEL = "vision-test-model";
const { handler, _test } = require("../netlify/functions/analyze-photo.js");
const { getVisionConfig } = require("../netlify/lib/vision-config.js");

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

test("uses committed OpenAI vision defaults when only the API key is supplied", () => {
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_VISION_MODEL;
  delete process.env.OPENAI_BASE_URL;
  delete process.env.OPENAI_VISION_MODEL;
  try {
    assert.deepEqual(getVisionConfig(), {
      apiKey: "openai-test-key",
      endpoint: "https://api.openai.com/v1/responses",
      model: "gpt-5.6-luna",
    });
  } finally {
    process.env.OPENAI_BASE_URL = baseUrl;
    process.env.OPENAI_VISION_MODEL = model;
  }
});

test("sends one image to the dedicated vision model and returns only text", async () => {
  let upstream;
  globalThis.fetch = async (url, options) => {
    upstream = { url, ...options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({
      output: [{
        type: "message",
        content: [{ type: "output_text", text: "Ame is standing on grass beside a red ball." }],
      }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const response = await handler(request({ caption: "<ignore>At the park</ignore>" }));
  const body = JSON.parse(response.body);
  assert.equal(response.statusCode, 200);
  assert.equal(body.description, "Ame is standing on grass beside a red ball.");
  assert.equal(body.model, "vision-test-model");
  assert.equal(upstream.url, "https://openai.example.test/v1/responses");
  assert.equal(upstream.headers.authorization, "Bearer openai-test-key");
  assert.equal(upstream.body.input[0].content[0].type, "input_text");
  assert.equal(upstream.body.input[0].content[0].text.includes("<ignore>"), false);
  assert.equal(upstream.body.input[0].content[1].type, "input_image");
  assert.equal(upstream.body.input[0].content[1].image_url,
    "data:image/jpeg;base64,aGVsbG8=");
  assert.equal(upstream.body.store, false);
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

test("reports missing OpenAI vision configuration without falling back to the chat key", async () => {
  const key = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const response = await handler(request());
    assert.equal(response.statusCode, 503);
    assert.equal(JSON.parse(response.body).code, "vision_not_configured");
  } finally {
    process.env.OPENAI_API_KEY = key;
  }
});
