import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
test('normal npm entrypoints cannot dispatch legacy approval, seed or cloud mutations', async () => {
  const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  for (const command of ['scale:bank', 'generate:curriculum', 'seed', 'cloud:backup', 'cloud:sync', 'drive:stream']) {
    assert.equal(pkg.scripts[command], `node tools/legacy_quarantine.mjs ${command}`, command);
  }
  assert.equal(pkg.scripts.generate, 'node tools/content_factory_pilot.mjs');
  assert.equal(pkg.scripts['generate:bulk'], 'node tools/content_factory_pilot.mjs --count 100');
});

test('legacy command gate exits before mutation and offers no force override', () => {
  for (const command of ['seed', 'cloud:sync', 'generate:curriculum']) {
    const result = spawnSync(process.execPath, ['tools/legacy_quarantine.mjs', command, '--force'], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 2, command);
    const message = JSON.parse(result.stderr.trim());
    assert.equal(message.state, 'legacy_workflow_quarantined');
    assert.equal(message.sideEffects, false);
    assert.equal(message.publicationEnabled, false);
  }
});
