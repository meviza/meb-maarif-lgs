#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createLocalStudentServer } from '../packages/student/local_student_server.mjs';

// Intentionally no --host, context injection, real auth, SDK or external provider.
try {
  if (process.argv.length !== 2) throw new Error('Usage: node tools/student_preview.mjs (fixed loopback port 3335)');
  const bytes = await readFile(new URL('../sources/meb-reference-registry.json', import.meta.url));
  if (bytes.length > 1024 * 1024) throw new Error('source_registry_byte_limit');
  const sourceRegistry = JSON.parse(bytes.toString('utf8'));
  const server = createLocalStudentServer({ sourceRegistry });
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'student_preview_port_3335_in_use' : 'student_preview_server_error'); process.exitCode = 1; });
  server.listen(3335, '127.0.0.1', () => console.log('Synthetic grade-6 student preview: http://127.0.0.1:3335 — no published content or production authentication.'));
  const close = () => { server.closeAllConnections?.(); server.close(() => process.exit(0)); };
  process.once('SIGINT', close); process.once('SIGTERM', close);
} catch (error) { console.error(error.message ?? 'student_preview_failed'); process.exitCode = 1; }
