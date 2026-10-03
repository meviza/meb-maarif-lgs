#!/usr/bin/env node
// Owned local editor preview only; not an authenticated student endpoint.
import { pathToFileURL } from 'node:url';
import { isProxy } from 'node:util/types';

export function parseCaptionReviewPreviewArgs(argv) {
  const fail = () => { throw new Error('invalid_caption_review_preview_args'); };
  if (!Array.isArray(argv) || isProxy(argv) || Object.getPrototypeOf(argv) !== Array.prototype) fail();
  const fields = Object.getOwnPropertyDescriptors(argv), length = fields.length?.value;
  if (![0, 2].includes(length) || Reflect.ownKeys(fields).length !== length + 1) fail();
  const args = [];
  for (let index = 0; index < length; index++) {
    const field = fields[String(index)];
    if (!field?.enumerable || !Object.hasOwn(field, 'value') || typeof field.value !== 'string') fail();
    args.push(field.value);
  }
  if (!length) return Object.freeze({ host: '127.0.0.1', port: 3339 });
  if (args[0] !== '--port' || !/^(?:0|[1-9]\d{3,4})$/u.test(args[1])) fail();
  const port = Number(args[1]);
  if (port !== 0 && (port < 1024 || port > 65535)) fail();
  return Object.freeze({ host: '127.0.0.1', port });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseCaptionReviewPreviewArgs(process.argv.slice(2));
    const { createReasonedCaptionReviewServer } = await import('../packages/media/reasoned_caption_review_server.mjs');
    const server = createReasonedCaptionReviewServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(options.port, options.host, resolve);
    });
    console.log(JSON.stringify({ state: 'local_editor_caption_review',
      url: `http://127.0.0.1:${server.address().port}/`, sharedSingleEditorSession: true,
      syntheticOnly: true, authenticationImplemented: false, publicationReady: false,
      audioGenerated: false, videoRendered: false }));
    let closing = false;
    const close = () => { if (!closing) { closing = true; server.close(); server.closeIdleConnections(); } };
    process.once('SIGINT', close); process.once('SIGTERM', close);
  } catch (error) {
    console.error(error?.message === 'invalid_caption_review_preview_args'
      ? error.message : 'caption_review_preview_start_failed');
    process.exitCode = 1;
  }
}
