import { constants, lstat, mkdir, open, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const MAX_ARCHIVE_BYTES = 300 * 1024 * 1024;
const CHUNK_BYTES = 64 * 1024;

function sameFile(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size &&
    left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs;
}

async function openRegular(file, expected = null) {
  if (typeof constants.O_NOFOLLOW !== 'number') throw new Error('nofollow_not_supported');
  const before = await lstat(file);
  if (!before.isFile() || before.isSymbolicLink()) throw new Error('source_not_regular');
  if (expected && !sameFile(before, expected)) throw new Error('source_changed');
  let handle;
  try {
    handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const details = await handle.stat();
    if (!details.isFile() || !sameFile(before, details)) throw new Error('source_changed');
    return { handle, details };
  } catch (error) { await handle?.close().catch(() => {}); throw error; }
}

async function assertSourceStable(file, handle, details) {
  const after = await handle.stat();
  const currentPath = await lstat(file);
  if (!after.isFile() || currentPath.isSymbolicLink() || !currentPath.isFile() ||
    !sameFile(details, after) || !sameFile(details, currentPath)) throw new Error('source_changed');
}

async function consumeBounded(handle, maxBytes, onChunk) {
  const buffer = Buffer.allocUnsafe(CHUNK_BYTES);
  let byteLength = 0;
  while (true) {
    // One excess byte is enough to detect growth; never read it into an
    // unbounded allocation or write an over-budget chunk to a destination.
    const readLength = Math.min(CHUNK_BYTES, maxBytes - byteLength + 1);
    const { bytesRead } = await handle.read(buffer, 0, readLength, byteLength);
    if (bytesRead === 0) break;
    if (byteLength + bytesRead > maxBytes) throw new Error('artifact_byte_limit');
    await onChunk(buffer.subarray(0, bytesRead));
    byteLength += bytesRead;
  }
  return byteLength;
}

async function hashOpened(source, file, maxBytes) {
  const digest = createHash('sha256');
  const byteLength = await consumeBounded(source.handle, Math.min(maxBytes, source.details.size), chunk => digest.update(chunk));
  if (byteLength !== source.details.size) throw new Error('source_changed');
  await assertSourceStable(file, source.handle, source.details);
  return { sha256: digest.digest('hex'), byteLength };
}

export async function hashArtifact(file, { maxBytes = MAX_ARCHIVE_BYTES } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_ARCHIVE_BYTES) throw new Error('artifact_byte_limit');
  const source = await openRegular(file);
  try { return (await hashOpened(source, file, maxBytes)).sha256; }
  finally { await source.handle.close(); }
}

