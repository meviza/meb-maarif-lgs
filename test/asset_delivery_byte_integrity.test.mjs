import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const DELIVERY_INTEGRITY_MODULE_URL = new URL('../packages/contracts/asset_delivery_byte_integrity.mjs', import.meta.url);

async function loadDeliveryIntegrityContract() {
  // Break caught: a resolver could serve arbitrary bytes merely because a
  // metadata record claims that a visual was previously reviewed.
  assert.equal(
    fs.existsSync(DELIVERY_INTEGRITY_MODULE_URL),
    true,
    'asset delivery requires a byte-integrity verifier'
  );
  return import(DELIVERY_INTEGRITY_MODULE_URL.href);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function criticalSvgBundle(byteSha256) {
  const subject = {
    assetId: 'ASSET-G1-BALLOONS-001',
    revisionId: 'ASSETREV-G1-BALLOONS-001',
    mediaType: 'image/svg+xml',
    byteSha256
  };
  return {
    contractVersion: '1.0.0',
    bundleId: 'AEB-G1-COUNTING-001',
    asset: {
      ...subject,
      deliveryProfile: 'sanitized_static_svg_v1',
      role: 'instructional_critical',
      audience: {
        minGrade: 1,
        maxGrade: 1
      },
      origin: {
        method: 'original_human',
        subject,
        provenanceRecordId: 'PROV-G1-BALLOONS-001',
        provenanceRecordSha256: 'a'.repeat(64),
        sourceLineageIds: ['SRC-ORIGINAL-001']
      }
    },
    rights: {
      subject,
      rightsRecordId: 'RIGHTS-G1-BALLOONS-001',
      rightsRecordSha256: 'b'.repeat(64),
      basis: 'owned',
      permittedUses: ['student_delivery'],
      derivativeUseAllowed: true,
      validity: {
        startsAt: '2026-10-01T00:00:00.000Z',
        endsAt: null
      },
      attribution: {
        required: false,
        text: null
      }
    },
    accessibility: {
      subject,
      accessibilityRecordId: 'ACC-G1-BALLOONS-001',
      accessibilityRecordSha256: 'c'.repeat(64),
      language: 'tr',
      modality: 'visual',
      treatment: {
        shortAlt: 'Üç farklı renkte balon.',
        longDescription: 'Sayı sayma etkinliğinde kullanılan, soldan sağa dizilmiş üç balon çizimi.',
        gradeRange: {
          minGrade: 1,
          maxGrade: 1
        }
      }
    },
    dataGovernance: {
      owner: 'academic-content-owner',
      steward: 'content-asset-steward',
      classification: 'educational-asset-metadata',
      processingPurpose: 'student-learning-delivery',
      retentionClass: 'content-lifecycle',
      sourceLineage: ['SRC-ORIGINAL-001']
    }
  };
}

test('verifies resolver-supplied SVG bytes only when their SHA-256 matches the declared post-sanitization bundle hash', async () => {
  const { verifyAssetDeliveryByteIntegrity } = await loadDeliveryIntegrityContract();
  const deliveryBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="4" /></svg>', 'utf8');
  const expectedByteSha256 = sha256(deliveryBytes);

  const result = verifyAssetDeliveryByteIntegrity({
    assetEvidenceBundle: criticalSvgBundle(expectedByteSha256),
    deliveryBytes
  });

  assert.deepEqual(result, {
    verified: true,
    nextState: 'byte_integrity_verified',
    asset: {
      bundleId: 'AEB-G1-COUNTING-001',
      assetId: 'ASSET-G1-BALLOONS-001',
      revisionId: 'ASSETREV-G1-BALLOONS-001',
      mediaType: 'image/svg+xml',
      deliveryProfile: 'sanitized_static_svg_v1',
      byteSha256: expectedByteSha256
    },
    errors: []
  });
});

test('blocks delivery bytes that differ from the approved immutable asset hash', async () => {
  const { verifyAssetDeliveryByteIntegrity } = await loadDeliveryIntegrityContract();
  const approvedBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="4" /></svg>', 'utf8');
  const modifiedBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="9" /></svg>', 'utf8');

  const result = verifyAssetDeliveryByteIntegrity({
    assetEvidenceBundle: criticalSvgBundle(sha256(approvedBytes)),
    deliveryBytes: modifiedBytes
  });

  assert.deepEqual(result, {
    verified: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'deliveryBytes',
        code: 'asset_delivery_byte_hash_mismatch',
        message: 'delivered asset bytes do not match the approved asset byte SHA-256'
      }
    ]
  });
});

