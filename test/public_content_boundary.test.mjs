import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const appSource = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const indexSource = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

test('client application does not embed an answer key or fetch a raw question-bank file', () => {
  assert.doesNotMatch(appSource, /correctOption:\s*['"][A-D]['"]/u);
  assert.doesNotMatch(appSource, /fetch\(filename\)/u);
  assert.doesNotMatch(appSource, /correctAnswer\s*\|\|\s*['"]A['"]/u);
});

test('client declares that current content is read-only and not scoreable', () => {
  assert.match(appSource, /contentAccess:\s*'read_only_draft'/u);
});

test('visible application chrome identifies the build as a non-official prototype', () => {
  assert.doesNotMatch(indexSource, /T\.C\. MİLLÎ EĞİTİM BAKANLIĞI/u);
  assert.doesNotMatch(indexSource, /JEV System-1:\s*<strong>ONAYLI<\/strong>/u);
  assert.match(indexSource, /Yayın öncesi doğrulama/u);
});

test('prototype client does not persist a learner profile or enable privileged modes', () => {
  assert.doesNotMatch(appSource, /meb_user/u);
  assert.match(appSource, /mode !== 'practice'/u);
  assert.match(appSource, /button\.disabled = true/u);
});

test('prototype client never renders bank-provided visual HTML directly', () => {
  assert.doesNotMatch(appSource, /innerHTML\s*=\s*q\.visualContent/u);
  assert.match(appSource, /Görsel içerik; kaynak, lisans ve erişilebilirlik incelemesi/u);
});
