import assert from 'node:assert/strict';
import fsPromises, { mkdtemp, writeFile, appendFile, readFile, readdir, rm, symlink, rename } from 'node:fs/promises';
import { constants } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { mock } from 'node:test';
const sha = value => createHash('sha256').update(value).digest('hex');

async function setup(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'k12-archive-test-'));
  t.after(() => rm(root, { recursive: true }));
  const mod = await import('../packages/storage/verified_archive.mjs').catch(() => null);
  assert.ok(mod?.copyVerifiedArtifactSet, 'checksum-bound archive copy must exist');
  const source = path.join(root, 'source.pdf');
  await writeFile(source, '%PDF-1.7\nreference');
  const artifact = { sourcePath: source, archiveName: 'reference.pdf', sha256: sha('%PDF-1.7\nreference'), classification: 'public_reference' };
  return { root, artifact, copy: mod.copyVerifiedArtifactSet, targetDirectory: path.join(root, 'k12-archive-fixture') };
}

test('archive verifies bytes and reports only local copy, not cloud upload confirmation', async t => {
  const { artifact, copy, targetDirectory } = await setup(t);
  const report = await copy({ artifacts: [artifact], targetDirectory });
  assert.equal(report.state, 'local_copy_verified');
  assert.equal(report.remoteSyncState, 'not_verified');
  assert.equal(report.artifacts[0].sha256, sha('%PDF-1.7\nreference'));
  assert.equal((await readFile(path.join(targetDirectory, 'reference.pdf'))).toString(), '%PDF-1.7\nreference');
});

test('hash mismatch and private learner classification are rejected before copying', async t => {
  const { root, artifact, copy, targetDirectory } = await setup(t);
  await assert.rejects(copy({ artifacts: [{ ...artifact, sha256: 'a'.repeat(64) }], targetDirectory }), /source_integrity/);
  await assert.rejects(copy({ artifacts: [{ ...artifact, classification: 'learner_private' }], targetDirectory }), /classification/);
  assert.equal((await readdir(root)).includes('k12-archive-fixture'), false);
});

test('symlinks and path escapes cannot expand the archive scope', async t => {
  const { root, artifact, copy, targetDirectory } = await setup(t);
  const link = path.join(root, 'linked.pdf');
  await symlink(artifact.sourcePath, link);
  await assert.rejects(copy({ artifacts: [{ ...artifact, sourcePath: link }], targetDirectory }), /source_not_regular/);
  await assert.rejects(copy({ artifacts: [{ ...artifact, archiveName: '../escape.pdf' }], targetDirectory }), /archive_name/);
});

test('archive never overwrites a prior set and enforces the total byte budget', async t => {
  const { artifact, copy, targetDirectory } = await setup(t);
  await assert.rejects(copy({ artifacts: [artifact], targetDirectory, maxTotalBytes: 1 }), /archive_budget/);
  await copy({ artifacts: [artifact], targetDirectory });
  await assert.rejects(copy({ artifacts: [artifact], targetDirectory }), /EEXIST/);
  assert.equal((await readFile(path.join(targetDirectory, 'reference.pdf'))).toString(), '%PDF-1.7\nreference');
});

test('artifact hashing enforces an actual byte bound instead of an unbounded stream', async t => {
  const { artifact } = await setup(t);
  const { hashArtifact } = await import('../packages/storage/verified_archive.mjs');
  await assert.rejects(hashArtifact(artifact.sourcePath, { maxBytes: 4 }), /artifact_byte_limit/);
});

async function interceptDescriptorOpen(action, exercise) {
  const realOpen = fsPromises.open;
  const replacement = mock.method(fsPromises, 'open', async (...args) => action(realOpen, ...args));
  syncBuiltinESMExports();
  try { await exercise(); }
  finally { replacement.mock.restore(); syncBuiltinESMExports(); }
}

test('archive stops source growth during hashing at the actual budget before creating a target', async t => {
  const { root, artifact, copy, targetDirectory } = await setup(t);
  await interceptDescriptorOpen(async (realOpen, file, flags, ...rest) => {
    const handle = await realOpen(file, flags, ...rest);
    if (file === artifact.sourcePath) {
      const realRead = handle.read.bind(handle);
      let mutated = false;
      handle.read = async (...args) => {
        const result = await realRead(...args);
        if (!mutated) { mutated = true; await appendFile(file, 'growing-source'); }
        return result;
      };
    }
    return handle;
  }, async () => {
    await assert.rejects(copy({ artifacts: [artifact], targetDirectory, maxTotalBytes: 18 }), /artifact_byte_limit|source_changed/);
    assert.equal((await readdir(root)).includes('k12-archive-fixture'), false);
  });
});

test('archive rejects a replaced source inode even when replacement bytes have the same hash', async t => {
  const { root, artifact, copy, targetDirectory } = await setup(t);
  let sourceOpens = 0;
  await interceptDescriptorOpen(async (realOpen, file, flags, ...rest) => {
    if (file === artifact.sourcePath && ++sourceOpens === 2) {
      await rename(file, path.join(root, 'prior-source.pdf'));
      await writeFile(file, '%PDF-1.7\nreference');
    }
    return realOpen(file, flags, ...rest);
  }, async () => {
    await assert.rejects(copy({ artifacts: [artifact], targetDirectory }), /source_changed/);
    assert.equal((await readdir(targetDirectory)).includes('archive-manifest.json'), false);
  });
});

test('archive fails closed when the source changes while copying and leaves no success manifest', async t => {
  const { artifact, copy, targetDirectory } = await setup(t);
  let sourceOpens = 0;
  await interceptDescriptorOpen(async (realOpen, file, flags, ...rest) => {
    const handle = await realOpen(file, flags, ...rest);
    if (file === artifact.sourcePath && ++sourceOpens === 2) {
      const realRead = handle.read.bind(handle);
      let mutated = false;
      handle.read = async (...args) => {
        const result = await realRead(...args);
        if (!mutated) { mutated = true; await appendFile(file, 'extra'); }
        return result;
      };
    }
    return handle;
  }, async () => {
    await assert.rejects(copy({ artifacts: [artifact], targetDirectory }), /artifact_byte_limit|source_changed/);
    assert.equal((await readdir(targetDirectory)).includes('archive-manifest.json'), false);
    const failed = JSON.parse(await readFile(path.join(targetDirectory, 'archive-manifest.failed.json'), 'utf8'));
    assert.equal(failed.state, 'local_copy_failed');
    assert.equal(failed.remoteSyncState, 'not_verified');
  });
});

test('archive detects copied bytes changed before final verification', async t => {
  const { artifact, copy, targetDirectory } = await setup(t);
  const destination = path.join(targetDirectory, artifact.archiveName);
  await interceptDescriptorOpen(async (realOpen, file, flags, ...rest) => {
    if (file === destination && (flags & constants.O_WRONLY) === 0) await writeFile(file, 'altered copy');
    return realOpen(file, flags, ...rest);
  }, async () => {
    await assert.rejects(copy({ artifacts: [artifact], targetDirectory }), /copied_integrity|copied_changed|source_changed/);
    assert.equal((await readdir(targetDirectory)).includes('archive-manifest.json'), false);
  });
});