async function copyOpened(source, artifact, destination) {
  let output;
  try {
    output = await open(destination, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    const destinationIdentity = await output.stat();
    const digest = createHash('sha256');
    let outputPosition = 0;
    const byteLength = await consumeBounded(source.handle, artifact.byteLength, async chunk => {
      digest.update(chunk);
      let chunkPosition = 0;
      while (chunkPosition < chunk.length) {
        const { bytesWritten } = await output.write(chunk, chunkPosition, chunk.length - chunkPosition, outputPosition);
        if (bytesWritten < 1) throw new Error('copied_write_failed');
        chunkPosition += bytesWritten;
        outputPosition += bytesWritten;
      }
    });
    if (byteLength !== artifact.byteLength) throw new Error('source_changed');
    await assertSourceStable(artifact.sourcePath, source.handle, source.details);
    if (digest.digest('hex') !== artifact.sha256) throw new Error('source_integrity_mismatch');
    await output.sync();
    const written = await output.stat();
    if (!written.isFile() || written.dev !== destinationIdentity.dev || written.ino !== destinationIdentity.ino || written.size !== byteLength) throw new Error('copied_changed');
    await output.close();
    output = null;
    const copied = await openRegular(destination, written);
    try {
      if ((await hashOpened(copied, destination, artifact.byteLength)).sha256 !== artifact.sha256) throw new Error('copied_integrity_mismatch');
    } finally { await copied.handle.close(); }
  } finally { await output?.close().catch(() => {}); }
}

// Explicit, non-student inventory only. No recursive source scans or deletions.
// Copying into a Drive Desktop mount does not prove server-side synchronization.
export async function copyVerifiedArtifactSet({ artifacts, targetDirectory, maxTotalBytes = MAX_ARCHIVE_BYTES }) {
  if (!Array.isArray(artifacts) || artifacts.length < 1 || artifacts.length > 256) throw new Error('bounded_inventory_required');
  if (typeof targetDirectory !== 'string' || !path.isAbsolute(targetDirectory) || !/^k12-archive-[a-zA-Z0-9-]{1,64}$/.test(path.basename(targetDirectory))) throw new Error('dedicated_archive_directory_required');
  if (!Number.isSafeInteger(maxTotalBytes) || maxTotalBytes < 1 || maxTotalBytes > MAX_ARCHIVE_BYTES) throw new Error('archive_budget');
  let totalBytes = 0;
  const names = new Set(), verified = [];
  for (const artifact of artifacts) {
    if (!artifact || !['public_reference', 'original_review_draft', 'project_evidence'].includes(artifact.classification)) throw new Error('unsupported_classification');
    if (typeof artifact.archiveName !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,180}$/.test(artifact.archiveName) || ['archive-manifest.json', 'archive-manifest.failed.json'].includes(artifact.archiveName) || names.has(artifact.archiveName)) throw new Error('invalid_archive_name');
    if (typeof artifact.sourcePath !== 'string' || !path.isAbsolute(artifact.sourcePath) || !/^[a-f0-9]{64}$/.test(artifact.sha256 || '')) throw new Error('invalid_source_integrity_record');
    const entry = { sourcePath: artifact.sourcePath, archiveName: artifact.archiveName, sha256: artifact.sha256, classification: artifact.classification };
    const source = await openRegular(entry.sourcePath);
    let hashed;
    try {
      if (source.details.size > maxTotalBytes - totalBytes) throw new Error('archive_budget');
      hashed = await hashOpened(source, entry.sourcePath, maxTotalBytes - totalBytes);
      if (hashed.sha256 !== entry.sha256) throw new Error('source_integrity_mismatch');
    } finally { await source.handle.close(); }
    totalBytes += hashed.byteLength;
    names.add(artifact.archiveName);
    verified.push({ ...entry, byteLength: hashed.byteLength, sourceIdentity: source.details });
  }
  // No recursive mkdir or overwrite: the destination's parent must be explicitly prepared.
  await mkdir(targetDirectory);
  const directoryIdentity = await lstat(targetDirectory);
  const report = { schemaVersion: 'verified-project-archive/v1', state: 'copy_in_progress', remoteSyncState: 'not_verified', totalBytes, artifacts: [] };
  const assertDirectoryStable = async () => {
    const details = await lstat(targetDirectory);
    if (!details.isDirectory() || details.isSymbolicLink() || details.dev !== directoryIdentity.dev || details.ino !== directoryIdentity.ino) throw new Error('archive_directory_changed');
  };
  try {
    for (const artifact of verified) {
      await assertDirectoryStable();
      const source = await openRegular(artifact.sourcePath, artifact.sourceIdentity);
      try { await copyOpened(source, artifact, path.join(targetDirectory, artifact.archiveName)); }
      finally { await source.handle.close(); }
      await assertDirectoryStable();
      report.artifacts.push({ archiveName: artifact.archiveName, sha256: artifact.sha256, byteLength: artifact.byteLength, classification: artifact.classification });
    }
    report.state = 'local_copy_verified';
    report.copiedAt = new Date().toISOString();
    await assertDirectoryStable();
    await writeFile(path.join(targetDirectory, 'archive-manifest.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    return report;
  } catch (error) {
    // Retain a recoverable partial set, never recursively delete user data or
    // present it as a verified archive. Error details/paths are not uploaded.
    report.state = 'local_copy_failed';
    report.failedAt = new Date().toISOString();
    report.errorCode = /^[a-z_]+$/.test(error.message) ? error.message : 'archive_io_error';
    try {
      await assertDirectoryStable();
      await writeFile(path.join(targetDirectory, 'archive-manifest.failed.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    } catch { /* Keep the original error if the partial location is unavailable. */ }
    error.partialArchiveDirectory = targetDirectory;
    throw error;
  }
}
