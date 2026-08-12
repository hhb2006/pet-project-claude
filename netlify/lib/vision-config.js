"use strict";

const defaults = require("./vision-defaults.json");

function getVisionConfig() {
  const baseUrl = String(
    process.env.OPENAI_BASE_URL || defaults.OPENAI_BASE_URL
  ).trim().replace(/\/+$/, "");
  const model = String(
    process.env.OPENAI_VISION_MODEL || defaults.OPENAI_VISION_MODEL
  ).trim();
  return {
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: `${baseUrl}/v1/responses`,
    model: model || defaults.OPENAI_VISION_MODEL,
  };
}

module.exports = { getVisionConfig };
