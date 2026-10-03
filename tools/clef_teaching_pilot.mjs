#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { constants, lstat, mkdir, open, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, parse, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createGardenQuestion, validateQuestion } from '../packages/content-factory/pilot.mjs';
import { createClefAdapter } from '../packages/content-factory/providers.mjs';

const ID = 'garden-two-rows-editor-v1', ESTIMATE = 0.00589824;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const failure = code => Object.assign(new Error(code), { publicCode: code });

function argumentsFor(args) {
  const mode = args[0], allowed = mode === '--prepare' ? ['--out', '--sharp-package'] : mode === '--evaluate' ? ['--prepared', '--out', '--review-record-id', '--max-estimated-usd', '--sharp-package'] : [];
  const values = {};
  if (!allowed.length || args.length !== 1 + allowed.length * 2) throw failure('invalid_arguments');
  for (let index = 1; index < args.length; index += 2) {
    const [key, value] = args.slice(index, index + 2);
    if (!allowed.includes(key) || Object.hasOwn(values, key) || !value || value.startsWith('--')) throw failure('invalid_arguments');
    values[key] = value;
  }
  if (!isAbsolute(values['--sharp-package']) || basename(values['--sharp-package']) !== 'package.json' || basename(dirname(values['--sharp-package'])) !== 'sharp') throw failure('invalid_sharp_package');
  if (mode === '--evaluate') {
    if (!/^[A-Za-z0-9:_-]{1,120}$/u.test(values['--review-record-id'])) throw failure('invalid_review_record');
    const budget = values['--max-estimated-usd'];
    if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/u.test(budget) || !Number.isFinite(Number(budget)) || Number(budget) < ESTIMATE || Number(budget) > 0.01) throw failure('invalid_budget');
  }
  return { mode, values };
}

async function checkedPath(raw, kind) {
  if (typeof raw !== 'string' || !isAbsolute(raw)) throw failure('invalid_path');
  const parts = raw.slice(parse(raw).root.length).split(sep).filter(Boolean);
  if (!parts.length || parts.some(part => part === '.' || part === '..')) throw failure('invalid_path');
  let current = parse(raw).root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part); const last = index === parts.length - 1;
    let stat;
    try { stat = await lstat(current); } catch (error) {
      if (error.code === 'ENOENT' && last && kind === 'fresh') return resolve(raw);
      throw failure('invalid_path');
    }
    if (stat.isSymbolicLink()) throw failure('symlink_path_not_allowed');
    if (last && kind === 'fresh') throw failure('output_directory_must_be_fresh');
    if (last && kind === 'file' ? !stat.isFile() : !stat.isDirectory()) throw failure('invalid_path');
  }
  return resolve(raw);
}

async function boundedFile(path, limit) {
  await checkedPath(path, 'file');
  const before = await lstat(path);
  if (before.size < 1 || before.size > limit) throw failure('prepared_file_limit');
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const first = await handle.stat();
    if (!first.isFile() || first.ino !== before.ino || first.dev !== before.dev || first.size !== before.size) throw failure('unstable_prepared_file');
    const chunks = [], buffer = Buffer.alloc(65536); let size = 0;
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, size);
      if (!bytesRead) break;
      size += bytesRead;
      if (size > limit || size > first.size) throw failure('prepared_file_limit');
      chunks.push(Buffer.from(buffer.subarray(0, bytesRead)));
    }
    const after = await handle.stat();
    if (size !== first.size || after.size !== first.size || after.mtimeMs !== first.mtimeMs || after.ctimeMs !== first.ctimeMs) throw failure('unstable_prepared_file');
    return Buffer.concat(chunks, size);
  } finally { await handle.close(); }
}

async function newOutput(out) {
  await checkedPath(out, 'fresh');
  try { await mkdir(out, { mode: 0o700 }); } catch { throw failure('output_directory_must_be_fresh'); }
}
async function save(out, name, bytes) { await writeFile(join(out, name), bytes, { flag: 'wx', mode: 0o600 }); }
function parseJson(bytes) { try { return JSON.parse(bytes); } catch { throw failure('prepared_integrity_failed'); } }
function pngShape(bytes) {
  return bytes.length >= 33 && bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' && bytes.readUInt32BE(8) === 13 && bytes.toString('ascii', 12, 16) === 'IHDR' && bytes.readUInt32BE(16) === 1280 && bytes.readUInt32BE(20) === 720;
}

async function canonicalRaster(original, rawPackagePath) {
  const packagePath = await checkedPath(rawPackagePath, 'file');
  let sharp; try { sharp = createRequire(packagePath)('sharp'); } catch { throw failure('sharp_runtime_unavailable'); }
  sharp.concurrency(1); sharp.cache({ memory: 8, files: 0, items: 4 });
  const png = await sharp(Buffer.from(original.visual.svg), { limitInputPixels: 1280 * 720 }).resize(1280, 720, { fit: 'contain', background: '#fff8ec' }).png().toBuffer();
  if (!pngShape(png) || png.length > 4 * 1024 * 1024 || validateQuestion(original).localMathChecks !== 'passed') throw failure('prepare_validation_failed');
  return png;
}

