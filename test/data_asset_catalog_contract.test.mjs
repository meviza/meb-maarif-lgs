import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const CONTRACT_MODULE_URL = new URL('../packages/contracts/data_asset_catalog.mjs', import.meta.url);

async function loadContract() {
  // Break caught: DAMA metadata remained duplicated inside individual
  // contracts, without a closed catalog binding the first learning vertical
  // slice to owners, policies, quality rules, contracts, and lineage.
  assert.equal(
    fs.existsSync(CONTRACT_MODULE_URL),
    true,
    'governed K-12 data products require a versioned metadata catalog contract'
  );
  return import(CONTRACT_MODULE_URL.href);
}

function dataGovernance(overrides = {}) {
  return {
    owner: 'owner_learning_governance_001',
    steward: 'steward_learning_governance_001',
    classification: 'pseudonymous_learning_telemetry',
    processingPurpose: 'learning_progress_sync',
    retentionClass: 'learning_event_lifecycle',
    accessPolicyId: 'policy_learning_governance_001',
    ...overrides
  };
}

function dataContractRefs(prefix) {
  return [{
    contractId: `contract_${prefix}_001`,
    contractVersion: '1.0.0',
    contractSha256: 'a'.repeat(64),
    bindingState: 'declared'
  }];
}

function asset({ assetId, assetKind, revisionId, revisionSequence, domain, governance, prefix }) {
  return {
    assetId,
    assetKind,
    revisionId,
    revisionSequence,
    lifecycleState: 'registered',
    definitionSha256: null,
    domain,
    dataGovernance: dataGovernance(governance),
    dataContractRefs: dataContractRefs(prefix),
    businessTermIds: [`term_${prefix}_001`],
    qualityRuleIds: [`quality_${prefix}_001`]
  };
}

function validCatalog() {
  return {
    contractVersion: '1.0.0',
    catalogId: 'catalog_learning_governance_001',
    catalogRevisionId: 'catalogrev_learning_governance_001',
    catalogRevisionSequence: 1,
    lifecycleState: 'registered',
    catalogSha256: null,
    assets: [
      asset({
        assetId: 'dataasset_governed_delivery_snapshot_001',
        assetKind: 'governed_content_delivery_snapshot',
        revisionId: 'dataassetrev_governed_delivery_snapshot_001',
        revisionSequence: 1,
        domain: 'content_delivery',
        governance: {
          classification: 'governance_record',
          processingPurpose: 'student_content_delivery',
          retentionClass: 'content_delivery_lifecycle',
          accessPolicyId: 'policy_content_delivery_001'
        },
        prefix: 'governed_delivery'
      }),
      asset({
        assetId: 'dataasset_learning_event_stream_001',
        assetKind: 'learning_event_stream',
        revisionId: 'dataassetrev_learning_event_stream_001',
        revisionSequence: 1,
        domain: 'learning_assessment',
        governance: {},
        prefix: 'learning_event'
      }),
      asset({
        assetId: 'dataasset_learning_sync_receipt_001',
        assetKind: 'learning_sync_receipt',
        revisionId: 'dataassetrev_learning_sync_receipt_001',
        revisionSequence: 1,
        domain: 'learning_assessment',
        governance: {},
        prefix: 'learning_receipt'
      }),
      asset({
        assetId: 'dataasset_learning_analytics_aggregate_001',
        assetKind: 'learning_analytics_aggregate',
        revisionId: 'dataassetrev_learning_analytics_aggregate_001',
        revisionSequence: 1,
        domain: 'analytics',
        governance: {
          classification: 'aggregated_learning_analytics',
          processingPurpose: 'learning_analytics',
          retentionClass: 'analytics_lifecycle',
          accessPolicyId: 'policy_learning_analytics_001'
        },
        prefix: 'learning_analytics'
      })
    ],
    lineageEdges: [
      {
        edgeId: 'lineage_delivery_to_event_001',
        relationship: 'derives_from',
        upstream: {
          assetId: 'dataasset_governed_delivery_snapshot_001',
          revisionId: 'dataassetrev_governed_delivery_snapshot_001',
          definitionSha256: null
        },
        downstream: {
          assetId: 'dataasset_learning_event_stream_001',
          revisionId: 'dataassetrev_learning_event_stream_001',
          definitionSha256: null
        }
      },
      {
        edgeId: 'lineage_event_to_receipt_001',
        relationship: 'derives_from',
        upstream: {
          assetId: 'dataasset_learning_event_stream_001',
          revisionId: 'dataassetrev_learning_event_stream_001',
          definitionSha256: null
        },
        downstream: {
          assetId: 'dataasset_learning_sync_receipt_001',
          revisionId: 'dataassetrev_learning_sync_receipt_001',
          definitionSha256: null
        }
      },
      {
        edgeId: 'lineage_receipt_to_analytics_001',
        relationship: 'derives_from',
        upstream: {
          assetId: 'dataasset_learning_sync_receipt_001',
          revisionId: 'dataassetrev_learning_sync_receipt_001',
          definitionSha256: null
        },
        downstream: {
          assetId: 'dataasset_learning_analytics_aggregate_001',
          revisionId: 'dataassetrev_learning_analytics_aggregate_001',
          definitionSha256: null
        }
      }
    ]
  };
}

