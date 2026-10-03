#!/usr/bin/env node
import { constants, lstat, open } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { renderRectangleVideoPilot } from '../packages/media/rectangle_video_pilot.mjs';

async function boundedBatch(path) {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size > 2 * 1024 * 1024) throw new Error('invalid_batch_file');
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.ino !== before.ino || stat.size !== before.size) throw new Error('unstable_batch_file');
    const chunks = [], buffer = Buffer.allocUnsafe(65536); let size = 0;
    while (true) { const { bytesRead } = await handle.read(buffer, 0, buffer.length, size); if (!bytesRead) break; size += bytesRead; if (size > stat.size || size > 2 * 1024 * 1024) throw new Error('batch_byte_limit'); chunks.push(Buffer.from(buffer.subarray(0, bytesRead))); }
    const after = await handle.stat();
    if (size !== stat.size || after.size !== stat.size || after.mtimeMs !== stat.mtimeMs || after.ctimeMs !== stat.ctimeMs) throw new Error('unstable_batch_file');
    return JSON.parse(Buffer.concat(chunks, size).toString('utf8'));
  } finally { await handle.close(); }
}
try {
  const args = process.argv.slice(2); let batchPath, out, id = 'rectangle-007';
  const runtime = {}, seen = new Set();
  // Explicit administrator-selected runtime paths; these are not factory data.
  const runtimeFlags = { '--sharp-package': 'sharpPackage', '--ffmpeg': 'ffmpegPath', '--ffprobe': 'ffprobePath' };
  for (let index = 0; index < args.length; index += 2) {
    const [key, value] = args.slice(index, index + 2);
    if (!value || !['--batch', '--out', '--id', ...Object.keys(runtimeFlags)].includes(key) || seen.has(key)) throw new Error('invalid_arguments');
    seen.add(key);
    if (key === '--batch') batchPath = value;
    if (key === '--out') out = value;
    if (key === '--id') id = value;
    if (runtimeFlags[key]) runtime[runtimeFlags[key]] = value;
  }
  if (!batchPath || !out || !isAbsolute(batchPath) || !isAbsolute(out) || !/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw new Error('absolute_batch_and_fresh_output_required');
  const batch = await boundedBatch(batchPath);
  if (!Array.isArray(batch.items) || batch.items.length > 100) throw new Error('invalid_pilot_batch');
  const matches = batch.items.filter(item => item.id === id);
  if (matches.length !== 1) throw new Error('unique_pilot_question_required');
  const receipt = await renderRectangleVideoPilot({ question: matches[0], outputDirectory: out, runtime });
  console.log(JSON.stringify({ outputDirectory: out, receipt }));
} catch (error) { console.error(error?.message ?? 'rectangle_video_render_failed'); process.exitCode = 1; }
