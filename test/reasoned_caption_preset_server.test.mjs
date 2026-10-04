import test from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest, Server } from 'node:http';
import * as api from '../packages/media/reasoned_caption_review_server.mjs';

// Literal fingerprints captured from existing trusted builders before this
// export existed. These purpose/units are independently hand-checked.
const fixtures = [
  { preset: 'garden', id: 'caption-review-loopback-garden', kind: 'question_solution', cues: 30, protected: 14,
    sourceSha: 'bf71426f2e00703d931eb11e1a3d0759ca90ba839828e0b835a883187006c779',
    traceSha: 'cfb31d1b80ba4a61479b8443ada26476c4cf58ab4132298c4522b9c75bdff0e1',
    jobSha: 'b25eda1d7846389350a9ad1de46e256dfea71b0d90eb711f362c939fd8f6ef1b',
    initialSha: '8585943013b813d47ddc54511f27db65a661ed5dc914dab0cf039302f80a7c20',
    goal: 'Kapı her sırada açık kalacak biçimde iki tel sırası için gereken toplam tel uzunluğu isteniyor; alan ya da tek tur değil. Yanıtın birimi metre olacak.',
    result: '18 bölü 2 eşittir 9 metre. Kısa kenarın bir eş parçasının uzunluğu' },
  { preset: 'concept', id: 'lesson-perimeter-area-v1', kind: 'concept_lesson', cues: 26, protected: 12,
    sourceSha: 'ce0cfca9ecdbb6c3f0b810d89033923d43d48a9191a1cc84ddccc756ae37ae3f',
    traceSha: '9801d7feb33a30c02b0673e45655c8aff623fe9ddfa5ce699fb27063c485e7c9',
    jobSha: 'd825c00812225d2664ebb8b15074c8a3f97749c60431d37aab6a4bfdfcaf7bb1',
    initialSha: '804a23cfca68a7418aae0ada931a27068d9e60ec5ec84ad727f59c8580f58f81',
    goal: 'Dış sınırın uzunluğu ile kaplanan yüzeyi ayırt et; bir görevin çevre mi alan mı istediğini gerekçesiyle açıkla.',
    result: '6 artı 4 artı 6 artı 4 eşittir 20 santimetre. İlk modelin dış sınırının toplam uzunluğu' },
  { preset: 'perimeter', id: 'caption-review-loopback-perimeter', kind: 'question_solution', cues: 14, protected: 6,
    sourceSha: '75df42f0c6f66e3cd44dbb37d6d64a18d070cdbb2e8050b70bcd754729111e68',
    traceSha: 'aa01248d8c8d1bc9141ce5cbf1dbfef340a9367d4f86286178cd16e41eeb9e67',
    jobSha: 'c91d7266ee290f501ecea6d74f2bd025e1551bc7e894a2489a3a90edb707c164',
    initialSha: 'e964c45567e99eb8d91431ede612290c8f3c1e55af51f630b26587bb697ea2f8',
    goal: 'Dikdörtgenin dış sınırındaki dört kenarın toplam uzunluğu isteniyor; iç bölgenin alanı değil. Yanıtın birimi santimetre olacak.',
    result: '6 artı 4 eşittir 10 santimetre. Bir kenar çiftinin uzunluğu' },
  { preset: 'area', id: 'caption-review-loopback-area', kind: 'question_solution', cues: 10, protected: 4,
    sourceSha: 'babdf6320b9dd6173ddeccbace82c78d1511edb8702c520366a7881ce6d7e858',
    traceSha: '65afbdb8172c3766a6e187df60b6695371c4527d5caeccae94c8b678f4e62163',
    jobSha: 'd6f3280338311d5953e13ec24c90ebf04e53e9146a52290c911092948d4ee21a',
    initialSha: 'a35154939d38621eee0c7fe07565f4aa701bbe6de44e25f7ac2d0e59fe948023',
    goal: 'Dikdörtgenin kapladığı yüzeyin birim kare sayısı, yani alanı isteniyor; kenarda yürünülen yol değil. Yanıtın birimi santimetrekare olacak.',
    result: '6 çarpı 4 eşittir 24 santimetrekare. İç bölgenin toplam yüzey alanı' },
];
function factory() {
  assert.equal(typeof api.createReasonedCaptionReviewPresetServer, 'function', 'closed caption preset server API missing');
  return api.createReasonedCaptionReviewPresetServer;
}
async function start(t, preset, legacy = false) {
  const server = legacy ? api.createReasonedCaptionReviewServer() : factory()(preset);
  assert.ok(server instanceof Server); assert.equal(server.listening, false);
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  t.after(async () => { server.closeAllConnections(); await new Promise(done => server.close(done)); });
  const port = server.address().port;
  return { server, port, origin: `http://127.0.0.1:${port}` };
}
function request(context, { method = 'GET', path = '/api/current', headers = {}, body } = {}) {
  return new Promise((done, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', port: context.port, method, path, headers }, response => {
      const chunks = []; let size = 0;
      response.on('data', chunk => { size += chunk.length; if (size > 131072) req.destroy(new Error('test_response_budget')); else chunks.push(chunk); });
      response.on('end', () => { const text = Buffer.concat(chunks).toString('utf8'); done({ status: response.statusCode, text,
        record: response.headers['content-type']?.startsWith('application/json') ? JSON.parse(text) : null }); });
    });
    req.setTimeout(4000, () => req.destroy(new Error('test_request_deadline'))); req.on('error', reject); req.end(body);
  });
}
const read = async context => (await request(context)).record;
const action = (context, type) => request(context, { method: 'POST', path: '/api/action',
  headers: { Origin: context.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
async function finishPages(context) {
  for (let bound = 0; bound < 32 && (await read(context)).navigation.canNextPage; bound++)
    assert.equal((await action(context, 'next_page')).status, 200);
}

for (const fixture of fixtures) {
  test(`${fixture.preset} preset binds its real trusted source and purpose rather than a relabeled garden`, async t => {
    const context = await start(t, fixture.preset), record = await read(context);
    assert.equal(record.source.id, fixture.id); assert.equal(record.source.contentSha256, fixture.sourceSha);
    assert.equal(record.trace.kind, fixture.kind); assert.equal(record.trace.contentSha256, fixture.traceSha);
    assert.equal(record.job.contentSha256, fixture.jobSha); assert.equal(record.contentSha256, fixture.initialSha);
    assert.equal(record.cursor.cueCount, fixture.cues); assert.equal(record.cursor.cueIndex, 0);
    assert.equal(record.narrationPacket.fullTranscript, fixture.goal);
    assert.doesNotMatch(JSON.stringify(record), new RegExp(fixture.result.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
    assert.equal(Object.hasOwn(record, 'cues'), false); assert.equal(Object.hasOwn(record, 'assets'), false);
    for (const flag of ['teacherApproved', 'publicationReady', 'learnerReady', 'productionReady', 'audioGenerated', 'videoRendered'])
      assert.equal(record[flag], false);
    assert.equal(record.serializedAuthority, 'none'); assert.equal(record.curriculumReview, 'pending');
    assert.equal(record.frame.source.contentSha256, fixture.sourceSha);
    assert.equal(record.narrationPacket.trace.contentSha256, fixture.traceSha);
  });

  test(`${fixture.preset} actual HTTP walk keeps every protected response current-gated and resets backward reveal`, async t => {
    const context = await start(t, fixture.preset); let protectedCount = 0, visited = 0;
    for (let cue = 0; cue < fixture.cues; cue++) {
      let record = await read(context); visited++;
      assert.equal(record.cursor.cueIndex, cue); assert.equal(record.cursor.pageIndex, 0);
      assert.equal(record.source.contentSha256, fixture.sourceSha); assert.equal(record.trace.contentSha256, fixture.traceSha);
      assert.equal(record.cursor.revealRequested, false);
      if (record.navigation.canRevealCurrent) {
        protectedCount++;
        assert.equal(record.narrationPacket.fullTranscript, null); assert.equal(record.cursor.resultVisible, false);
        assert.equal((await action(context, 'next_cue')).status, 409);
        assert.deepEqual(await read(context), record);
        const opened = (await action(context, 'reveal_current')).record;
        assert.equal(opened.cursor.resultVisible, true); assert.equal(opened.cursor.progress, 1);
        assert.equal(typeof opened.narrationPacket.fullTranscript, 'string');
        if (cue === 4) assert.equal(opened.narrationPacket.fullTranscript, fixture.result);
        const before = await read(context);
        assert.equal((await action(context, 'reveal_current')).status, 409); assert.deepEqual(await read(context), before);
      } else {
        const before = await read(context);
        assert.equal((await action(context, 'reveal_current')).status, 409); assert.deepEqual(await read(context), before);
      }
      await finishPages(context); record = await read(context);
      if (cue < fixture.cues - 1) assert.equal((await action(context, 'next_cue')).record.cursor.cueIndex, cue + 1);
      else {
        assert.equal((await action(context, 'next_cue')).status, 409); assert.deepEqual(await read(context), record);
      }
    }
    assert.equal(visited, fixture.cues); assert.equal(protectedCount, fixture.protected);
    assert.equal((await action(context, 'previous_cue')).record.cursor.revealRequested, false);
    await finishPages(context);
    const backToProtected = (await action(context, 'next_cue')).record;
    assert.equal(backToProtected.cursor.kind, 'transfer_answer'); assert.equal(backToProtected.narrationPacket.fullTranscript, null);
    assert.equal(backToProtected.frame.sourceDiagramProof, false);
  });
}

test('the no-argument legacy garden retains the exact same initial and navigated record bytes', async t => {
  const legacy = await start(t, undefined, true), preset = await start(t, 'garden');
  assert.equal((await request(legacy)).text, (await request(preset)).text);
  for (const type of ['next_page', 'next_cue', 'next_page', 'previous_page', 'previous_cue']) {
    const a = await action(legacy, type), b = await action(preset, type);
    assert.equal(a.status, b.status); assert.equal(a.text, b.text);
  }
  assert.throws(() => api.createReasonedCaptionReviewServer('concept'), /invalid_reasoned_caption_review_server_arguments/u);
});

test('preset construction accepts exactly one primitive enum and executes zero caller hooks', () => {
  const create = factory(); let hooks = 0;
  const getter = Object.defineProperty({}, 'presetId', { get() { hooks++; return 'concept'; } });
  const coercion = { [Symbol.toPrimitive]() { hooks++; return 'concept'; }, toString() { hooks++; return 'concept'; } };
  const proxy = new Proxy({}, { get() { hooks++; }, ownKeys() { hooks++; }, getPrototypeOf() { hooks++; } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const value of [undefined, null, false, 0, 1n, Symbol('garden'), '', 'Garden', 'garden ', ' concept', 'same-area',
    'same-perimeter', '__proto__', 'constructor', 'area?width=8', JSON.stringify({ presetId: 'garden' }),
    {}, { source: {}, trace: {}, job: {} }, ['garden'], new String('garden'), getter, coercion, proxy, revoked.proxy])
    assert.throws(() => create(value), /invalid_reasoned_caption_review_preset/u);
  assert.throws(() => create(), /invalid_reasoned_caption_review_preset/u);
  assert.throws(() => create('garden', proxy), /invalid_reasoned_caption_review_preset/u);
  assert.equal(hooks, 0);
});

test('each preset has the same closed HTTP boundary and no client selection or source override route', async t => {
  for (const { preset } of fixtures) {
    const context = await start(t, preset), before = await read(context);
    const probes = [
      [{ path: '/api/preset' }, 404], [{ method: 'POST', path: '/api/preset', headers: { Origin: context.origin } }, 404],
      [{ path: '/api/current?preset=garden' }, 400], [{ headers: { Host: `localhost:${context.port}` } }, 403],
      [{ method: 'POST', path: '/api/action', headers: { 'Content-Type': 'application/json' }, body: '{"type":"next_page"}' }, 403],
      [{ method: 'POST', path: '/api/action', headers: { Origin: context.origin, 'Content-Type': 'application/json' }, body: '{"type":"next_page","preset":"garden"}' }, 400],
      [{ method: 'POST', path: '/api/action', headers: { Origin: context.origin, 'Content-Type': 'application/json', 'X-Grade': '5' }, body: '{"type":"next_page"}' }, 400],
    ];
    for (const [options, status] of probes) { assert.equal((await request(context, options)).status, status); assert.deepEqual(await read(context), before); }
    await finishPages(context); assert.equal((await action(context, 'next_cue')).record.cursor.kind, 'evidence');
  }
});

test('preset instances retain separate private cursors and independent source bindings', async t => {
  const contexts = await Promise.all(fixtures.map(f => start(t, f.preset)));
  const before = await Promise.all(contexts.map(read));
  assert.equal((await action(contexts[0], 'next_page')).status, 200);
  for (let index = 1; index < contexts.length; index++) assert.deepEqual(await read(contexts[index]), before[index]);
  assert.equal(new Set(before.map(record => record.source.contentSha256)).size, 4);
});
