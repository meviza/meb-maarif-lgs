import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('default test command is hermetic and excludes the prototype integration runner', () => {
  assert.match(packageJson.scripts.test, /^node --test /u);
  assert.doesNotMatch(packageJson.scripts.test, /engine\/test_suite\.mjs/u);
  assert.match(packageJson.scripts['test:prototype-integration'], /engine\/test_suite\.mjs/u);
});
