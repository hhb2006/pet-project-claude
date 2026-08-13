import assert from "node:assert/strict";
import test from "node:test";

await import("../public/photo-analysis.js");
const { scaledDimensions } = globalThis.PhotoAnalysis;

test("downscales large photos without changing their aspect ratio", () => {
  assert.deepEqual(scaledDimensions(4000, 3000, 1280), { width: 1280, height: 960 });
  assert.deepEqual(scaledDimensions(900, 1200, 1280), { width: 900, height: 1200 });
});

test("rejects invalid image dimensions before creating a canvas", () => {
  assert.throws(() => scaledDimensions(0, 1200, 1280), /invalid_dimensions/);
  assert.throws(() => scaledDimensions(1200, 800, 0), /invalid_dimensions/);
});
