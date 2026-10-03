-- ISOLATED SYNTHETIC PROOF ONLY. Provision in a fresh networkless disposable
-- database, not an existing school/production database. No HTTP authentication,
-- live authorization/source resolver, deployment, or student analytics here.
-- V2 command integrity is prepared in JavaScript; SQL rechecks the persisted
-- stream, hashes, cursor and immutable historical receipt inside one lock.
BEGIN;
CREATE ROLE synthetic_ledger_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE synthetic_school_a_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE synthetic_school_b_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE synthetic_no_scope_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA learning_crypto;
CREATE EXTENSION pgcrypto WITH SCHEMA learning_crypto;
REVOKE ALL ON SCHEMA learning_crypto FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA learning_crypto FROM PUBLIC;
GRANT USAGE ON SCHEMA learning_crypto TO synthetic_ledger_owner;
GRANT EXECUTE ON FUNCTION learning_crypto.digest(bytea,text) TO synthetic_ledger_owner;
CREATE SCHEMA learning_ledger AUTHORIZATION synthetic_ledger_owner;
REVOKE ALL ON SCHEMA learning_ledger FROM PUBLIC;
SET ROLE synthetic_ledger_owner;
ALTER DEFAULT PRIVILEGES IN SCHEMA learning_ledger REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Bounded proof uses ASCII keys and integers. This canonical JSON agrees with
-- the existing JavaScript fixtures, not a general JSON-number codec claim.
CREATE FUNCTION learning_ledger.canonical_jsonb(v jsonb) RETURNS text
LANGUAGE plpgsql IMMUTABLE STRICT SET search_path=pg_catalog,learning_ledger AS $$
DECLARE result text;
BEGIN
  CASE jsonb_typeof(v)
    WHEN 'object' THEN
      SELECT '{'||coalesce(string_agg(to_jsonb(key)::text||':'||learning_ledger.canonical_jsonb(value),',' ORDER BY key COLLATE "C"),'')||'}'
      INTO result FROM jsonb_each(v);
    WHEN 'array' THEN
      SELECT '['||coalesce(string_agg(learning_ledger.canonical_jsonb(value),',' ORDER BY ordinal),'')||']'
      INTO result FROM jsonb_array_elements(v) WITH ORDINALITY AS a(value,ordinal);
    ELSE result:=v::text;
  END CASE;
  RETURN result;
END $$;
CREATE FUNCTION learning_ledger.hash_jsonb(v jsonb) RETURNS text
LANGUAGE sql IMMUTABLE STRICT SET search_path=pg_catalog,learning_ledger AS $$
  SELECT encode(learning_crypto.digest(convert_to(learning_ledger.canonical_jsonb(v),'UTF8'),'sha256'),'hex');
