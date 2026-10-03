// Preserve historical source for audit, but do not dispatch unsafe legacy workflows.
// This is an npm entrypoint gate, not an OS-level ban on direct legacy file execution.
console.error(JSON.stringify({
  state: 'legacy_workflow_quarantined',
  sideEffects: false,
  publicationEnabled: false,
  reason: 'legacy_approval_curriculum_and_cloud_claims_not_independently_verified',
  next: 'npm run generate:pilot -- --count 100 --out NEW_EMPTY_DIRECTORY; npm run studio',
}));
process.exitCode = 2;
