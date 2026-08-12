"use strict";

function openAiHeaders(apiKey) {
  return {
    "content-type": "application/json",
    "authorization": `Bearer ${apiKey}`,
  };
}

function extractOutputText(data) {
  return (Array.isArray(data && data.output) ? data.output : [])
    .filter(item => item && item.type === "message" && Array.isArray(item.content))
    .flatMap(item => item.content)
    .filter(part => part && part.type === "output_text" && typeof part.text === "string")
    .map(part => part.text)
    .join("\n")
    .trim();
}

function extractReasoningSummary(data) {
  return (Array.isArray(data && data.output) ? data.output : [])
    .filter(item => item && item.type === "reasoning" && Array.isArray(item.summary))
    .flatMap(item => item.summary)
    .filter(part => part && part.type === "summary_text" && typeof part.text === "string")
    .map(part => part.text)
    .join("\n\n")
    .trim();
}

function extractFunctionArguments(data, name) {
  const call = (Array.isArray(data && data.output) ? data.output : [])
    .find(item => item && item.type === "function_call" && item.name === name);
  if (!call) return null;
  if (call.arguments && typeof call.arguments === "object") return call.arguments;
  if (typeof call.arguments !== "string") return null;
  try { return JSON.parse(call.arguments); }
  catch { return null; }
}

module.exports = {
  openAiHeaders,
  extractOutputText,
  extractReasoningSummary,
  extractFunctionArguments,
};
