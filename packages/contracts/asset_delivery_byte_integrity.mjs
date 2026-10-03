/**
 * Pure byte-integrity check for a delivery resolver that already holds an
 * structurally valid asset evidence bundle and a post-processing byte
 * sequence.
 *
 * This module does not fetch, store, sanitize, parse, or serve a file. In
 * particular, it cannot prove that an SVG was sanitized: it only proves that
 * resolver-supplied bytes match the hash declared by that bundle.
 */

import { createHash } from 'node:crypto';
import { validateAssetEvidenceBundle } from './asset_evidence_bundle.mjs';

function blocked(errors) {
  return { verified: false, nextState: 'blocked', errors };
}

function isDeliveryByteSequence(value) {
  return value instanceof Uint8Array;
}

function usesSharedMemory(value) {
  return typeof SharedArrayBuffer !== 'undefined' &&
    value instanceof Uint8Array &&
    value.buffer instanceof SharedArrayBuffer;
}

/**
 * Verify byte identity without retaining the bytes or opening a delivery
 * endpoint. An authorized resolver must still resolve published governance
 * evidence, determine the real request time, sanitize where the delivery
 * profile requires it, and enforce authorization before calling this
 * function.
 */
export function verifyAssetDeliveryByteIntegrity(candidate) {
  const assetEvidenceBundle = candidate?.assetEvidenceBundle;
  const deliveryBytes = candidate?.deliveryBytes;
  const bundleValidation = validateAssetEvidenceBundle(assetEvidenceBundle);

  if (!bundleValidation.valid) {
    return blocked(bundleValidation.errors.map(error => ({
      path: `assetEvidenceBundle.${error.path}`,
      code: 'asset_evidence_bundle_invalid',
      message: error.message
    })));
  }

  if (usesSharedMemory(deliveryBytes)) {
    return blocked([
      {
        path: 'deliveryBytes',
        code: 'delivery_bytes_shared_memory_unsupported',
        message: 'resolver-owned delivery bytes cannot use SharedArrayBuffer memory'
      }
    ]);
  }

  if (!isDeliveryByteSequence(deliveryBytes)) {
    return blocked([
      {
        path: 'deliveryBytes',
        code: 'delivery_bytes_invalid',
        message: 'resolver-owned delivery bytes must be a Uint8Array'
      }
    ]);
  }

  const observedByteSha256 = createHash('sha256')
    .update(deliveryBytes)
    .digest('hex');
  if (observedByteSha256 !== assetEvidenceBundle.asset.byteSha256) {
    return blocked([
      {
        path: 'deliveryBytes',
        code: 'asset_delivery_byte_hash_mismatch',
        message: 'delivered asset bytes do not match the approved asset byte SHA-256'
      }
    ]);
  }

  return {
    verified: true,
    nextState: 'byte_integrity_verified',
    asset: {
      bundleId: assetEvidenceBundle.bundleId,
      assetId: assetEvidenceBundle.asset.assetId,
      revisionId: assetEvidenceBundle.asset.revisionId,
      mediaType: assetEvidenceBundle.asset.mediaType,
      deliveryProfile: assetEvidenceBundle.asset.deliveryProfile,
      byteSha256: observedByteSha256
    },
    errors: []
  };
}
