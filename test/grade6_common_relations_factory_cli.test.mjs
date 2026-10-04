import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm, readFile, readdir, lstat, mkdir, writeFile, symlink, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const cli = fileURLToPath(new URL('../tools/content_factory_pilot.mjs', import.meta.url));
const repository = fileURLToPath(new URL('..', import.meta.url));
const run = (argv, target = cli, preload = null) => spawnSync(process.execPath, [...(preload ? ['--import', preload] : []), target, ...argv], {
  encoding: 'utf8', timeout: 15000, maxBuffer: 2 * 1024 * 1024,
});
async function temporary(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'k12-common-factory-cli-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const common = out => ['--domain', 'grade6_common_relations', '--out', out];
async function missing(path) { await assert.rejects(lstat(path), error => error.code === 'ENOENT'); }
function rejected(result) {
  assert.equal(result.status, 1, result.stdout);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^grade6_common_relations_factory_(?:invalid_args|failed)\n$/);
}
async function isolated(t) {
  const root = await temporary(t);
  await mkdir(join(root, 'tools')); await mkdir(join(root, 'sources'));
  await symlink(join(repository, 'packages'), join(root, 'packages'), 'dir');
  await copyFile(cli, join(root, 'tools', 'content_factory_pilot.mjs'));
  for (const name of ['grade6-common-relations-application-observations', 'grade6-source-semantic-candidate-matrix', 'meb-reference-registry']) {
    await copyFile(join(repository, 'sources', name + '.json'), join(root, 'sources', name + '.json'));
  }
  return { root, target: join(root, 'tools', 'content_factory_pilot.mjs') };
}

test('closed common domain creates its own three-file editor packet instead of rectangle dispatch', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const result = run(['--domain', 'grade6_common_relations', '--out', out]);
  assert.equal(result.status, 0, `expected common dispatch, got ${result.stderr}`);
  assert.equal(result.stderr, '');
  assert.deepEqual((await readdir(out)).sort(), ['batch.json', 'manifest.json', 'preview.html']);
  const packet = JSON.parse(await readFile(join(out, 'batch.json'), 'utf8'));
  assert.equal(packet.schemaVersion, 'grade6-common-relations-factory-preparation/v1');
  assert.equal(packet.state, 'editor_factory_preparation');
  assert.equal(packet.initialReview.html, await readFile(join(out, 'preview.html'), 'utf8'));
  assert.deepEqual(packet.manifest, JSON.parse(await readFile(join(out, 'manifest.json'), 'utf8')));
  assert.equal((await lstat(out)).mode & 0o777, 0o700);
  for (const file of ['batch.json', 'manifest.json', 'preview.html']) {
    assert.equal((await lstat(join(out, file))).mode & 0o777, 0o600);
  }
});

test('common consumer preserves two different quantity strategies and does not count narration jobs as new questions', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const result = run(common(out));
  assert.equal(result.status, 0, result.stderr);
  const packet = JSON.parse(await readFile(join(out, 'batch.json'), 'utf8'));
  assert.equal(packet.verification.valid, true);
  assert.deepEqual(packet.verification.recomputed.commonPositiveTimes, [24, 48]);
  assert.deepEqual(packet.verification.recomputed.commonPositiveGroupSizes, [1, 2, 3, 4, 6, 12]);
  assert.deepEqual(packet.scenePlan.givenGeometry.grouping.rows.map(row => [row.size, row.packageCounts]),
    [[1, [24, 36]], [2, [12, 18]], [3, [8, 12]], [4, [6, 9]], [6, [4, 6]], [12, [2, 3]]]);
  assert.deepEqual(packet.preparation.contexts.map(context => context.contextId), ['repeat', 'grouping']);
  assert.deepEqual(packet.scenePlan.contexts.map(context => context.literalUnits), [['minute'], ['card_per_package', 'package']]);
  assert.deepEqual(packet.manifest.counts, { existingAuthoredDrafts: 1, contextNarrationJobs: 2,
    newAuthoredQuestions: 0, acceptedProductQuestions: 0, publishedQuestions: 0 });
  for (const gate of ['activeProgram', 'pedagogy', 'rights', 'difficulty', 'answer', 'accessibility']) {
    assert.equal(packet.manifest.gates[gate], 'pending');
  }
  for (const flag of ['publicationReady', 'learnerReady', 'productionReady']) assert.equal(packet.manifest[flag], false);
  assert.equal(packet.manifest.geometryPreparation.genericResolverSupported, false);
  assert.equal(packet.manifest.geometryPreparation.specializedScenePrepared, true);
  assert.equal(packet.manifest.activity.providerCallsMade, 0);
  for (const context of packet.preparation.contexts) {
    assert.equal(context.job.provider, null); assert.equal(context.audioRequest.providerCallsAllowed, false);
  }
  assert.equal(Object.hasOwn(packet, 'items'), false);
});

