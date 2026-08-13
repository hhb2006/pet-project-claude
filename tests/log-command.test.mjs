import assert from "node:assert/strict";
import test from "node:test";

await import("../public/log-command.js");
const { isRequest } = globalThis.LogCommand;

test("recognizes explicit Chinese and English log requests", () => {
  for (const text of [
    "帮我把刚才的情况记录到日志里",
    "生成一条log",
    "把这个加入日志",
    "帮我把刚才这个记下来",
    "Please create a log entry from that",
    "log this",
  ]) assert.equal(isRequest(text), true, text);
});

test("does not intercept questions or ordinary observations", () => {
  for (const text of [
    "怎么生成日志？",
    "日志里有什么？",
    "它今天看起来不太高兴",
    "How do I create a log?",
  ]) assert.equal(isRequest(text), false, text);
});