function addIntegrity(contract, catalog) {
  for (const catalogAsset of catalog.assets) {
    catalogAsset.definitionSha256 = contract.calculateDataAssetDefinitionSha256(catalogAsset);
  }

  const assetById = new Map(catalog.assets.map(catalogAsset => [catalogAsset.assetId, catalogAsset]));
  for (const edge of catalog.lineageEdges) {
    edge.upstream.definitionSha256 = assetById.get(edge.upstream.assetId).definitionSha256;
    edge.downstream.definitionSha256 = assetById.get(edge.downstream.assetId).definitionSha256;
  }

  catalog.catalogSha256 = contract.calculateDataAssetCatalogSha256(catalog);
  return catalog;
}

test('accepts a metadata-only catalog for the governed learning vertical slice', async () => {
  const contract = await loadContract();
  const catalog = addIntegrity(contract, validCatalog());

  const result = contract.validateDataAssetCatalog(catalog);

  assert.equal(result.valid, true);
  assert.equal(result.outcome, 'catalog_valid');
  assert.deepEqual(result.errors, []);
  assert.equal(result.integrity.catalogSha256, catalog.catalogSha256);
  assert.equal(result.normalizedCatalog.assets.length, 4);
  assert.equal(Object.isFrozen(result.normalizedCatalog), true);
});

test('derives order-independent catalog integrity while binding every governed metadata field', async () => {
  const contract = await loadContract();
  const first = addIntegrity(contract, validCatalog());
  const reordered = validCatalog();
  reordered.assets[0].businessTermIds = ['term_governed_delivery_secondary', 'term_governed_delivery'];
  reordered.assets[0].qualityRuleIds = ['quality_delivery_hash_secondary', 'quality_delivery_hash'];
  reordered.assets.reverse();
  reordered.lineageEdges.reverse();
  reordered.assets[3].businessTermIds.reverse();
  reordered.assets[3].qualityRuleIds.reverse();
  addIntegrity(contract, reordered);

  assert.equal(
    contract.calculateDataAssetCatalogSha256(reordered),
    contract.calculateDataAssetCatalogSha256(reordered),
    'the same closed metadata must have a stable integrity value'
  );

  const reorderedAgain = validCatalog();
  reorderedAgain.assets[0].businessTermIds = ['term_governed_delivery_secondary', 'term_governed_delivery'];
  reorderedAgain.assets[0].qualityRuleIds = ['quality_delivery_hash_secondary', 'quality_delivery_hash'];
  reorderedAgain.assets.reverse();
  reorderedAgain.lineageEdges.reverse();
  addIntegrity(contract, reorderedAgain);

  assert.equal(
    contract.calculateDataAssetCatalogSha256(reordered),
    contract.calculateDataAssetCatalogSha256(reorderedAgain),
    'asset, reference, term, rule, and edge order must not change catalog identity'
  );

  const changed = validCatalog();
  changed.assets[0].dataGovernance.owner = 'owner_content_alternate_001';
  addIntegrity(contract, changed);
  assert.notEqual(
    first.catalogSha256,
    changed.catalogSha256,
    'owner/steward governance metadata must remain bound to catalog integrity'
  );
});