test('stdout reports actual readback disk bytes rather than domain-separated object hashes', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const result = run(common(out)); assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.domain, 'grade6_common_relations');
  assert.equal(receipt.state, 'editor_factory_preparation');
  assert.equal(receipt.readbackVerified, true);
  assert.equal(receipt.serializedAuthority, 'none');
  assert.deepEqual(receipt.files.map(file => file.filename), ['batch.json', 'preview.html', 'manifest.json']);
  const caps = { 'batch.json': 524288, 'preview.html': 65536, 'manifest.json': 16384 };
  for (const file of receipt.files) {
    const bytes = await readFile(join(out, file.filename));
    assert.equal(file.byteLength, bytes.length); assert.equal(file.sha256, sha(bytes));
    assert.ok(bytes.length > 0 && bytes.length <= caps[file.filename]);
  }
});

test('initial preview is current-only while the separately labelled batch remains answer-bearing editor data', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const result = run(common(out)); assert.equal(result.status, 0, result.stderr);
  const packet = JSON.parse(await readFile(join(out, 'batch.json'), 'utf8'));
  const html = await readFile(join(out, 'preview.html'), 'utf8');
  assert.equal(packet.initialFrame.frame.contextId, 'repeat');
  assert.equal(packet.initialFrame.frame.cueIndex, 0); assert.equal(packet.initialFrame.frame.pageIndex, 0);
  assert.equal(packet.initialFrame.frame.progress, 0); assert.equal(packet.initialFrame.frame.revealRequested, false);
  assert.equal(packet.initialFrame.frame.resultVisible, false);
  assert.equal(packet.manifest.answerBearingEditorArtifact, true);
  assert.equal(packet.manifest.artifactAudience, 'editor_only');
  assert.equal(packet.manifest.serializedAuthority, 'none');
  assert.equal(html.includes('24 ve 48, başlangıçtan sonra iki döngünün birlikte başlangıç noktasına döndüğü dakika işaretleridir.'), false);
  assert.doesNotMatch(html, /<script\b|\bon\w+\s*=|<(?:iframe|audio|video)\b/i);
  assert.match(html, /Content-Security-Policy/);
});

test('common rejects closed-mode overrides and malformed flags without creating any output', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const invalid = [[], ['--domain'], ['--domain', 'garden', '--out', out],
    ['--domain', 'GRADE6_COMMON_RELATIONS', '--out', out], ['--domain', 'grade6_common_relations'],
    ...['--count', '--metadata', '--provider', '--sourcepath', '--source-path', '--source', '--cue', '--cueIndex', '--reveal', '--grade', '--tenant', '--host', '--file', '--url', '--unknown'].map(flag => [...common(out), flag, '1']),
    [...common(out), '--domain', 'grade6_common_relations'], [...common(out), '--out', out],
    ['--domain=grade6_common_relations', '--out', out], ['--domain', 'grade6_common_relations', '--out=' + out],
    ['--domain', 'grade6_common_relations', '--out', '--count'], [...common(out), 'stray'],
    ['--domain', 'grade6_common_relations', '--out', 'relative/output'],
    ['--domain', 'grade6_common_relations', '--out', out + '/'],
    ['--domain', 'grade6_common_relations', '--out', out + '/.'],
    ['--domain', 'grade6_common_relations', '--out', root + '/new/../new-output'],
    ['--domain', 'grade6_common_relations', '--out', root + '//new-output']];
  // No-argument normal CLI is separately covered below; use a domain token
  // for the missing-value case so this assertion describes the new boundary.
  invalid[0] = ['--domain', 'grade6_common_relations', '--out'];
  for (const argv of invalid) {
    const result = run(argv); rejected(result); await missing(out);
    assert.equal(result.stderr.includes(root), false);
  }
});

test('common rejects existing empty/nonempty outputs, leaf and ancestor symlinks without overwriting', async t => {
  const root = await temporary(t), empty = join(root, 'empty'), occupied = join(root, 'occupied');
  await mkdir(empty); await mkdir(occupied); await writeFile(join(occupied, 'sentinel'), 'keep');
  for (const out of [empty, occupied]) rejected(run(common(out)));
  assert.deepEqual(await readdir(empty), []); assert.equal(await readFile(join(occupied, 'sentinel'), 'utf8'), 'keep');
  const link = join(root, 'linked'); await symlink(occupied, link, 'dir'); rejected(run(common(link)));
  rejected(run(common(join(link, 'new-output')))); await missing(join(occupied, 'new-output'));
  const file = join(root, 'not-directory'); await writeFile(file, 'keep'); rejected(run(common(join(file, 'new-output'))));
  assert.equal(await readFile(file, 'utf8'), 'keep');
  rejected(run(common(join(root, 'missing-parent', 'new-output')))); await missing(join(root, 'missing-parent'));
});

