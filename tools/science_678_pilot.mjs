import { createHash } from 'node:crypto';

const MAX_OUTPUT_BYTES = 2097152;
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && !['--json', '--benchmark', '--preview', '--clef-preflight'].includes(args[0]))) {
  process.stderr.write('invalid_science_678_pilot_arguments\n');
  process.exitCode = 1;
} else {
  try {
    const factory = await import('../packages/content-factory/science_678_factory.mjs');
    if (typeof factory.buildScience678Pilot !== 'function') throw new Error('science_678_pilot_not_ready');
    const stringify = value => {
      const output = JSON.stringify(value);
      if (Buffer.byteLength(output) > MAX_OUTPUT_BYTES) throw new Error('science_678_pilot_output_budget');
      return output;
    };
    const summary = bank => ({
      schemaVersion: 'science-678-pilot-summary/v1', state: 'partial_editor_inventory',
      authoredDrafts: bank.items.length, reasoningFamilies: bank.counts.reasoningFamilies,
      targetDrafts: bank.counts.targetDrafts, remainingDrafts: bank.counts.remainingDrafts,
      publishedQuestions: bank.counts.publishedQuestions, localJevScreens: bank.activity.localJevScreens,
      providerCallsMade: Object.values(bank.activity.externalCalls).reduce((sum, value) => sum + value, 0),
      modelGeneratedQuestions: bank.generator.generatedQuestions, generatorState: bank.generator.state,
      contentSha256: bank.contentSha256, learnerReady: bank.learnerReady, publicationReady: bank.publicationReady,
    });
    if (args[0] === '--clef-preflight') {
      const preflight = await import('../packages/content-factory/science_678_clef_preflight.mjs');
      if (typeof preflight.prepareScience678ClefPilot !== 'function') throw new Error('science_678_pilot_not_ready');
      process.stdout.write(stringify(await preflight.prepareScience678ClefPilot()) + '\n');
    } else if (args[0] === '--preview') {
      const renderer = await import('../packages/content-factory/science_678_editor_view.mjs');
      const serverApi = await import('../packages/content-factory/science_678_preview_server.mjs');
      if (typeof renderer.renderScience678EditorView !== 'function' || typeof serverApi.createScience678PreviewServer !== 'function') throw new Error('science_678_pilot_not_ready');
      const rendered = await renderer.renderScience678EditorView();
      const server = await serverApi.createScience678PreviewServer(rendered.html, rendered.manifest);
      const stop = async () => {
        try {await server.close(); process.exitCode = 0;} catch {process.stderr.write('science_678_pilot_failed\n'); process.exitCode = 1;}
      };
      process.once('SIGINT', stop); process.once('SIGTERM', stop);
      process.stdout.write(stringify({schemaVersion: 'science-678-pilot-preview/v1', state: server.state, url: server.url, snapshotBuilds: 1, manifest: server.manifest}) + '\n');
    } else if (args[0] === '--benchmark') {
      const renderer = await import('../packages/content-factory/science_678_editor_view.mjs');
      if (typeof renderer.renderScience678EditorView !== 'function') throw new Error('science_678_pilot_not_ready');
      const bankStart = process.hrtime.bigint();
      const bank = await factory.buildScience678Pilot();
      const bankEnd = process.hrtime.bigint();
      const bankJson = stringify(bank);
      const editorStart = process.hrtime.bigint();
      const editor = await renderer.renderScience678EditorView();
      const editorEnd = process.hrtime.bigint();
      const base = summary(bank);
      if (editor.manifest.reviewContentSha256 !== bank.contentSha256 || bank.repeatedCallsCreateNewStock !== false) throw new Error('science_678_pilot_benchmark_stock_mismatch');
      // The fixed renderer calls the same no-argument bank factory once internally.
      // Equal complete revision hashes bind that second build to the measured stock.
      const editorRenderLocalJevScreens = bank.activity.localJevScreens;
      process.stdout.write(stringify({
        ...base, schemaVersion: 'science-678-local-benchmark/v1', mode: 'local_existing_stock_no_model',
        bankBuildMilliseconds: Number(bankEnd - bankStart) / 1e6,
        editorRenderMilliseconds: Number(editorEnd - editorStart) / 1e6,
        editorRenderIncludesInternalBankBuild: true,
        bankBuildsMeasured: 2, directBankLocalJevScreens: bank.activity.localJevScreens, editorRenderLocalJevScreens,
        localJevScreensAcrossMeasuredBuilds: bank.activity.localJevScreens + editorRenderLocalJevScreens,
        sameStockRevision: true, newStockCreatedByBenchmark: 0,
        providerCallsMade: base.providerCallsMade + editor.manifest.providerCallsMade,
        bankJsonBytes: Buffer.byteLength(bankJson), bankJsonSha256: createHash('sha256').update(bankJson).digest('hex'),
        editorHtmlBytes: editor.manifest.htmlBytes, editorHtmlSha256: editor.manifest.htmlSha256,
      }) + '\n');
    } else {
      const bank = await factory.buildScience678Pilot();
      process.stdout.write(stringify(args[0] === '--json' ? bank : summary(bank)) + '\n');
    }
  } catch (error) {
    const message = error.code === 'ERR_MODULE_NOT_FOUND' || error.message === 'science_678_pilot_not_ready'
      ? 'science_678_pilot_not_ready' : error.message === 'science_678_pilot_output_budget'
        ? 'science_678_pilot_output_budget' : 'science_678_pilot_failed';
    process.stderr.write(message + '\n');
    process.exitCode = 1;
  }
}
