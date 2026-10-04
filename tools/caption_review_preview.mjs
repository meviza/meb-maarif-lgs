#!/usr/bin/env node
// Owned local editor preview only; not an authenticated student endpoint.
import { pathToFileURL } from 'node:url';
import { isProxy } from 'node:util/types';

export function parseCaptionReviewPreviewArgs(argv) {
  const fail = () => { throw new Error('invalid_caption_review_preview_args'); };
  if (isProxy(argv) || !Array.isArray(argv) || Object.getPrototypeOf(argv) !== Array.prototype) fail();
  const fields = Object.getOwnPropertyDescriptors(argv), length = fields.length?.value;
  if (![0, 2, 4].includes(length) || Reflect.ownKeys(fields).length !== length + 1) fail();
  const args = [];
  for (let index = 0; index < length; index++) {
    const field = fields[String(index)];
    if (!field?.enumerable || !Object.hasOwn(field, 'value') || typeof field.value !== 'string') fail();
    args.push(field.value);
  }
  let port = 3339, presetId, portSeen = false;
  for (let index = 0; index < length; index += 2) {
    if (args[index] === '--port' && !portSeen) {
      if (!/^(?:0|[1-9]\d{3,4})$/u.test(args[index + 1])) fail();
      port = Number(args[index + 1]); portSeen = true;
      if (port !== 0 && (port < 1024 || port > 65535)) fail();
    } else if (args[index] === '--preset' && presetId === undefined
      && ['garden', 'concept', 'perimeter', 'area'].includes(args[index + 1])) presetId = args[index + 1];
    else fail();
  }
  return Object.freeze({ host: '127.0.0.1', port, ...(presetId === undefined ? {} : { presetId }) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseCaptionReviewPreviewArgs(process.argv.slice(2));
    const { createReasonedCaptionReviewServer, createReasonedCaptionReviewPresetServer } = await import('../packages/media/reasoned_caption_review_server.mjs');
    const server = options.presetId === undefined ? createReasonedCaptionReviewServer()
      : createReasonedCaptionReviewPresetServer(options.presetId);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(options.port, options.host, resolve);
    });
    console.log(JSON.stringify({ state: 'local_editor_caption_review',
      url: `http://127.0.0.1:${server.address().port}/`, sharedSingleEditorSession: true,
      syntheticOnly: true, authenticationImplemented: false, publicationReady: false,
      audioGenerated: false, videoRendered: false,
      ...(options.presetId === undefined ? {} : { presetId: options.presetId }) }));
    let closing = false;
    const close = () => { if (!closing) { closing = true; server.close(); server.closeIdleConnections(); } };
    process.once('SIGINT', close); process.once('SIGTERM', close);
  } catch (error) {
    console.error(error?.message === 'invalid_caption_review_preview_args'
      ? error.message : 'caption_review_preview_start_failed');
    process.exitCode = 1;
  }
}