test('returns a detached deeply immutable normalized catalog after the caller mutates its source object', async () => {
  const contract = await loadContract();
  const catalog = addIntegrity(contract, validCatalog());
  const result = contract.validateDataAssetCatalog(catalog);

  catalog.assets[0].dataGovernance.owner = 'owner_mutated_after_validation_001';
  catalog.assets[1].businessTermIds[0] = 'term_mutated_after_validation_001';
  catalog.lineageEdges[0].upstream.assetId = 'dataasset_mutated_after_validation_001';

  const normalizedAsset = result.normalizedCatalog.assets.find(item => item.assetKind === 'governed_content_delivery_snapshot');
  assert.equal(normalizedAsset.dataGovernance.owner, 'owner_learning_governance_001');
  assert.equal(Object.isFrozen(result.normalizedCatalog.assets), true);
  assert.equal(Object.isFrozen(normalizedAsset), true);
  assert.equal(Object.isFrozen(normalizedAsset.dataGovernance), true);
  assert.equal(Object.isFrozen(normalizedAsset.dataContractRefs), true);
  assert.equal(Object.isFrozen(normalizedAsset.dataContractRefs[0]), true);
  assert.equal(Object.isFrozen(result.normalizedCatalog.lineageEdges[0]), true);
  assert.equal(Object.isFrozen(result.normalizedCatalog.lineageEdges[0].upstream), true);
});

test('rejects unexpected raw learner or secret fields without echoing their values or producing integrity', async () => {
  const contract = await loadContract();
  const catalog = addIntegrity(contract, validCatalog());
  catalog.assets[1].dataSample = { email: 'child@example.test' };
  catalog.assets[1].dataGovernance.owner = 'child@example.test';
  catalog['accessToken=secret-value'] = 'do-not-echo';

  const result = contract.validateDataAssetCatalog(catalog);
  const serialized = JSON.stringify(result);

  assert.equal(result.valid, false);
  assert.equal(result.errors.some(error => error.code === 'unexpected_field'), true);
  assert.equal(result.errors.some(error => error.code === 'opaque_reference_invalid'), true);
  assert.equal(serialized.includes('child@example.test'), false);
  assert.equal(serialized.includes('secret-value'), false);
  assert.equal(Object.hasOwn(result, 'integrity'), false);
  assert.equal(Object.hasOwn(result, 'normalizedCatalog'), false);
});

test('rejects an unbound asset-definition change and a lineage cycle before a catalog can be used', async () => {
  const contract = await loadContract();
  const catalog = addIntegrity(contract, validCatalog());
  catalog.assets[1].dataGovernance.steward = 'steward_changed_without_rehash_001';

  const staleResult = contract.validateDataAssetCatalog(catalog);
  assert.equal(staleResult.valid, false);
  assert.equal(staleResult.errors.some(error => error.code === 'definition_sha256_mismatch'), true);
  assert.throws(
    () => contract.calculateDataAssetCatalogSha256(catalog),
    { name: 'TypeError', message: 'a valid metadata-only data-asset catalog is required' }
  );

  const cycleCatalog = addIntegrity(contract, validCatalog());
  const delivery = cycleCatalog.assets.find(item => item.assetKind === 'governed_content_delivery_snapshot');
  const receipt = cycleCatalog.assets.find(item => item.assetKind === 'learning_sync_receipt');
  const edge = cycleCatalog.lineageEdges[2];
  edge.upstream = {
    assetId: receipt.assetId,
    revisionId: receipt.revisionId,
    definitionSha256: receipt.definitionSha256
  };
  edge.downstream = {
    assetId: delivery.assetId,
    revisionId: delivery.revisionId,
    definitionSha256: delivery.definitionSha256
  };

  const cycleResult = contract.validateDataAssetCatalog(cycleCatalog);
  assert.equal(cycleResult.valid, false);
  assert.equal(cycleResult.errors.some(error => error.code === 'lineage_cycle_detected'), true);
  assert.equal(Object.hasOwn(cycleResult, 'integrity'), false);
});

test('fails closed for inherited, accessor, or named-array metadata instead of reading it', async () => {
  const contract = await loadContract();
  const inheritedResult = contract.validateDataAssetCatalog(Object.create(addIntegrity(contract, validCatalog())));
  assert.equal(inheritedResult.valid, false);
  assert.equal(inheritedResult.errors.some(error => error.code === 'record_invalid'), true);

  const accessorCatalog = addIntegrity(contract, validCatalog());
  let reads = 0;
  Object.defineProperty(accessorCatalog.assets[0], 'assetId', {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return 'dataasset_accessor_001';
    }
  });
  const accessorResult = contract.validateDataAssetCatalog(accessorCatalog);
  assert.equal(accessorResult.valid, false);
  assert.equal(reads, 0, 'descriptor inspection must reject an accessor without invoking it');
  assert.equal(accessorResult.errors.some(error => error.code === 'accessor_field_not_allowed'), true);

  const namedArrayCatalog = addIntegrity(contract, validCatalog());
  namedArrayCatalog.assets.extra = 'untrusted-named-value';
  const namedArrayResult = contract.validateDataAssetCatalog(namedArrayCatalog);
  assert.equal(namedArrayResult.valid, false);
  assert.equal(namedArrayResult.errors.some(error => error.code === 'array_property_count_exceeds_limit'), true);
});

