import assert from 'node:assert/strict';
import test from 'node:test';
import { JevSelfCorrectionPipeline } from '../engine/jev_self_correction.mjs';

test('does not report a rejected terminal fallback as a successful generation', async () => {
  const pipeline = new JevSelfCorrectionPipeline();
  pipeline.maxAttempts = 0;

  const result = await pipeline.produceQuestion({
    course: 'matematik',
    topic: 'Test konusu',
    outcomeCode: 'NOT-A-CURRICULUM-CODE',
    difficulty: 'KAVRAMA'
  });

  assert.equal(result.audit.passed, false);
  assert.equal(result.success, false);
  assert.equal(result.publicationEligible, false);
});
