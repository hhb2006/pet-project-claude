"use strict";

const DEFAULT_BASE_URL = "https://api.anthropic.com";
const DEFAULT_MODEL = "claude-opus-4-8";

function getLlmConfig() {
  const baseUrl = String(process.env.ANTHROPIC_BASE_URL || DEFAULT_BASE_URL)
    .trim()
    .replace(/\/+$/, "");
  const model = String(process.env.ANTHROPIC_MODEL || DEFAULT_MODEL).trim();

  return {
    apiKey: process.env.ANTHROPIC_API_KEY,
    endpoint: `${baseUrl}/v1/messages`,
    model: model || DEFAULT_MODEL,
  };
}

module.exports = { getLlmConfig };