test('permits absent integrity placeholders only while calculating a new definition or catalog hash', async () => {
  const contract = await loadContract();
  const catalog = validCatalog();

  for (const catalogAsset of catalog.assets) {
    delete catalogAsset.definitionSha256;
    catalogAsset.definitionSha256 = contract.calculateDataAssetDefinitionSha256(catalogAsset);
  }
  const assetById = new Map(catalog.assets.map(catalogAsset => [catalogAsset.assetId, catalogAsset]));
  for (const edge of catalog.lineageEdges) {
    edge.upstream.definitionSha256 = assetById.get(edge.upstream.assetId).definitionSha256;
    edge.downstream.definitionSha256 = assetById.get(edge.downstream.assetId).definitionSha256;
  }
  delete catalog.catalogSha256;
  const calculatedCatalogSha256 = contract.calculateDataAssetCatalogSha256(catalog);

  assert.match(calculatedCatalogSha256, /^[a-f0-9]{64}$/u);
  const validationWithoutDeclaredHash = contract.validateDataAssetCatalog(catalog);
  assert.equal(validationWithoutDeclaredHash.valid, false);
  assert.equal(validationWithoutDeclaredHash.errors.some(error => error.code === 'required_field_missing'), true);

  catalog.catalogSha256 = calculatedCatalogSha256;
  assert.equal(contract.validateDataAssetCatalog(catalog).valid, true);
});

test('caps malformed-input error output before named fields can amplify validation work or logs', async () => {
  const contract = await loadContract();
  const catalog = addIntegrity(contract, validCatalog());
  for (let index = 0; index < 512; index += 1) {
    catalog.assets[`untrusted_field_${index}`] = 'ignore';
  }

  const result = contract.validateDataAssetCatalog(catalog);

  assert.equal(result.valid, false);
  assert.ok(result.errors.length <= 64, 'validation errors must have a fixed output ceiling');
  assert.equal(result.errors.some(error => error.code === 'array_property_count_exceeds_limit'), true);
  assert.equal(result.errors.some(error => error.code === 'validation_error_limit_exceeded'), false);
});

test('rejects hostile metadata values without invoking their implicit coercion hooks', async () => {
  const contract = await loadContract();
  const catalog = addIntegrity(contract, validCatalog());
  let coercions = 0;
  catalog.assets[1].businessTermIds = [{
    [Symbol.toPrimitive]() {
      coercions += 1;
      return 'term_hostile_001';
    }
  }, 'term_secondary_001'];

  let result;
  assert.doesNotThrow(() => {
    result = contract.validateDataAssetCatalog(catalog);
  });

  assert.equal(result.valid, false);
  assert.equal(coercions, 0, 'invalid metadata values must never enter comparison, key, or hash coercion');
  assert.equal(result.errors.some(error => error.code === 'business_term_invalid'), true);
  assert.equal(result.errors.some(error => error.code === 'catalog_input_unreadable'), false);
  assert.equal(Object.hasOwn(result, 'integrity'), false);
});

test('fails closed with a generic result when an untrusted reflection trap throws', async () => {
  const contract = await loadContract();
  const throwingCatalog = new Proxy({}, {
    ownKeys() {
      throw new Error('do-not-expose-proxy-detail');
    }
  });
  let result;

  assert.doesNotThrow(() => {
    result = contract.validateDataAssetCatalog(throwingCatalog);
  });

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.map(error => error.code),
    ['catalog_input_unreadable']
  );
  assert.equal(JSON.stringify(result).includes('do-not-expose-proxy-detail'), false);
});

test('emits one bounded sentinel when several individually bounded fields together exceed the error budget', async () => {
  const contract = await loadContract();
  const catalog = addIntegrity(contract, validCatalog());
  for (const catalogAsset of catalog.assets) {
    const invalidTerms = [];
    for (let index = 0; index < 32; index += 1) {
      invalidTerms.push({ invalid: index });
    }
    catalogAsset.businessTermIds = invalidTerms;
  }

  const result = contract.validateDataAssetCatalog(catalog);

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 64);
  assert.equal(result.errors.filter(error => error.code === 'validation_error_limit_exceeded').length, 1);
  assert.equal(Object.hasOwn(result, 'integrity'), false);
});