test('common source pin drift and duplicate canonical source rows fail before reserving output with sanitized diagnostics', async t => {
  const { root, target } = await isolated(t), out = join(root, 'new-output');
  const file = join(root, 'sources', 'meb-reference-registry.json');
  const main = JSON.parse(await readFile(file, 'utf8'));
  const row = main.sources.find(source => source.id === 'tymm-current-ortaokul-matematik');
  main.sources.push(structuredClone(row)); await writeFile(file, JSON.stringify(main));
  rejected(run(common(out), target)); await missing(out);
  main.sources.pop(); row.reuseRights = 'approved'; await writeFile(file, JSON.stringify(main));
  rejected(run(common(out), target)); await missing(out);
});

test('common bounded source reader rejects symlink, oversize and invalid UTF-8 without exposing local paths', async t => {
  const { root, target } = await isolated(t), out = join(root, 'new-output');
  const file = join(root, 'sources', 'grade6-common-relations-application-observations.json');
  const original = await readFile(file);
  await rm(file); await symlink(join(root, 'sources', 'grade6-source-semantic-candidate-matrix.json'), file);
  rejected(run(common(out), target)); await missing(out);
  await rm(file); await writeFile(file, Buffer.alloc(524289, 32));
  rejected(run(common(out), target)); await missing(out);
  await writeFile(file, Buffer.from([0xc3, 0x28])); rejected(run(common(out), target)); await missing(out);
  await writeFile(file, original);
});

test('output ancestor identity change after directory reservation causes no file writes to replacement or displaced directories', async t => {
  const root = await temporary(t), parent = join(root, 'parent'), out = join(parent, 'new-output');
  await mkdir(parent);
  const code = `import fs from 'node:fs'; const original = fs.mkdirSync; const out=${JSON.stringify(out)}, parent=${JSON.stringify(parent)}; fs.mkdirSync=function(path,...rest){ const value=original.call(this,path,...rest); if(path===out){ fs.renameSync(parent,parent+'-displaced'); original.call(this,parent); } return value; };`;
  const preload = 'data:text/javascript,' + encodeURIComponent(code);
  rejected(run(common(out), cli, preload));
  assert.deepEqual(await readdir(parent), []);
  const displaced = join(parent + '-displaced', 'new-output');
  assert.deepEqual(await readdir(displaced), []);
});

test('a previously written file changed during later writes cannot receive a successful disk readback receipt', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const code = `import fs from 'node:fs'; const write=fs.writeSync; let changed=false; fs.writeSync=function(fd,bytes,...rest){ const n=write.call(this,fd,bytes,...rest); if(!changed && Buffer.isBuffer(bytes) && bytes.toString('utf8',0,32).toLowerCase().startsWith('<!doctype html')){ changed=true; fs.writeFileSync('batch.json','tampered-after-first-write'); } return n; };`;
  rejected(run(common(out), cli, 'data:text/javascript,' + encodeURIComponent(code)));
  assert.equal(await readFile(join(out, 'batch.json'), 'utf8'), 'tampered-after-first-write');
});

test('a file collision at exclusive-open preserves existing bytes and never emits a success receipt', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const code = `import fs from 'node:fs'; const open=fs.openSync; let injected=false; fs.openSync=function(path,flags,...rest){ if(!injected && path==='batch.json' && (flags&fs.constants.O_CREAT)){ injected=true; fs.writeFileSync(path,'preserve-existing-sentinel'); } return open.call(this,path,flags,...rest); };`;
  rejected(run(common(out), cli, 'data:text/javascript,' + encodeURIComponent(code)));
  assert.equal(await readFile(join(out, 'batch.json'), 'utf8'), 'preserve-existing-sentinel');
  assert.deepEqual(await readdir(out), ['batch.json']);
});

test('ancestor replacement immediately before file open cannot redirect relative writes away from the pinned created directory', async t => {
  const root = await temporary(t), parent = join(root, 'parent'), out = join(parent, 'new-output');
  await mkdir(parent);
  const code = `import fs from 'node:fs'; const open=fs.openSync; let changed=false; const parent=${JSON.stringify(parent)}; fs.openSync=function(path,...rest){ if(!changed && path==='batch.json'){ changed=true; fs.renameSync(parent,parent+'-displaced'); fs.mkdirSync(parent); fs.mkdirSync(parent+'/new-output'); fs.writeFileSync(parent+'/new-output/sentinel','replacement-untouched'); } return open.call(this,path,...rest); };`;
  rejected(run(common(out), cli, 'data:text/javascript,' + encodeURIComponent(code)));
  assert.deepEqual(await readdir(out), ['sentinel']);
  assert.equal(await readFile(join(out, 'sentinel'), 'utf8'), 'replacement-untouched');
  assert.deepEqual(await readdir(join(parent + '-displaced', 'new-output')), ['batch.json']);
});

