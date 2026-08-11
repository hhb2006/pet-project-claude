import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { _test } = require("../netlify/functions/analyze.js");

test("report records retain bounded AI image notes", () => {
  const [record] = _test.normalizeRecords([{
    behavior_type: "resting",
    image_notes: ["  Curled up on the sofa.  ", "", 42],
  }]);

  assert.deepEqual(record.image_notes, ["Curled up on the sofa."]);
});
