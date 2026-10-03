#!/usr/bin/env node
import { constants, lstat, open } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { assertLocalAudioDataPath, prepareInkAudio } from '../packages/media/prepare_ink_audio.mjs';

async function boundedStyle(path) {
  await assertLocalAudioDataPath(path, 'file');
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size < 1 || before.size > 2000) throw new Error();
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const start = await file.stat();
    if (start.size < 1 || start.size > 2000 || before.ino !== start.ino || before.dev !== start.dev || before.size !== start.size || before.mtimeMs !== start.mtimeMs || before.ctimeMs !== start.ctimeMs) throw new Error();
    const bytes = Buffer.alloc(start.size + 1); let at = 0;
    while (at < bytes.length) {
      const { bytesRead } = await file.read(bytes, at, bytes.length - at, at);
      if (!bytesRead) break;
      at += bytesRead;
    }
    const after = await file.stat();
    if (at !== start.size || start.size !== after.size || start.mtimeMs !== after.mtimeMs || start.ctimeMs !== after.ctimeMs) throw new Error();
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, at)).trim();
  } finally { await file.close(); }
}

try {
  const args = process.argv.slice(2), values = {}, allowed = ['--source-dir', '--out', '--style-file'];
  for (let index = 0; index < args.length; index += 2) {
    const [key, value] = args.slice(index, index + 2);
    if (!allowed.includes(key) || Object.hasOwn(values, key) || typeof value !== 'string' || value.length > 4096 || !isAbsolute(value) || /[\0\r\n]/.test(value)) throw new Error();
    values[key] = value;
  }
  if (allowed.some(key => !Object.hasOwn(values, key))) throw new Error();
  const style = await boundedStyle(values['--style-file']);
  const { receipt } = await prepareInkAudio({
    sourceDirectory: values['--source-dir'], outputDirectory: values['--out'], style,
    provider: 'Google AI Studio', modelId: 'gemini-3.8-flash-tts', voiceId: 'Charon', ffmpegPath: '/opt/homebrew/bin/ffmpeg',
  });
  console.log(JSON.stringify({ outputDirectory: values['--out'], preparedCues: receipt.segments.length, publicationReady: false }));
} catch { console.error('ink_audio_prepare_request_rejected'); process.exitCode = 1; }
