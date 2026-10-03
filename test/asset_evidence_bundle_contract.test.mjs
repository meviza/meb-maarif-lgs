import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const ASSET_EVIDENCE_MODULE_URL = new URL('../packages/contracts/asset_evidence_bundle.mjs', import.meta.url);

function assetSubject(overrides = {}) {
  return {
    assetId: 'ASSET-G1-BALLOONS-001',
    revisionId: 'ASSETREV-G1-BALLOONS-001',
    mediaType: 'image/svg+xml',
    byteSha256: 'a'.repeat(64),
    ...overrides
  };
}

async function loadAssetEvidenceContract() {
  // Break caught: a visual or audio file can be delivered from a generic
  // "verified" flag without immutable provenance, rights, and accessibility
  // evidence for the exact byte revision.
  assert.equal(
    fs.existsSync(ASSET_EVIDENCE_MODULE_URL),
    true,
    'media delivery requires an asset-evidence bundle contract'
  );
  return import(ASSET_EVIDENCE_MODULE_URL.href);
}

function criticalSvgBundle(overrides = {}) {
  return {
    contractVersion: '1.0.0',
    bundleId: 'AEB-G1-COUNTING-001',
    asset: {
      assetId: 'ASSET-G1-BALLOONS-001',
      revisionId: 'ASSETREV-G1-BALLOONS-001',
      mediaType: 'image/svg+xml',
      byteSha256: 'a'.repeat(64),
      deliveryProfile: 'sanitized_static_svg_v1',
      role: 'instructional_critical',
      audience: {
        minGrade: 1,
        maxGrade: 1
      },
      origin: {
        method: 'original_human',
        provenanceRecordId: 'PROV-G1-BALLOONS-001',
        provenanceRecordSha256: 'b'.repeat(64),
        sourceLineageIds: ['SRC-ORIGINAL-001'],
        subject: assetSubject()
      }
    },
    rights: {
      rightsRecordId: 'RIGHTS-G1-BALLOONS-001',
      rightsRecordSha256: 'c'.repeat(64),
      subject: assetSubject(),
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
      accessibilityRecordId: 'ACC-G1-BALLOONS-001',
      accessibilityRecordSha256: 'd'.repeat(64),
      subject: assetSubject(),
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
    },
    ...overrides
  };
}

function instructionalAudioBundle(overrides = {}) {
  return {
    ...criticalSvgBundle(),
    bundleId: 'AEB-G1-COUNTING-AUDIO-001',
    asset: {
      assetId: 'ASSET-G1-COUNTING-AUDIO-001',
      revisionId: 'ASSETREV-G1-COUNTING-AUDIO-001',
      mediaType: 'audio/mpeg',
      byteSha256: 'e'.repeat(64),
      deliveryProfile: 'encoded_audio_v1',
      role: 'instructional_critical',
      audience: {
        minGrade: 1,
        maxGrade: 1
      },
      origin: {
        method: 'commissioned',
        provenanceRecordId: 'PROV-G1-COUNTING-AUDIO-001',
        provenanceRecordSha256: 'f'.repeat(64),
        sourceLineageIds: ['SRC-COMMISSION-001'],
        subject: assetSubject({
          assetId: 'ASSET-G1-COUNTING-AUDIO-001',
          revisionId: 'ASSETREV-G1-COUNTING-AUDIO-001',
          mediaType: 'audio/mpeg',
          byteSha256: 'e'.repeat(64)
        })
      }
    },
    rights: {
      ...criticalSvgBundle().rights,
      rightsRecordId: 'RIGHTS-G1-COUNTING-AUDIO-001',
      rightsRecordSha256: '1'.repeat(64),
      subject: assetSubject({
        assetId: 'ASSET-G1-COUNTING-AUDIO-001',
        revisionId: 'ASSETREV-G1-COUNTING-AUDIO-001',
        mediaType: 'audio/mpeg',
        byteSha256: 'e'.repeat(64)
      })
    },
    accessibility: {
      accessibilityRecordId: 'ACC-G1-COUNTING-AUDIO-001',
      accessibilityRecordSha256: '2'.repeat(64),
      subject: assetSubject({
        assetId: 'ASSET-G1-COUNTING-AUDIO-001',
        revisionId: 'ASSETREV-G1-COUNTING-AUDIO-001',
        mediaType: 'audio/mpeg',
        byteSha256: 'e'.repeat(64)
      }),
      language: 'tr',
      modality: 'audio',
      treatment: {
        transcript: 'Bir, iki, üç balon sayalım.',
        gradeRange: {
          minGrade: 1,
          maxGrade: 1
        }
      }
    },
    dataGovernance: {
      ...criticalSvgBundle().dataGovernance,
      sourceLineage: ['SRC-COMMISSION-001']
    },
    ...overrides
  };
}

