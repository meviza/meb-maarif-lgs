import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseCaptionReviewPreviewArgs } from '../tools/caption_review_preview.mjs';

test('caption preview binds a fixed loopback host and accepts only a bounded port', () => {
  assert.deepEqual(parseCaptionReviewPreviewArgs([]), { host: '127.0.0.1', port: 3339 });
  assert.deepEqual(parseCaptionReviewPreviewArgs(['--port', '0']), { host: '127.0.0.1', port: 0 });
  assert.deepEqual(parseCaptionReviewPreviewArgs(['--port', '65535']), { host: '127.0.0.1', port: 65535 });
  assert.equal(Object.isFrozen(parseCaptionReviewPreviewArgs([])), true);
});

test('caption preview rejects host overrides, ambiguous arguments and executable hooks', () => {
  for (const args of [['--host', '0.0.0.0'], ['--port'], ['--port', '80'], ['--port', '65536'],
    ['--port', '03339'], ['--port', '-1'], ['--port', '1e4'], ['--port', '3339', '--port', '3340'],
    ['--out', '/tmp/unused'], [3339]]) {
    assert.throws(() => parseCaptionReviewPreviewArgs(args), /invalid_caption_review_preview_args/u);
  }
  let called = 0;
  const hook = [];
  Object.defineProperty(hook, '0', { enumerable: true, get() { called++; return '--port'; } });
  assert.throws(() => parseCaptionReviewPreviewArgs(hook), /invalid_caption_review_preview_args/u);
  assert.equal(called, 0);
  assert.throws(() => parseCaptionReviewPreviewArgs(new Proxy([], {})), /invalid_caption_review_preview_args/u);
});

test('invalid caption preview invocation fails before server startup', () => {
  const file = fileURLToPath(new URL('../tools/caption_review_preview.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [file, '--host', '0.0.0.0'], { encoding: 'utf8', timeout: 3000 });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr.trim(), 'invalid_caption_review_preview_args');
});
