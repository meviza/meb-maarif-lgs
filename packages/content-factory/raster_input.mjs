import { createHash } from 'node:crypto';

const MAX_EACH = 4 * 1024 * 1024;
const MAX_TOTAL = 8 * 1024 * 1024;
const MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);

// Bounded header/container validation only; not a raster decoder or a semantic review.
function dimensions(bytes, contentType) {
  if (contentType === 'image/png') {
    if (bytes.length < 33 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.toString('ascii', 12, 16) !== 'IHDR' || bytes.readUInt32BE(8) !== 13) return null;
    return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  }
  if (contentType === 'image/jpeg') {
    if (bytes.length < 12 || bytes[0] !== 255 || bytes[1] !== 216) return null;
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) return null;
      while (offset < bytes.length && bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 217 || marker === 218) return null;
      if (marker === 1 || marker >= 208 && marker <= 215) continue;
      if (offset + 2 > bytes.length) return null;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) return null;
      if ([192, 193, 194].includes(marker)) {
        if (length < 8) return null;
        return [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)];
      }
      offset += length;
    }
    return null;
  }
  if (contentType === 'image/webp') {
    if (bytes.length < 25 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP' || bytes.readUInt32LE(4) !== bytes.length - 8) return null;
    const kind = bytes.toString('ascii', 12, 16);
    const size = bytes.readUInt32LE(16);
    if (size + 20 > bytes.length) return null;
    if (kind === 'VP8X' && size >= 10 && bytes.length >= 30 && !(bytes[20] & 2)) return [bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1];
    if (kind === 'VP8L' && size >= 5 && bytes[20] === 47) {
      const bits = bytes.readUInt32LE(21);
      return [(bits & 16383) + 1, (bits >>> 14 & 16383) + 1];
    }
    if (kind === 'VP8 ' && size >= 10 && bytes.toString('hex', 23, 26) === '9d012a') return [bytes.readUInt16LE(26) & 16383, bytes.readUInt16LE(28) & 16383];
  }
  return null;
}

export function prepareReviewedRasterInputs(question, reviewedRasters) {
  if (!Array.isArray(reviewedRasters) || reviewedRasters.length < 1 || reviewedRasters.length > 4) return { valid: false };
  let total = 0;
  const images = [], bindings = [];
  for (const raster of reviewedRasters) {
    if (!raster || !MIME.has(raster.contentType) || typeof raster.base64 !== 'string' || raster.base64.length > Math.ceil(MAX_EACH / 3) * 4 || raster.base64.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(raster.base64)) return { valid: false };
    if (raster.sourceContentSha256 !== question.contentSha256 || raster.sourceVisualSha256 !== question.visual?.sha256 || typeof raster.reviewRecordId !== 'string' || !/^[A-Za-z0-9:_-]{1,120}$/.test(raster.reviewRecordId)) return { valid: false };
    const bytes = Buffer.from(raster.base64, 'base64');
    if (!bytes.length || bytes.length > MAX_EACH || bytes.toString('base64') !== raster.base64) return { valid: false };
    total += bytes.length;
    if (total > MAX_TOTAL) return { valid: false };
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    if (raster.sha256 !== sha256) return { valid: false };
    const shape = dimensions(bytes, raster.contentType);
    if (!shape || !shape.every(value => Number.isInteger(value) && value > 0) || shape[0] * shape[1] > 16_000_000) return { valid: false };
    images.push({ content_type: raster.contentType, base64: raster.base64 });
    bindings.push({ sha256, sourceContentSha256: raster.sourceContentSha256, sourceVisualSha256: raster.sourceVisualSha256, reviewRecordId: raster.reviewRecordId, width: shape[0], height: shape[1], decodedBytes: bytes.length });
  }
  return { valid: true, images, bindings, totalDecodedBytes: total };
}
