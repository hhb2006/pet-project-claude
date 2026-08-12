"use strict";

const defaults = require("./llm-defaults.json");

function getLlmConfig() {
  const baseUrl = String(
    process.env.OPENAI_BASE_URL || defaults.OPENAI_BASE_URL
  )
    .trim()
    .replace(/\/+$/, "");
  const model = String(
    process.env.OPENAI_MODEL || defaults.OPENAI_MODEL
  ).trim();

  return {
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: `${baseUrl}/v1/responses`,
    model: model || defaults.OPENAI_MODEL,
  };
}

module.exports = { getLlmConfig };
