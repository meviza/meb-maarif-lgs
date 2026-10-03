import { createLocalStudioServer } from '../packages/studio/local_studio_server.mjs';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.K12_STUDIO_PORT || 3334);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('K12_STUDIO_PORT must be an integer 1024–65535');
const server = createLocalStudioServer({
  pilotReportPath: process.env.K12_PILOT_REPORT,
  sourceRegistryPath: fileURLToPath(new URL('../sources/meb-reference-registry.json', import.meta.url)),
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Local review preview: http://127.0.0.1:${port} (no publication, auth or student data)`);
});