export async function runClefTeachingPilot(argv, { env = {}, fetchImpl = globalThis.fetch } = {}) {
  const { mode, values } = argumentsFor(argv), out = await checkedPath(values['--out'], 'fresh');
  const original = createGardenQuestion({ id: ID });
  if (mode === '--prepare') {
    const png = await canonicalRaster(original, values['--sharp-package']);
    const questionBytes = json(original);
    const prepared = {
      schemaVersion: 'clef-teaching-prepared/v1', state: 'draft_prepared', questionId: ID,
      sourceContentSha256: original.contentSha256, sourceVisualSha256: original.visual.sha256,
      question: { fileName: 'question.json', sha256: hash(questionBytes), byteLength: Buffer.byteLength(questionBytes) },
      png: { fileName: 'question.png', sha256: hash(png), byteLength: png.length, width: 1280, height: 720, contentType: 'image/png' },
      rightsStatus: 'owned_original', containsStudentData: false, containsPrivateData: false,
      expertReview: 'pending', publishReady: false, networkRequests: 0,
    };
    await newOutput(out);
    await save(out, 'question.json', questionBytes); await save(out, 'question.png', png); await save(out, 'prepared.json', json(prepared));
    return prepared;
  }
  const inputDir = await checkedPath(values['--prepared'], 'dir');
  const preparedBytes = await boundedFile(join(inputDir, 'prepared.json'), 16384);
  const questionBytes = await boundedFile(join(inputDir, 'question.json'), 2 * 1024 * 1024);
  const png = await boundedFile(join(inputDir, 'question.png'), 4 * 1024 * 1024);
  const prepared = parseJson(preparedBytes), question = parseJson(questionBytes);
  if (JSON.stringify(question) !== JSON.stringify(original) || prepared?.schemaVersion !== 'clef-teaching-prepared/v1' || prepared.questionId !== ID || prepared.sourceContentSha256 !== original.contentSha256 || prepared.sourceVisualSha256 !== original.visual.sha256 || prepared.question?.fileName !== 'question.json' || prepared.question?.sha256 !== hash(questionBytes) || prepared.question?.byteLength !== questionBytes.length || prepared.png?.fileName !== 'question.png' || prepared.png?.sha256 !== hash(png) || prepared.png?.byteLength !== png.length || prepared.png?.width !== 1280 || prepared.png?.height !== 720 || prepared.png?.contentType !== 'image/png' || prepared.rightsStatus !== 'owned_original' || prepared.expertReview !== 'pending' || prepared.publishReady !== false || !pngShape(png)) throw failure('prepared_integrity_failed');
  const canonicalPng = await canonicalRaster(original, values['--sharp-package']);
  if (!png.equals(canonicalPng) || hash(png) !== hash(canonicalPng)) throw failure('canonical_raster_mismatch');
  const reviewRecordId = values['--review-record-id'];
  const reviewedRasters = [{ contentType: 'image/png', base64: png.toString('base64'), sha256: hash(png), sourceContentSha256: original.contentSha256, sourceVisualSha256: original.visual.sha256, reviewRecordId }];
  let networkRequests = 0, requestSha256 = null;
  const adapter = createClefAdapter({ env, fetchImpl: async (...args) => {
    if (networkRequests >= 1) throw failure('request_limit');
    networkRequests++; requestSha256 = hash(args[1].body);
    return fetchImpl(args[0], { ...args[1], redirect: 'error' });
  } });
  if (!adapter.configured || typeof fetchImpl !== 'function') throw failure('model_not_configured');
  await newOutput(out);
  const result = await adapter.evaluate(question, { reviewedRasters });
  const report = {
    schemaVersion: 'clef-teaching-report/v1', status: result.status, model: 'clef-flash', state: 'draft',
    ...(result.answers ? { answers: result.answers } : {}), ...(result.usage ? { usage: result.usage } : {}), ...(Number.isInteger(result.httpStatus) ? { httpStatus: result.httpStatus } : {}),
    calibrationStatus: 'not_calibrated', publishReady: false, expertReview: 'pending', trustedHumanReview: 'pending',
    visualAuditStatus: result.visualAuditStatus ?? 'not_completed',
    reviewRecord: { id: reviewRecordId, scope: 'local_visual_inspection', expertApproval: false },
    input: { preparedSha256: hash(preparedBytes), questionSha256: hash(questionBytes), pngSha256: hash(png), sourceContentSha256: original.contentSha256, sourceVisualSha256: original.visual.sha256, pngByteLength: png.length },
    request: { model: 'clef-flash', networkRequests, maxNetworkRequests: 1, retries: 0, sha256: requestSha256 },
    usageSha256: result.usage ? hash(JSON.stringify(result.usage)) : null,
    pricing: { priceDate: '2026-10-03', inputContextTokens: 65536, publishedUsdPerMillionInputTokens: 0.09, planningUpperEstimateUsd: ESTIMATE, maxEstimatedUsd: Number(values['--max-estimated-usd']), isBillingCap: false },
  };
  await save(out, 'report.json', json(report));
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await runClefTeachingPilot(process.argv.slice(2), { env: process.env });
    console.log(JSON.stringify({ status: report.status ?? report.state, model: report.model ?? null, networkRequests: report.request?.networkRequests ?? 0, publishReady: false }));
    if (report.status && report.status !== 'advisory_only') process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ status: error.publicCode ?? 'clef_pilot_failed', publishReady: false })); process.exitCode = 1;
  }
}
