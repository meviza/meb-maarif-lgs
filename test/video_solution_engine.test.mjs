import assert from 'node:assert/strict';
import test from 'node:test';
import { JevVideoSolutionEngine } from '../engine/jev_video_solution_engine.mjs';

test('uses correctOption for video narration and LaTeX answer key', () => {
  const engine = new JevVideoSolutionEngine();
  const artifact = engine.generateVideoScript({
    id: 'DEMO-01',
    topic: 'Test konusu',
    stimulus: 'Doğru seçeneği bulmak için yeterli öncül bilgisi.',
    stem: 'Doğru seçenek hangisidir?',
    options: { A: 'Bir', B: 'İki', C: 'Üç', D: 'Dört' },
    correctOption: 'C',
    solutionStrategy: 'Önce öncülü çözümle.',
    detailedSolution: 'Öncül, doğru seçeneğin C olduğunu gösterir.',
    distractors: { A: 'Birinci hata', B: 'İkinci hata', D: 'Üçüncü hata' }
  });

  assert.match(artifact.storyboard[4].voiceover, /C seçeneğine/);
  assert.match(artifact.typesettingMetadata.latexCode, /\\correct\{C\}/);
});

test('rejects a video script when the question has no declared answer key', () => {
  const engine = new JevVideoSolutionEngine();

  assert.throws(
    () => engine.generateVideoScript({
      id: 'DEMO-02',
      topic: 'Test konusu',
      stimulus: 'Yeterli öncül bilgisi.',
      stem: 'Doğru seçenek hangisidir?',
      options: { A: 'Bir', B: 'İki', C: 'Üç', D: 'Dört' }
    }),
    /geçerli doğru seçenek/i
  );
});