$$;
CREATE FUNCTION learning_ledger.exact_keys(v jsonb, expected text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog,learning_ledger AS $$
  SELECT CASE WHEN jsonb_typeof(v)='object' THEN
    ARRAY(SELECT key FROM jsonb_object_keys(v) AS key ORDER BY key COLLATE "C")=
    ARRAY(SELECT key FROM unnest(expected) AS key ORDER BY key COLLATE "C") ELSE false END;
$$;

-- This is server-provisioned synthetic DB role mapping, NOT a mutable GUC.
-- session_user remains the login role inside SECURITY DEFINER routines.
CREATE TABLE learning_ledger.principal_scopes(
  db_role name PRIMARY KEY, tenant_id text NOT NULL,
  learner_pseudonym text NOT NULL, grade smallint NOT NULL CHECK(grade BETWEEN 1 AND 8)
);
CREATE FUNCTION learning_ledger.allowed_scope(t text,l text,g smallint) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,learning_ledger AS $$
  SELECT EXISTS(SELECT 1 FROM learning_ledger.principal_scopes
    WHERE db_role=session_user AND tenant_id=t AND learner_pseudonym=l AND grade=g);
$$;

CREATE TABLE learning_ledger.streams(
  locator_id text PRIMARY KEY CHECK(locator_id ~ '^ledgerstream_[A-Za-z0-9_-]{12,80}$'),
  tenant_id text NOT NULL, learner_pseudonym text NOT NULL,
  grade smallint NOT NULL CHECK(grade BETWEEN 1 AND 8), event_stream_id text NOT NULL,
  scope_sha256 text NOT NULL UNIQUE CHECK(scope_sha256 ~ '^[a-f0-9]{64}$'),
  target_sha256 text NOT NULL CHECK(target_sha256 ~ '^[a-f0-9]{64}$'),
  content_target jsonb NOT NULL, state_snapshot jsonb NOT NULL,
  state_sha256 text GENERATED ALWAYS AS (learning_ledger.hash_jsonb(state_snapshot-'stateSha256')) STORED,
  version bigint NOT NULL CHECK(version>=1), last_sequence bigint NOT NULL CHECK(last_sequence>=0),
  last_event_sha256 text,
  UNIQUE(locator_id,tenant_id,learner_pseudonym,grade),
  UNIQUE(tenant_id,learner_pseudonym,grade,event_stream_id),
  CHECK(target_sha256=learning_ledger.hash_jsonb(content_target)),
  CHECK(scope_sha256=learning_ledger.hash_jsonb(jsonb_build_object('contractVersion','1.0.0','tenantId',tenant_id,
    'learnerPseudonym',learner_pseudonym,'purpose','learning_progress_sync','eventStreamId',event_stream_id,'targetSha256',target_sha256))),
  CHECK((last_sequence=0 AND last_event_sha256 IS NULL) OR (last_sequence>0 AND last_event_sha256 ~ '^[a-f0-9]{64}$')),
  CHECK((state_snapshot->>'streamVersion')::bigint=version AND (state_snapshot->>'lastAcceptedSequence')::bigint=last_sequence
    AND state_snapshot->>'scopeSha256'=scope_sha256 AND (state_snapshot->>'lastAcceptedEventSha256') IS NOT DISTINCT FROM last_event_sha256)
);
CREATE TABLE learning_ledger.stream_governance(
  locator_id text PRIMARY KEY, tenant_id text NOT NULL, learner_pseudonym text NOT NULL, grade smallint NOT NULL,
  catalog_binding jsonb NOT NULL, data_handling_binding jsonb NOT NULL,
  owner_id text NOT NULL CHECK(length(owner_id)>0), steward_id text NOT NULL CHECK(length(steward_id)>0),
  FOREIGN KEY(locator_id,tenant_id,learner_pseudonym,grade) REFERENCES learning_ledger.streams(locator_id,tenant_id,learner_pseudonym,grade),
  CHECK(data_handling_binding->>'purpose'='learning_progress_sync'),
  CHECK(length(data_handling_binding->>'retentionClass')>0)
);
CREATE TABLE learning_ledger.receipts(
  receipt_id text PRIMARY KEY, locator_id text NOT NULL,
  tenant_id text NOT NULL, learner_pseudonym text NOT NULL, grade smallint NOT NULL,
  batch_id text NOT NULL, idempotency_key text NOT NULL,
  batch_sha256 text NOT NULL CHECK(batch_sha256 ~ '^[a-f0-9]{64}$'),
  receipt_sha256 text NOT NULL CHECK(receipt_sha256 ~ '^[a-f0-9]{64}$'), receipt_json jsonb NOT NULL,
  UNIQUE(locator_id,batch_id), UNIQUE(locator_id,idempotency_key), UNIQUE(receipt_id,locator_id),
  FOREIGN KEY(locator_id,tenant_id,learner_pseudonym,grade) REFERENCES learning_ledger.streams(locator_id,tenant_id,learner_pseudonym,grade),
  CHECK(receipt_sha256=learning_ledger.hash_jsonb(receipt_json-'receiptSha256'))
);
CREATE TABLE learning_ledger.events(
  locator_id text NOT NULL, event_sequence bigint NOT NULL CHECK(event_sequence>=1), event_id text NOT NULL,
  receipt_id text NOT NULL, tenant_id text NOT NULL, learner_pseudonym text NOT NULL, grade smallint NOT NULL,
  event_sha256 text NOT NULL CHECK(event_sha256 ~ '^[a-f0-9]{64}$'), event_payload jsonb NOT NULL,
  PRIMARY KEY(locator_id,event_sequence), UNIQUE(locator_id,event_id),
  FOREIGN KEY(receipt_id,locator_id) REFERENCES learning_ledger.receipts(receipt_id,locator_id),
  FOREIGN KEY(locator_id,tenant_id,learner_pseudonym,grade) REFERENCES learning_ledger.streams(locator_id,tenant_id,learner_pseudonym,grade),
  CHECK(event_sha256=learning_ledger.hash_jsonb(event_payload-'eventSha256')),
  CHECK(coalesce(jsonb_typeof(event_payload->'eventType')='string' AND event_payload->>'eventType' IN ('activity_started','hint_requested','activity_completed'),false))
);
CREATE INDEX events_receipt_locator_idx ON learning_ledger.events(receipt_id,locator_id);
CREATE TABLE learning_ledger.receipt_governance(
  receipt_id text PRIMARY KEY, locator_id text NOT NULL,
  tenant_id text NOT NULL, learner_pseudonym text NOT NULL, grade smallint NOT NULL,
  binding_sha256 text NOT NULL CHECK(binding_sha256 ~ '^[a-f0-9]{64}$'), binding_json jsonb NOT NULL,
  catalog_binding jsonb NOT NULL, data_handling_binding jsonb NOT NULL,
  purpose text NOT NULL, retention_class text NOT NULL, classification text NOT NULL,
  owner_id text NOT NULL, steward_id text NOT NULL,
  source_kind text NOT NULL DEFAULT 'synthetic_fixture' CHECK(source_kind='synthetic_fixture'),
  FOREIGN KEY(receipt_id,locator_id) REFERENCES learning_ledger.receipts(receipt_id,locator_id),
  FOREIGN KEY(locator_id,tenant_id,learner_pseudonym,grade) REFERENCES learning_ledger.streams(locator_id,tenant_id,learner_pseudonym,grade),
  CHECK(purpose='learning_progress_sync' AND length(retention_class)>0)
);
CREATE INDEX receipt_governance_locator_idx ON learning_ledger.receipt_governance(locator_id);

ALTER TABLE learning_ledger.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_ledger.streams FORCE ROW LEVEL SECURITY;
CREATE POLICY stream_scope ON learning_ledger.streams FOR ALL USING(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade)) WITH CHECK(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade));
ALTER TABLE learning_ledger.stream_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_ledger.stream_governance FORCE ROW LEVEL SECURITY;
CREATE POLICY stream_governance_scope ON learning_ledger.stream_governance FOR ALL USING(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade)) WITH CHECK(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade));
ALTER TABLE learning_ledger.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_ledger.receipts FORCE ROW LEVEL SECURITY;
CREATE POLICY receipt_scope ON learning_ledger.receipts FOR ALL USING(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade)) WITH CHECK(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade));
ALTER TABLE learning_ledger.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_ledger.events FORCE ROW LEVEL SECURITY;
CREATE POLICY event_scope ON learning_ledger.events FOR ALL USING(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade)) WITH CHECK(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade));
ALTER TABLE learning_ledger.receipt_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_ledger.receipt_governance FORCE ROW LEVEL SECURITY;
CREATE POLICY receipt_governance_scope ON learning_ledger.receipt_governance FOR ALL USING(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade)) WITH CHECK(learning_ledger.allowed_scope(tenant_id,learner_pseudonym,grade));