test('accepts a critical SVG with byte-level provenance, student-delivery rights, and accessible alternatives', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();

  const result = validateAssetEvidenceBundle(criticalSvgBundle());

  assert.deepEqual(result, { valid: true, errors: [] });
});

test('rejects a critical visual when its long description is absent', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();
  const bundle = criticalSvgBundle({
    accessibility: {
      ...criticalSvgBundle().accessibility,
      treatment: {
        shortAlt: 'Üç balon.',
        gradeRange: {
          minGrade: 1,
          maxGrade: 1
        }
      }
    }
  });

  const result = validateAssetEvidenceBundle(bundle);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'accessibility.treatment.longDescription',
        code: 'critical_visual_long_description_missing',
        message: 'a critical visual requires a long description'
      }
    ]
  });
});

test('rejects instructional audio without a transcript', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();
  const bundle = instructionalAudioBundle({
    accessibility: {
      ...instructionalAudioBundle().accessibility,
      treatment: {
        gradeRange: {
          minGrade: 1,
          maxGrade: 1
        }
      }
    }
  });

  const result = validateAssetEvidenceBundle(bundle);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'accessibility.treatment.transcript',
        code: 'audio_transcript_missing',
        message: 'an instructional audio asset requires a transcript'
      }
    ]
  });
});

test('rejects a bundle whose rights do not permit student delivery', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();
  const bundle = criticalSvgBundle({
    rights: {
      ...criticalSvgBundle().rights,
      permittedUses: ['internal_review']
    }
  });

  const result = validateAssetEvidenceBundle(bundle);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'rights.permittedUses',
        code: 'student_delivery_not_permitted',
        message: 'asset rights must explicitly permit student_delivery'
      }
    ]
  });
});

test('rejects raw-media locations and credentials from a metadata-only asset evidence bundle', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();
  const bundle = criticalSvgBundle({
    mediaUrl: 'https://media.example.test/balloons.svg',
    accessToken: 'not-allowed'
  });

  const result = validateAssetEvidenceBundle(bundle);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'mediaUrl',
        code: 'forbidden_asset_evidence_field',
        message: 'mediaUrl cannot be included in an asset evidence bundle'
      },
      {
        path: 'accessToken',
        code: 'forbidden_asset_evidence_field',
        message: 'accessToken cannot be included in an asset evidence bundle'
      }
    ]
  });
});

test('rejects unsupported renderer options so hash-unbound fields cannot alter later delivery behavior', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();
  const bundle = criticalSvgBundle({
    asset: {
      ...criticalSvgBundle().asset,
      rendererOptions: {
        allowScripts: true
      }
    }
  });

  const result = validateAssetEvidenceBundle(bundle);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'asset.rendererOptions',
        code: 'asset_evidence_field_unsupported',
        message: 'asset.rendererOptions is not supported by the asset evidence contract'
      }
    ]
  });
});

test('derives an order-independent asset-set hash and rejects a duplicate immutable asset revision', async () => {
  const { evaluateAssetEvidenceBundleSet } = await loadAssetEvidenceContract();
  const visual = criticalSvgBundle();
  const audio = instructionalAudioBundle();

  const firstOrder = evaluateAssetEvidenceBundleSet([visual, audio], '2026-10-03T00:00:00.000Z');
  const reverseOrder = evaluateAssetEvidenceBundleSet([audio, visual], '2026-10-03T00:00:00.000Z');
  const duplicate = evaluateAssetEvidenceBundleSet([visual, criticalSvgBundle()], '2026-10-03T00:00:00.000Z');

  assert.equal(firstOrder.valid, true);
  assert.equal(reverseOrder.valid, true);
  assert.equal(firstOrder.assetSetSha256, reverseOrder.assetSetSha256);
  assert.deepEqual(duplicate, {
    valid: false,
    errors: [
      {
        path: 'bundles[1].asset',
        code: 'asset_revision_duplicate',
        message: 'each asset identifier and revision identifier pair must be unique in an asset set'
      }
    ]
  });
});

