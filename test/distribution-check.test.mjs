import assert from "node:assert/strict";
import test from "node:test";

import { runDistributionChecks } from "../scripts/check-distribution.mjs";

test("runs packaged-script and host-tree checks even when one fails", async () => {
  const called = [];
  const exitCode = await runDistributionChecks(async (script) => {
    called.push(script);
    return script === "sync-skill-scripts.mjs" ? 1 : 0;
  });

  assert.deepEqual(called.sort(), ["sync-host-skills.mjs", "sync-skill-scripts.mjs"]);
  assert.equal(exitCode, 1);
});