CREATE FUNCTION learning_ledger.immutable_record() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog,learning_ledger AS $$
BEGIN RAISE EXCEPTION 'immutable_ledger_record' USING ERRCODE='55000'; END $$;
CREATE TRIGGER receipt_immutable BEFORE UPDATE OR DELETE ON learning_ledger.receipts FOR EACH ROW EXECUTE FUNCTION learning_ledger.immutable_record();
CREATE TRIGGER event_immutable BEFORE UPDATE OR DELETE ON learning_ledger.events FOR EACH ROW EXECUTE FUNCTION learning_ledger.immutable_record();
CREATE TRIGGER receipt_governance_immutable BEFORE UPDATE OR DELETE ON learning_ledger.receipt_governance FOR EACH ROW EXECUTE FUNCTION learning_ledger.immutable_record();

CREATE FUNCTION learning_ledger.append_batch(command jsonb, receipt jsonb, binding jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,learning_ledger AS $$
DECLARE s learning_ledger.streams%ROWTYPE; g learning_ledger.stream_governance%ROWTYPE;
  old_receipt learning_ledger.receipts%ROWTYPE; old_binding learning_ledger.receipt_governance%ROWTYPE;
  intent jsonb; submission jsonb; cursor jsonb; event jsonb; events_without_hash jsonb; hashes jsonb;
  ordinal bigint; new_snapshot jsonb; expected_receipt jsonb; binding_digest text;
BEGIN
  IF pg_column_size(command)>262144 OR pg_column_size(receipt)>32768 OR pg_column_size(binding)>32768
    OR NOT learning_ledger.exact_keys(command,ARRAY['contractVersion','commandKind','streamLocator','append'])
    OR command->>'contractVersion' IS DISTINCT FROM '1.0.0' OR command->>'commandKind' IS DISTINCT FROM 'append'
    OR NOT learning_ledger.exact_keys(command->'streamLocator',ARRAY['locatorId','scopeSha256','eventStreamId'])
    OR NOT learning_ledger.exact_keys(command->'append',ARRAY['intent','submission','expectedCursor']) THEN
    RAISE EXCEPTION 'invalid_ledger_command' USING ERRCODE='22023';
  END IF;
  intent:=command#>'{append,intent}'; submission:=command#>'{append,submission}'; cursor:=command#>'{append,expectedCursor}';
  IF NOT learning_ledger.exact_keys(submission,ARRAY['batchId','idempotencyKey','eventStreamId','targetSha256','batchSha256','eventSha256es','events'])
    OR NOT learning_ledger.exact_keys(cursor,ARRAY['scopeSha256','streamVersion','lastAcceptedSequence','lastAcceptedEventSha256','stateSha256'])
    OR NOT learning_ledger.exact_keys(intent,ARRAY['invocationId','scopeSha256','targetSha256','batchSha256','expectedStreamVersion','firstEventSequence','lastEventSequence','eventCount','authorizationId','entitlementId','governanceSnapshotId','dataHandlingPolicyId','activityScopeSnapshotId','activityScopeSnapshotSha256','bindingContractVersion','catalogBinding','dataHandlingBinding']) THEN
    RAISE EXCEPTION 'invalid_ledger_command' USING ERRCODE='22023';
  END IF;
  -- Only this scope's stream is visible. Short transaction, no external calls.
  SELECT * INTO s FROM learning_ledger.streams WHERE locator_id=command#>>'{streamLocator,locatorId}' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'scope_denied' USING ERRCODE='42501'; END IF;
  IF command#>>'{streamLocator,scopeSha256}' IS DISTINCT FROM s.scope_sha256
    OR command#>>'{streamLocator,eventStreamId}' IS DISTINCT FROM s.event_stream_id
    OR intent->>'scopeSha256' IS DISTINCT FROM s.scope_sha256 OR cursor->>'scopeSha256' IS DISTINCT FROM s.scope_sha256
    OR intent->>'targetSha256' IS DISTINCT FROM s.target_sha256 OR submission->>'targetSha256' IS DISTINCT FROM s.target_sha256
    OR submission->>'eventStreamId' IS DISTINCT FROM s.event_stream_id OR intent->>'batchSha256' IS DISTINCT FROM submission->>'batchSha256' THEN
    RAISE EXCEPTION 'scope_or_target_mismatch' USING ERRCODE='42501';
  END IF;
  SELECT * INTO old_receipt FROM learning_ledger.receipts WHERE locator_id=s.locator_id
    AND (idempotency_key=submission->>'idempotencyKey' OR batch_id=submission->>'batchId');
  IF FOUND AND (old_receipt.batch_sha256 IS DISTINCT FROM submission->>'batchSha256'
    OR old_receipt.batch_id IS DISTINCT FROM submission->>'batchId' OR old_receipt.idempotency_key IS DISTINCT FROM submission->>'idempotencyKey') THEN
    RAISE EXCEPTION 'idempotency_conflict' USING ERRCODE='23505';
  END IF;
  IF old_receipt.receipt_id IS NULL AND ((cursor->>'streamVersion')::bigint IS DISTINCT FROM s.version
    OR (intent->>'expectedStreamVersion')::bigint IS DISTINCT FROM s.version
    OR (cursor->>'lastAcceptedSequence')::bigint IS DISTINCT FROM s.last_sequence
    OR cursor->>'lastAcceptedEventSha256' IS DISTINCT FROM s.last_event_sha256
    OR cursor->>'stateSha256' IS DISTINCT FROM s.state_sha256) THEN
    RAISE EXCEPTION 'stale_cursor' USING ERRCODE='40001';
  END IF;
  IF jsonb_typeof(submission->'events') IS DISTINCT FROM 'array' OR jsonb_array_length(submission->'events') NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'invalid_event_range' USING ERRCODE='22023';
  END IF;
  events_without_hash:='[]'::jsonb; hashes:='[]'::jsonb;
  FOR event,ordinal IN SELECT value,position FROM jsonb_array_elements(submission->'events') WITH ORDINALITY AS a(value,position) LOOP
    IF NOT learning_ledger.exact_keys(event,ARRAY['eventId','eventSequence','activityId','eventType','clientOccurredAt','eventSha256'])
      OR event->>'eventSha256' IS DISTINCT FROM learning_ledger.hash_jsonb(event-'eventSha256')
      OR jsonb_typeof(event->'eventSequence') IS DISTINCT FROM 'number'
      OR (event->>'eventSequence')::bigint IS DISTINCT FROM (intent->>'firstEventSequence')::bigint+ordinal-1
      OR jsonb_typeof(event->'eventType') IS DISTINCT FROM 'string'
      OR event->>'eventType' NOT IN ('activity_started','hint_requested','activity_completed')
      OR jsonb_typeof(event->'activityId') IS DISTINCT FROM 'string'
      OR jsonb_typeof(event->'clientOccurredAt') IS DISTINCT FROM 'string'
      OR length(event->>'eventId') NOT BETWEEN 1 AND 140 OR length(event->>'activityId') NOT BETWEEN 1 AND 140 THEN
      RAISE EXCEPTION 'invalid_event_integrity' USING ERRCODE='22023';
    END IF;
    events_without_hash:=events_without_hash||jsonb_build_array(event-'eventSha256'); hashes:=hashes||jsonb_build_array(event->>'eventSha256');
  END LOOP;
  IF submission->'eventSha256es' IS DISTINCT FROM hashes
    OR (intent->>'eventCount')::bigint IS DISTINCT FROM jsonb_array_length(hashes)
    OR (intent->>'lastEventSequence')::bigint IS DISTINCT FROM (intent->>'firstEventSequence')::bigint+jsonb_array_length(hashes)-1
    OR submission->>'batchSha256' IS DISTINCT FROM learning_ledger.hash_jsonb(jsonb_build_object('contractVersion','1.0.0',
      'batchId',submission->>'batchId','idempotencyKey',submission->>'idempotencyKey','eventStreamId',s.event_stream_id,
      'contentTarget',s.content_target,'events',events_without_hash)) THEN
    RAISE EXCEPTION 'invalid_batch_integrity' USING ERRCODE='22023';
  END IF;
  IF old_receipt.receipt_id IS NOT NULL THEN
    SELECT * INTO old_binding FROM learning_ledger.receipt_governance WHERE receipt_id=old_receipt.receipt_id;
    IF old_receipt.receipt_json IS DISTINCT FROM receipt OR old_binding.binding_json IS DISTINCT FROM binding THEN
      RAISE EXCEPTION 'receipt_governance_mismatch' USING ERRCODE='22023';
    END IF;
    RETURN jsonb_build_object('outcome','idempotent_replay','receipt',old_receipt.receipt_json,
      'cursor',jsonb_build_object('version',s.version,'lastSequence',s.last_sequence,'lastEventSha256',s.last_event_sha256,'stateSha256',s.state_sha256));
  END IF;
  IF (intent->>'firstEventSequence')::bigint IS DISTINCT FROM s.last_sequence+1 THEN
    RAISE EXCEPTION 'invalid_event_range' USING ERRCODE='22023';
  END IF;
  SELECT * INTO g FROM learning_ledger.stream_governance WHERE locator_id=s.locator_id;
  IF NOT FOUND OR intent->'catalogBinding' IS DISTINCT FROM g.catalog_binding
    OR intent->'dataHandlingBinding' IS DISTINCT FROM g.data_handling_binding
    OR intent->>'dataHandlingPolicyId' IS DISTINCT FROM g.data_handling_binding->>'policyId'
    OR intent->>'bindingContractVersion' IS DISTINCT FROM '2.0.0' THEN
    RAISE EXCEPTION 'governance_source_mismatch' USING ERRCODE='22023';
  END IF;
  IF NOT learning_ledger.exact_keys(receipt,ARRAY['receiptId','receiptSha256','scopeSha256','batchId','idempotencyKey','batchSha256','firstEventSequence','lastEventSequence','eventSha256es','predecessorSequence','predecessorEventSha256','streamVersionBefore','acceptedAt','authorizationId','entitlementId','governanceSnapshotId','dataHandlingPolicyId','outcome'])
    OR jsonb_typeof(receipt->'acceptedAt') IS DISTINCT FROM 'string'
    OR length(receipt->>'receiptId') NOT BETWEEN 1 AND 140 OR receipt->>'acceptedAt' !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{3})?Z$'
    OR receipt->>'receiptSha256' IS DISTINCT FROM learning_ledger.hash_jsonb(receipt-'receiptSha256') THEN
    RAISE EXCEPTION 'invalid_receipt_integrity' USING ERRCODE='22023';
  END IF;
  PERFORM (receipt->>'acceptedAt')::timestamptz;
  expected_receipt:=jsonb_build_object('receiptId',receipt->>'receiptId','scopeSha256',s.scope_sha256,
    'batchId',submission->>'batchId','idempotencyKey',submission->>'idempotencyKey','batchSha256',submission->>'batchSha256',
    'firstEventSequence',(intent->>'firstEventSequence')::bigint,'lastEventSequence',(intent->>'lastEventSequence')::bigint,'eventSha256es',hashes,
    'predecessorSequence',s.last_sequence,'predecessorEventSha256',s.last_event_sha256,'streamVersionBefore',s.version,
    'acceptedAt',receipt->>'acceptedAt','authorizationId',intent->>'authorizationId','entitlementId',intent->>'entitlementId',
    'governanceSnapshotId',intent->>'governanceSnapshotId','dataHandlingPolicyId',intent->>'dataHandlingPolicyId','outcome','accepted');
  IF receipt-'receiptSha256' IS DISTINCT FROM expected_receipt THEN
    RAISE EXCEPTION 'invalid_receipt_binding' USING ERRCODE='22023';
  END IF;
  binding_digest:=encode(learning_crypto.digest(convert_to('k12.learning-sync.receipt-governance-binding/v2:'||learning_ledger.canonical_jsonb(binding-'bindingSha256'),'UTF8'),'sha256'),'hex');
  IF NOT learning_ledger.exact_keys(binding,ARRAY['bindingContractVersion','bindingSha256','receiptId','receiptSha256','scopeSha256','batchSha256','dataHandlingPolicyId','dataHandlingPolicySha256','catalogBinding'])
    OR binding->>'bindingSha256' IS DISTINCT FROM binding_digest
    OR binding->>'bindingContractVersion' IS DISTINCT FROM '2.0.0' OR binding->>'receiptId' IS DISTINCT FROM receipt->>'receiptId'
    OR binding->>'receiptSha256' IS DISTINCT FROM receipt->>'receiptSha256' OR binding->>'scopeSha256' IS DISTINCT FROM s.scope_sha256
    OR binding->>'batchSha256' IS DISTINCT FROM submission->>'batchSha256'
    OR binding->>'dataHandlingPolicyId' IS DISTINCT FROM g.data_handling_binding->>'policyId'
    OR binding->>'dataHandlingPolicySha256' IS DISTINCT FROM g.data_handling_binding->>'policySha256'
    OR binding->'catalogBinding' IS DISTINCT FROM g.catalog_binding THEN
    RAISE EXCEPTION 'receipt_governance_mismatch' USING ERRCODE='22023';
  END IF;
  INSERT INTO learning_ledger.receipts VALUES(receipt->>'receiptId',s.locator_id,s.tenant_id,s.learner_pseudonym,s.grade,
    submission->>'batchId',submission->>'idempotencyKey',submission->>'batchSha256',receipt->>'receiptSha256',receipt);
  FOR event IN SELECT value FROM jsonb_array_elements(submission->'events') LOOP
    INSERT INTO learning_ledger.events VALUES(s.locator_id,(event->>'eventSequence')::bigint,event->>'eventId',receipt->>'receiptId',
      s.tenant_id,s.learner_pseudonym,s.grade,event->>'eventSha256',event);
  END LOOP;
  INSERT INTO learning_ledger.receipt_governance(receipt_id,locator_id,tenant_id,learner_pseudonym,grade,binding_sha256,binding_json,catalog_binding,data_handling_binding,purpose,retention_class,classification,owner_id,steward_id)
    VALUES(receipt->>'receiptId',s.locator_id,s.tenant_id,s.learner_pseudonym,s.grade,binding_digest,binding,g.catalog_binding,g.data_handling_binding,
      g.data_handling_binding->>'purpose',g.data_handling_binding->>'retentionClass',g.data_handling_binding->>'classification',g.owner_id,g.steward_id);
  new_snapshot:=(s.state_snapshot-'stateSha256')||jsonb_build_object('snapshotId',(s.state_snapshot->>'snapshotId')||':'||(s.version+1),
    'streamVersion',s.version+1,'lastAcceptedSequence',(intent->>'lastEventSequence')::bigint,
    'lastAcceptedEventSha256',hashes->>-1,'capturedAt',receipt->>'acceptedAt');
  UPDATE learning_ledger.streams SET version=s.version+1,last_sequence=(intent->>'lastEventSequence')::bigint,
    last_event_sha256=hashes->>-1,state_snapshot=new_snapshot WHERE locator_id=s.locator_id RETURNING * INTO s;
  RETURN jsonb_build_object('outcome','accepted','receipt',receipt,
    'cursor',jsonb_build_object('version',s.version,'lastSequence',s.last_sequence,'lastEventSha256',s.last_event_sha256,'stateSha256',s.state_sha256));