test('rejects reuse of one rights or accessibility record across different immutable asset subjects', async () => {
  const { evaluateAssetEvidenceBundleSet } = await loadAssetEvidenceContract();
  const visual = criticalSvgBundle();
  const audio = instructionalAudioBundle({
    rights: {
      ...instructionalAudioBundle().rights,
      rightsRecordId: visual.rights.rightsRecordId,
      rightsRecordSha256: visual.rights.rightsRecordSha256
    },
    accessibility: {
      ...instructionalAudioBundle().accessibility,
      accessibilityRecordId: visual.accessibility.accessibilityRecordId,
      accessibilityRecordSha256: visual.accessibility.accessibilityRecordSha256
    }
  });

  const result = evaluateAssetEvidenceBundleSet([visual, audio], '2026-10-03T00:00:00.000Z');

  assert.equal(result.valid, false);
  assert.equal(result.errors.some(error => error.code === 'asset_evidence_record_subject_conflict'), true);
  assert.equal(result.errors.filter(error => error.code === 'asset_evidence_record_subject_conflict').length, 2);
});

test('rejects an asset set when delivery rights have expired at the explicitly supplied evaluation time', async () => {
  const { evaluateAssetEvidenceBundleSet } = await loadAssetEvidenceContract();
  const bundle = criticalSvgBundle({
    rights: {
      ...criticalSvgBundle().rights,
      validity: {
        startsAt: '2026-01-01T00:00:00.000Z',
        endsAt: '2026-09-30T23:59:59.000Z'
      }
    }
  });

  const result = evaluateAssetEvidenceBundleSet([bundle], '2026-10-03T00:00:00.000Z');

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'bundles[0].rights.validity',
        code: 'asset_rights_not_current',
        message: 'asset rights are not current at the supplied evaluation time'
      }
    ]
  });
});

test('rejects a rights record that is not scoped to the exact delivered byte revision', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();
  const bundle = criticalSvgBundle({
    rights: {
      ...criticalSvgBundle().rights,
      subject: assetSubject({ byteSha256: 'f'.repeat(64) })
    }
  });

  const result = validateAssetEvidenceBundle(bundle);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'rights.subject.byteSha256',
        code: 'asset_evidence_subject_mismatch',
        message: 'asset evidence must target the delivered asset byte revision'
      }
    ]
  });
});

test('rejects an SVG that has not declared the approved post-sanitization delivery profile', async () => {
  const { validateAssetEvidenceBundle } = await loadAssetEvidenceContract();
  const bundle = criticalSvgBundle({
    asset: {
      ...criticalSvgBundle().asset,
      deliveryProfile: 'raw_svg'
    }
  });

  const result = validateAssetEvidenceBundle(bundle);

  assert.deepEqual(result, {
    valid: false,
    errors: [
      {
        path: 'asset.deliveryProfile',
        code: 'asset_delivery_profile_invalid',
        message: 'asset media type requires an approved delivery profile'
      }
    ]
  });
});

test('changes the asset-set hash when reviewed accessibility treatment changes', async () => {
  const { evaluateAssetEvidenceBundleSet } = await loadAssetEvidenceContract();
  const baseline = criticalSvgBundle();
  const changedTreatment = criticalSvgBundle({
    accessibility: {
      ...criticalSvgBundle().accessibility,
      treatment: {
        shortAlt: 'Dört farklı renkte balon.',
        longDescription: 'Sayı sayma etkinliğinde kullanılan, soldan sağa dizilmiş dört balon çizimi.',
        gradeRange: {
          minGrade: 1,
          maxGrade: 1
        }
      }
    }
  });

  const first = evaluateAssetEvidenceBundleSet([baseline], '2026-10-03T00:00:00.000Z');
  const second = evaluateAssetEvidenceBundleSet([changedTreatment], '2026-10-03T00:00:00.000Z');

  assert.equal(first.valid, true);
  assert.equal(second.valid, true);
  assert.notEqual(first.assetSetSha256, second.assetSetSha256);
});
