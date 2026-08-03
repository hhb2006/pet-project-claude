"use strict";

const defaults = require("./llm-defaults.json");

function getLlmConfig() {
  const baseUrl = String(
    process.env.ANTHROPIC_BASE_URL || defaults.ANTHROPIC_BASE_URL
  )
    .trim()
    .replace(/\/+$/, "");
  const model = String(
    process.env.ANTHROPIC_MODEL || defaults.ANTHROPIC_MODEL
  ).trim();

  return {
    apiKey: process.env.ANTHROPIC_API_KEY,
    endpoint: `${baseUrl}/v1/messages`,
    model: model || defaults.ANTHROPIC_MODEL,
  };
}

module.exports = { getLlmConfig };
