import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseCaptionReviewPreviewArgs } from '../tools/caption_review_preview.mjs';

test('caption preview chooses an explicit trusted preset without changing the legacy default', () => {
  assert.deepEqual(parseCaptionReviewPreviewArgs([]), { host: '127.0.0.1', port: 3339 });
  for (const preset of ['garden', 'concept', 'perimeter', 'area']) {
    const options = parseCaptionReviewPreviewArgs(['--preset', preset]);
    assert.deepEqual(options, { host: '127.0.0.1', port: 3339, presetId: preset });
    assert.equal(Object.isFrozen(options), true);
  }
});

test('caption preview accepts only unique bounded preset and port pairs in either order', () => {
  assert.deepEqual(parseCaptionReviewPreviewArgs(['--preset', 'area', '--port', '0']), { host: '127.0.0.1', port: 0, presetId: 'area' });
  assert.deepEqual(parseCaptionReviewPreviewArgs(['--port', '65535', '--preset', 'concept']), { host: '127.0.0.1', port: 65535, presetId: 'concept' });
  for (const args of [['--preset', 'same-area'], ['--preset', '/tmp/source.json'], ['--preset', 'area', '--preset', 'concept'],
    ['--preset', 'area', '--port', '80'], ['--preset'], ['--preset', 'area', '--host', '0.0.0.0']]) {
    assert.throws(() => parseCaptionReviewPreviewArgs(args), /invalid_caption_review_preview_args/u);
  }
});

test('unknown preset fails before any local preview startup', () => {
  const file = fileURLToPath(new URL('../tools/caption_review_preview.mjs', import.meta.url));
  const outcome = spawnSync(process.execPath, [file, '--preset', 'same-area'], { encoding: 'utf8', timeout: 3000 });
  assert.equal(outcome.status, 1); assert.equal(outcome.stdout, '');
  assert.equal(outcome.stderr.trim(), 'invalid_caption_review_preview_args');
});

test('revoked Proxy arguments receive the closed CLI rejection rather than native Array access', () => {
  const { proxy, revoke } = Proxy.revocable([], {}); revoke();
  assert.throws(() => parseCaptionReviewPreviewArgs(proxy), error => error.message === 'invalid_caption_review_preview_args');
});
