#!/usr/bin/env node
import { constants, lstat, open } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { renderInkVideo } from '../packages/media/ink_video_renderer.mjs';

async function manifestFromFile(path) {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size < 1 || before.size > 32768) throw new Error();
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const start = await file.stat(), buffer = Buffer.alloc(32769); let at = 0;
    if (start.ino !== before.ino || start.size !== before.size) throw new Error();
    while (at < buffer.length) { const { bytesRead } = await file.read(buffer, at, buffer.length - at, at); if (!bytesRead) break; at += bytesRead; }
    const after = await file.stat();
    if (at !== start.size || at > 32768 || after.mtimeMs !== start.mtimeMs || after.ctimeMs !== start.ctimeMs) throw new Error();
    return JSON.parse(buffer.subarray(0, at).toString('utf8'));
  } finally { await file.close(); }
}
try {
  const args = process.argv.slice(2), seen = new Set(), runtime = {};
  const runtimeFlags = { '--sharp-package': 'sharpPackage', '--ffmpeg': 'ffmpegPath', '--ffprobe': 'ffprobePath' };
  let out, audioPath;
  for (let i = 0; i < args.length; i += 2) {
    const [key, value] = args.slice(i, i + 2);
    if (!['--out', '--audio-manifest', ...Object.keys(runtimeFlags)].includes(key) || !value || value.startsWith('--') || seen.has(key) || !isAbsolute(value) || /[\0\r\n]/.test(value)) throw new Error();
    seen.add(key);
    if (key === '--out') out = value;
    if (key === '--audio-manifest') audioPath = value;
    if (runtimeFlags[key]) runtime[runtimeFlags[key]] = value;
  }
  if (!out) throw new Error();
  const audioManifest = audioPath ? await manifestFromFile(audioPath) : null;
  const receipt = await renderInkVideo({ outputDirectory: out, runtime, audioManifest });
  console.log(JSON.stringify({ outputDirectory: out, receipt }));
} catch { console.error('ink_render_request_rejected'); process.exitCode = 1; }