test('changed earlier readback during a later read is detected by the completed-set identity pass', async t => {
  const root = await temporary(t), out = join(root, 'new-output');
  const code = `import fs from 'node:fs'; const read=fs.readSync; let changed=false; fs.readSync=function(fd,buffer,...rest){ const count=read.call(this,fd,buffer,...rest); if(!changed && count>0 && buffer.toString('utf8',0,32).toLowerCase().startsWith('<!doctype html')){ changed=true; fs.writeFileSync('batch.json','tampered-after-first-readback'); } return count; };`;
  rejected(run(common(out), cli, 'data:text/javascript,' + encodeURIComponent(code)));
  assert.equal(await readFile(join(out, 'batch.json'), 'utf8'), 'tampered-after-first-readback');
});

test('source leaf replacement during snapshot read is rejected before output reservation', async t => {
  const { root, target } = await isolated(t), out = join(root, 'new-output');
  const source = join(root, 'sources', 'meb-reference-registry.json');
  const code = `import fs from 'node:fs'; const open=fs.openSync, read=fs.readSync; let held=null, changed=false; const source=${JSON.stringify(source)}; fs.openSync=function(path,...rest){ const fd=open.call(this,path,...rest); if(path===source)held=fd; return fd; }; fs.readSync=function(fd,...rest){ const count=read.call(this,fd,...rest); if(!changed && fd===held && count>0){ changed=true; fs.renameSync(source,source+'.old'); fs.copyFileSync(source+'.old',source); } return count; };`;
  rejected(run(common(out), target, 'data:text/javascript,' + encodeURIComponent(code))); await missing(out);
});

test('common accepts reversed closed flag order and literal Unicode new directory names without path normalization', async t => {
  const root = await temporary(t), out = join(root, 'inceleme-şğ');
  const result = run(['--out', out, '--domain', 'grade6_common_relations']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).out, out);
  assert.deepEqual((await readdir(out)).sort(), ['batch.json', 'manifest.json', 'preview.html']);
});

test('normal default/1/12/100 rectangle consumers keep legacy shapes and count100 remains12 drafts88 rejections', async t => {
  const root = await temporary(t);
  for (const [count, produced, rejectedCount] of [[null, 12, 0], [1, 1, 0], [12, 12, 0], [100, 12, 88]]) {
    const out = join(root, 'rectangle-' + count);
    const result = run([...(count === null ? [] : ['--count', String(count)]), '--out', out]);
    assert.equal(result.status, 0, result.stderr);
    const packet = JSON.parse(await readFile(join(out, 'batch.json'), 'utf8'));
    assert.equal(packet.schemaVersion, 'content-factory-pilot-report/v1');
    assert.equal(packet.summary.producedDrafts, produced); assert.equal(packet.summary.rejected, rejectedCount);
    assert.equal(packet.summary.published, 0); assert.equal(packet.providerStatus.livePaidCalls, 0);
    assert.deepEqual((await readdir(out)).sort(), ['audit.json', 'batch.json', 'diagrams', 'preview.html']);
    assert.equal((await readdir(join(out, 'diagrams'))).length, produced);
  }
  const noOutput = run([]); assert.equal(noOutput.status, 1); assert.equal(noOutput.stdout, '');
  assert.equal(noOutput.stderr, 'explicit_output_directory_required\n');
});

test('normal rectangle metadata option still consumes caller metadata without adding common domain fields', async t => {
  const root = await temporary(t), out = join(root, 'rectangle-output'), metadataPath = join(root, 'metadata.json');
  const metadata = {
    source: { sourceId: 'internal-authoring:rectangle-cli-regression', rightsStatus: 'owned_original', purpose: 'original_math_pilot' },
    curriculum: { mappingStatus: 'unresolved', registryEntryId: null, programVersion: null, grade: null, outcomeCode: null, sourceUrl: null, sourceSha256: null },
    governance: { ownerId: 'content-owner', stewardId: 'math-editor', purpose: 'review_only', retentionPolicyId: 'pilot-review-v1' },
  };
  await writeFile(metadataPath, JSON.stringify(metadata));
  const result = run(['--count', '1', '--out', out, '--metadata', metadataPath]);
  assert.equal(result.status, 0, result.stderr);
  const packet = JSON.parse(await readFile(join(out, 'batch.json'), 'utf8'));
  assert.deepEqual(packet.items[0].metadata, metadata);
  assert.equal(packet.schemaVersion, 'content-factory-pilot-report/v1');
  assert.equal(Object.hasOwn(JSON.parse(result.stdout), 'domain'), false);
});