test('hashes only the visible Uint8Array subarray bytes supplied by the resolver', async () => {
  const { verifyAssetDeliveryByteIntegrity } = await loadDeliveryIntegrityContract();
  const payload = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="4" /></svg>', 'utf8');
  const backing = new Uint8Array(payload.length + 4);
  backing.set([1, 2], 0);
  backing.set(payload, 2);
  backing.set([3, 4], payload.length + 2);
  const deliveryBytes = backing.subarray(2, payload.length + 2);

  const result = verifyAssetDeliveryByteIntegrity({
    assetEvidenceBundle: criticalSvgBundle(sha256(deliveryBytes)),
    deliveryBytes
  });

  assert.equal(result.verified, true);
  assert.equal(result.asset.byteSha256, sha256(payload));
});

test('does not sanitize or classify SVG safety; it only verifies the exact supplied bytes and never returns them', async () => {
  const { verifyAssetDeliveryByteIntegrity } = await loadDeliveryIntegrityContract();
  const deliveryBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>ignored()</script></svg>', 'utf8');

  const result = verifyAssetDeliveryByteIntegrity({
    assetEvidenceBundle: criticalSvgBundle(sha256(deliveryBytes)),
    deliveryBytes
  });

  assert.equal(result.verified, true);
  assert.equal(Object.hasOwn(result, 'deliveryBytes'), false);
});

test('rejects shared-memory byte views to prevent post-verification mutation races', async t => {
  if (typeof SharedArrayBuffer === 'undefined') {
    t.skip('SharedArrayBuffer is unavailable in this runtime');
    return;
  }

  const { verifyAssetDeliveryByteIntegrity } = await loadDeliveryIntegrityContract();
  const sharedBytes = new Uint8Array(new SharedArrayBuffer(64));

  const result = verifyAssetDeliveryByteIntegrity({
    assetEvidenceBundle: criticalSvgBundle('d'.repeat(64)),
    deliveryBytes: sharedBytes
  });

  assert.deepEqual(result, {
    verified: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'deliveryBytes',
        code: 'delivery_bytes_shared_memory_unsupported',
        message: 'resolver-owned delivery bytes cannot use SharedArrayBuffer memory'
      }
    ]
  });
});

test('rejects a string in place of resolver-owned binary bytes', async () => {
  const { verifyAssetDeliveryByteIntegrity } = await loadDeliveryIntegrityContract();
  const result = verifyAssetDeliveryByteIntegrity({
    assetEvidenceBundle: criticalSvgBundle('d'.repeat(64)),
    deliveryBytes: '<svg xmlns="http://www.w3.org/2000/svg" />'
  });

  assert.deepEqual(result, {
    verified: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'deliveryBytes',
        code: 'delivery_bytes_invalid',
        message: 'resolver-owned delivery bytes must be a Uint8Array'
      }
    ]
  });
});

test('blocks byte verification when the supplied asset evidence bundle is itself invalid', async () => {
  const { verifyAssetDeliveryByteIntegrity } = await loadDeliveryIntegrityContract();
  const deliveryBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" />', 'utf8');
  const bundle = criticalSvgBundle(sha256(deliveryBytes));
  bundle.asset.byteSha256 = 'not-a-sha256';

  const result = verifyAssetDeliveryByteIntegrity({
    assetEvidenceBundle: bundle,
    deliveryBytes
  });

  assert.deepEqual(result, {
    verified: false,
    nextState: 'blocked',
    errors: [
      {
        path: 'assetEvidenceBundle.asset.byteSha256',
        code: 'asset_evidence_bundle_invalid',
        message: 'an asset byte SHA-256 is required'
      },
      {
        path: 'assetEvidenceBundle.asset.origin.subject.byteSha256',
        code: 'asset_evidence_bundle_invalid',
        message: 'asset evidence must target the delivered asset byte revision'
      },
      {
        path: 'assetEvidenceBundle.rights.subject.byteSha256',
        code: 'asset_evidence_bundle_invalid',
        message: 'asset evidence must target the delivered asset byte revision'
      },
      {
        path: 'assetEvidenceBundle.accessibility.subject.byteSha256',
        code: 'asset_evidence_bundle_invalid',
        message: 'asset evidence must target the delivered asset byte revision'
      }
    ]
  });
});