END $$;

CREATE FUNCTION learning_ledger.replay_receipt(command jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,learning_ledger AS $$
DECLARE s learning_ledger.streams%ROWTYPE; r learning_ledger.receipts%ROWTYPE;
  g learning_ledger.receipt_governance%ROWTYPE; intent jsonb;
BEGIN
  IF pg_column_size(command)>32768 OR NOT learning_ledger.exact_keys(command,ARRAY['contractVersion','commandKind','streamLocator','replay'])
    OR command->>'contractVersion' IS DISTINCT FROM '1.0.0' OR command->>'commandKind' IS DISTINCT FROM 'replay'
    OR NOT learning_ledger.exact_keys(command->'streamLocator',ARRAY['locatorId','scopeSha256','eventStreamId'])
    OR NOT learning_ledger.exact_keys(command->'replay',ARRAY['intent']) THEN RAISE EXCEPTION 'invalid_ledger_command' USING ERRCODE='22023'; END IF;
  intent:=command#>'{replay,intent}';
  IF NOT learning_ledger.exact_keys(intent,ARRAY['invocationId','receiptId','receiptSha256','scopeSha256','batchSha256','bindingContractVersion','receiptGovernanceBindingSha256','catalogBinding','dataHandlingBinding']) THEN
    RAISE EXCEPTION 'invalid_ledger_command' USING ERRCODE='22023';
  END IF;
  SELECT * INTO s FROM learning_ledger.streams WHERE locator_id=command#>>'{streamLocator,locatorId}';
  IF NOT FOUND THEN RAISE EXCEPTION 'scope_denied' USING ERRCODE='42501'; END IF;
  IF command#>>'{streamLocator,scopeSha256}' IS DISTINCT FROM s.scope_sha256 OR intent->>'scopeSha256' IS DISTINCT FROM s.scope_sha256
    OR command#>>'{streamLocator,eventStreamId}' IS DISTINCT FROM s.event_stream_id THEN RAISE EXCEPTION 'scope_denied' USING ERRCODE='42501'; END IF;
  SELECT * INTO r FROM learning_ledger.receipts WHERE locator_id=s.locator_id AND receipt_id=intent->>'receiptId';
  IF NOT FOUND THEN RAISE EXCEPTION 'scope_denied' USING ERRCODE='42501'; END IF;
  SELECT * INTO g FROM learning_ledger.receipt_governance WHERE receipt_id=r.receipt_id;
  IF NOT FOUND OR intent->>'receiptSha256' IS DISTINCT FROM r.receipt_sha256 OR intent->>'batchSha256' IS DISTINCT FROM r.batch_sha256
    OR intent->>'receiptGovernanceBindingSha256' IS DISTINCT FROM g.binding_sha256 OR intent->>'bindingContractVersion' IS DISTINCT FROM '2.0.0'
    OR intent->'catalogBinding' IS DISTINCT FROM g.catalog_binding OR intent->'dataHandlingBinding' IS DISTINCT FROM g.data_handling_binding THEN
    RAISE EXCEPTION 'receipt_governance_mismatch' USING ERRCODE='22023';
  END IF;
  RETURN jsonb_build_object('outcome','idempotent_replay','receipt',r.receipt_json,
    'cursor',jsonb_build_object('version',s.version,'lastSequence',s.last_sequence,'lastEventSha256',s.last_event_sha256,'stateSha256',s.state_sha256));
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA learning_ledger FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA learning_ledger FROM PUBLIC;
GRANT USAGE ON SCHEMA learning_ledger TO synthetic_school_a_app,synthetic_school_b_app,synthetic_no_scope_app;
GRANT SELECT ON learning_ledger.streams,learning_ledger.events,learning_ledger.receipts,learning_ledger.receipt_governance
  TO synthetic_school_a_app,synthetic_school_b_app,synthetic_no_scope_app;
GRANT EXECUTE ON FUNCTION learning_ledger.allowed_scope(text,text,smallint),learning_ledger.append_batch(jsonb,jsonb,jsonb),learning_ledger.replay_receipt(jsonb)
  TO synthetic_school_a_app,synthetic_school_b_app,synthetic_no_scope_app;
RESET ROLE;
COMMIT;
