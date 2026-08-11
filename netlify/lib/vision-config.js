"use strict";

const defaults = require("./vision-defaults.json");

function getVisionConfig() {
  const baseUrl = String(
    process.env.VISION_BASE_URL || defaults.VISION_BASE_URL
  ).trim().replace(/\/+$/, "");
  const model = String(
    process.env.VISION_MODEL || defaults.VISION_MODEL
  ).trim();
  return {
    apiKey: process.env.VISION_API_KEY,
    endpoint: `${baseUrl}/v1/messages`,
    model: model || defaults.VISION_MODEL,
  };
}

module.exports = { getVisionConfig };
