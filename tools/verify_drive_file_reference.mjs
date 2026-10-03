#!/usr/bin/env node
import { verifyDriveFileReference } from '../packages/storage/drive_file_reference_integrity.mjs';

const failure = () => ({ state: 'invalid_input', byteLength: 0, sha256: null });
const MAX_INPUT_BYTES = 32768;
async function boundedStdin() {
  let byteLength = 0;
  const chunks = [];
  const parse = () => {
    const text = Buffer.concat(chunks, byteLength).toString('utf8');
    // One-shot transport: signed URLs never enter argv, files, or terminal echoes.
    if (!text || /[\r\n]/.test(text.replace(/\r?\n$/, ''))) throw new Error();
    return JSON.parse(text);
  };
  for await (const chunk of process.stdin) {
    byteLength += chunk.byteLength;
    if (byteLength > MAX_INPUT_BYTES) throw new Error();
    chunks.push(chunk);
    // The interactive tool sends a line, not EOF. Returning from this iterator
    // closes its input stream and prevents a still-open pipe blocking exit.
    if (chunk.includes(10)) return parse();
  }
  return parse();
}
let output;
try {
  if (process.argv.length !== 2) throw new Error();
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => { process.stdin.destroy(); reject(new Error()); }, 5000); });
  let input;
  try { input = await Promise.race([boundedStdin(), timeout]); }
  finally { clearTimeout(timer); }
  output = await verifyDriveFileReference(input);
} catch { output = failure(); }
process.stdout.write(JSON.stringify(output) + '\n');
if (!['verified', 'network_not_enabled'].includes(output.state)) process.exitCode = 1;
