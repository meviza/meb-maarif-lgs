import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Public legacy surfaces must not embed a real Drive owner's email address.
// Assertions deliberately report only a boolean, never the matched identity.
for (const relativePath of ['public/app.js', 'public/index.html', 'engine/curriculum_scale_factory.mjs']) {
  test(`legacy public surface omits hard-coded email identity: ${relativePath}`, async () => {
    const source = await readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
    const hasEmailIdentity = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(source);
    assert.equal(hasEmailIdentity, false, 'hard-coded email identity must be removed');
  });
}
