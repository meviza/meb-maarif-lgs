-- FRESH ISOLATED SYNTHETIC DATABASE ONLY; intentionally standalone from 001.
-- Not an HTTP login, live DAMA source resolver, encryption/retention service,
-- production notebook endpoint, or learning-event/analytics persistence.
BEGIN;
CREATE ROLE synthetic_notebook_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE synthetic_notebook_school_a_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE synthetic_notebook_school_b_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE ROLE synthetic_notebook_no_scope_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA notebook_crypto;
CREATE EXTENSION pgcrypto WITH SCHEMA notebook_crypto;
REVOKE ALL ON SCHEMA notebook_crypto FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA notebook_crypto FROM PUBLIC;
GRANT USAGE ON SCHEMA notebook_crypto TO synthetic_notebook_owner;
GRANT EXECUTE ON FUNCTION notebook_crypto.digest(bytea,text) TO synthetic_notebook_owner;
CREATE SCHEMA student_notebook AUTHORIZATION synthetic_notebook_owner;
REVOKE ALL ON SCHEMA student_notebook FROM PUBLIC;
SET ROLE synthetic_notebook_owner;
ALTER DEFAULT PRIVILEGES IN SCHEMA student_notebook REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Accepted hash profile: fixed ASCII object keys, Unicode scalar text, safe
-- integer metadata, stroke coordinates 0..1 with <=4 decimal places. Numeric
-- trailing zeros are normalized, but unsupported precision is NEVER rounded.
-- PostgreSQL JSONB rejects U+0000 and unpaired surrogates before this boundary.
CREATE FUNCTION student_notebook.canonical_jsonb(v jsonb) RETURNS text
LANGUAGE plpgsql IMMUTABLE STRICT SET search_path=pg_catalog,student_notebook AS $$
DECLARE answer text;
BEGIN
  CASE jsonb_typeof(v)
    WHEN 'object' THEN SELECT '{'||coalesce(string_agg(to_json(key)::text||':'||student_notebook.canonical_jsonb(value),',' ORDER BY key COLLATE "C"),'')||'}'
      INTO answer FROM jsonb_each(v);
    WHEN 'array' THEN SELECT '['||coalesce(string_agg(student_notebook.canonical_jsonb(value),',' ORDER BY position),'')||']'
      INTO answer FROM jsonb_array_elements(v) WITH ORDINALITY AS a(value,position);
    WHEN 'number' THEN answer:=trim_scale((v#>>'{}')::numeric)::text;
    ELSE answer:=v::text;
  END CASE;
  RETURN answer;
END $$;
CREATE FUNCTION student_notebook.hash_jsonb(kind text,v jsonb) RETURNS text
LANGUAGE sql IMMUTABLE STRICT SET search_path=pg_catalog,student_notebook AS $$
  SELECT encode(notebook_crypto.digest(convert_to('k12.synthetic-notebook.'||kind||'/v1:'||student_notebook.canonical_jsonb(v),'UTF8'),'sha256'),'hex');
$$;
CREATE FUNCTION student_notebook.exact_keys(v jsonb,expected text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
  SELECT CASE WHEN jsonb_typeof(v)='object' THEN
    ARRAY(SELECT key FROM jsonb_object_keys(v) AS key ORDER BY key COLLATE "C")=
    ARRAY(SELECT key FROM unnest(expected) AS key ORDER BY key COLLATE "C") ELSE false END;
$$;
CREATE FUNCTION student_notebook.id_valid(v jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
  SELECT CASE WHEN jsonb_typeof(v)='string' THEN v#>>'{}' ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$' ELSE false END;
$$;
CREATE FUNCTION student_notebook.hash_valid(v jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
  SELECT CASE WHEN jsonb_typeof(v)='string' THEN v#>>'{}' ~ '^[a-f0-9]{64}$' ELSE false END;
$$;
CREATE FUNCTION student_notebook.revision_valid(v jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
  SELECT CASE WHEN jsonb_typeof(v)='number' AND v#>>'{}' ~ '^(0|[1-9][0-9]{0,15})$'
    THEN (v#>>'{}')::numeric BETWEEN 0 AND 9007199254740991 ELSE false END;
$$;
CREATE FUNCTION student_notebook.array_size(v jsonb) RETURNS integer
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
  SELECT CASE WHEN jsonb_typeof(v)='array' THEN jsonb_array_length(v) ELSE -1 END;
$$;
CREATE FUNCTION student_notebook.utf16_units(value text) RETURNS integer
LANGUAGE sql IMMUTABLE STRICT SET search_path=pg_catalog,student_notebook AS $$
  SELECT coalesce(sum(CASE WHEN ascii(substr(value,i,1))>65535 THEN 2 ELSE 1 END),0)::integer FROM generate_series(1,length(value)) AS i;
$$;
CREATE FUNCTION student_notebook.text_valid(v jsonb,maximum integer,allow_blank boolean) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
DECLARE value text; whitespace text;
BEGIN
  IF jsonb_typeof(v) IS DISTINCT FROM 'string' THEN RETURN false; END IF;
  value:=v#>>'{}';
  IF length(value)>maximum OR student_notebook.utf16_units(value)>maximum THEN RETURN false; END IF;
  IF allow_blank THEN RETURN true; END IF;
  whitespace:=' '||chr(9)||chr(10)||chr(11)||chr(12)||chr(13)||chr(160)||chr(5760)||chr(8192)||chr(8193)||chr(8194)||chr(8195)||chr(8196)||chr(8197)||chr(8198)||chr(8199)||chr(8200)||chr(8201)||chr(8202)||chr(8232)||chr(8233)||chr(8239)||chr(8287)||chr(12288)||chr(65279);
  RETURN length(btrim(value,whitespace))>0;
END $$;
CREATE FUNCTION student_notebook.coordinate_valid(v jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
DECLARE n numeric;
BEGIN
  IF jsonb_typeof(v) IS DISTINCT FROM 'number' THEN RETURN false; END IF;
  n:=(v#>>'{}')::numeric;
  RETURN n BETWEEN 0 AND 1 AND n=round(n,4);
END $$;
CREATE FUNCTION student_notebook.limits_valid(l jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
BEGIN
  RETURN student_notebook.exact_keys(l,ARRAY['maxBodyBytes','textMaxUnits','strokeCount','pointsPerStroke','bookmarkCount','noteCount','concernCount'])
    AND coalesce(l->'maxBodyBytes' IN ('65536'::jsonb,'131072'::jsonb,'262144'::jsonb),false)
    AND coalesce(l->'textMaxUnits' IN ('128'::jsonb,'1000'::jsonb,'4000'::jsonb),false)
    AND coalesce(l->'strokeCount' IN ('8'::jsonb,'32'::jsonb,'64'::jsonb),false)
    AND coalesce(l->'pointsPerStroke' IN ('32'::jsonb,'128'::jsonb,'512'::jsonb),false)
    AND coalesce(l->'bookmarkCount' IN ('10'::jsonb,'50'::jsonb,'100'::jsonb),false)
    AND coalesce(l->'noteCount' IN ('10'::jsonb,'50'::jsonb,'100'::jsonb),false)
    AND coalesce(l->'concernCount' IN ('10'::jsonb,'50'::jsonb,'100'::jsonb),false);
END $$;
CREATE FUNCTION student_notebook.source_valid(s jsonb,c jsonb,p jsonb,targets jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
DECLARE asset jsonb; target jsonb; seen text[]:='{}'; identity text;
BEGIN
  IF NOT student_notebook.exact_keys(s,ARRAY['schoolId','learnerId','grade','schoolYear','notebookId'])
    OR NOT student_notebook.id_valid(s->'schoolId') OR NOT student_notebook.id_valid(s->'learnerId') OR NOT student_notebook.id_valid(s->'notebookId')
    OR s->>'schoolId' !~ '^(demo|synthetic)-' OR s->>'learnerId' !~ '^synthetic-' OR s->>'notebookId' !~ '^synthetic-'
    OR NOT coalesce(s->'grade' IN ('1'::jsonb,'2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb,'6'::jsonb,'7'::jsonb,'8'::jsonb),false)
    OR jsonb_typeof(s->'schoolYear') IS DISTINCT FROM 'string' OR s->>'schoolYear' !~ '^20[0-9]{2}-20[0-9]{2}$' THEN RETURN false; END IF;
  IF substr(s->>'schoolYear',6,4)::integer IS DISTINCT FROM substr(s->>'schoolYear',1,4)::integer+1 THEN RETURN false; END IF;
  asset:=c->'asset';
  IF NOT student_notebook.exact_keys(c,ARRAY['catalogId','revisionId','catalogSha256','asset'])
    OR NOT student_notebook.id_valid(c->'catalogId') OR NOT student_notebook.id_valid(c->'revisionId')
    OR NOT student_notebook.exact_keys(asset,ARRAY['assetId','revisionId','definitionSha256','purpose','classification','retentionClass','ownerId','stewardId'])
    OR NOT student_notebook.id_valid(asset->'assetId') OR NOT student_notebook.id_valid(asset->'revisionId')
    OR NOT student_notebook.id_valid(asset->'ownerId') OR NOT student_notebook.id_valid(asset->'stewardId')
    OR asset->>'purpose' IS DISTINCT FROM 'student_notebook' OR asset->>'classification' IS DISTINCT FROM 'sensitive_student_notebook'
    OR asset->>'retentionClass' IS DISTINCT FROM 'student-notebook-lifecycle'
    OR asset->>'definitionSha256' IS DISTINCT FROM student_notebook.hash_jsonb('asset',asset-'definitionSha256')
    OR c->>'catalogSha256' IS DISTINCT FROM student_notebook.hash_jsonb('catalog',c-'catalogSha256') THEN RETURN false; END IF;
  IF NOT student_notebook.exact_keys(p,ARRAY['policyId','policySha256','purpose','classification','retentionClass','catalogSha256','limits'])
    OR NOT student_notebook.id_valid(p->'policyId') OR p->>'purpose' IS DISTINCT FROM 'student_notebook'
    OR p->>'classification' IS DISTINCT FROM 'sensitive_student_notebook' OR p->>'retentionClass' IS DISTINCT FROM 'student-notebook-lifecycle'
    OR p->>'catalogSha256' IS DISTINCT FROM c->>'catalogSha256'
    OR NOT student_notebook.limits_valid(p->'limits') OR p->>'policySha256' IS DISTINCT FROM student_notebook.hash_jsonb('policy',p-'policySha256')
    OR student_notebook.array_size(targets) NOT BETWEEN 0 AND 200 THEN RETURN false; END IF;
  FOR target IN SELECT value FROM jsonb_array_elements(targets) LOOP
    IF NOT student_notebook.exact_keys(target,ARRAY['kind','id','grade','schoolYear']) OR NOT student_notebook.id_valid(target->'id')
      OR jsonb_typeof(target->'kind') IS DISTINCT FROM 'string' OR target->>'kind' NOT IN ('question','topic')
      OR target->'grade' IS DISTINCT FROM s->'grade' OR target->'schoolYear' IS DISTINCT FROM s->'schoolYear' THEN RETURN false; END IF;
    identity:=(target->>'kind')||':'||(target->>'id'); IF identity=ANY(seen) THEN RETURN false; END IF; seen:=array_append(seen,identity);
  END LOOP;
  RETURN true;
END $$;
CREATE FUNCTION student_notebook.governance_binding(s jsonb,c jsonb,p jsonb,targets jsonb) RETURNS jsonb
LANGUAGE sql IMMUTABLE STRICT SET search_path=pg_catalog,student_notebook AS $$
  SELECT jsonb_build_object('sourceKind','synthetic_fixture','purpose','student_notebook','classification',p->>'classification',
    'retentionClass',p->>'retentionClass','ownerId',c#>>'{asset,ownerId}','stewardId',c#>>'{asset,stewardId}',
    'policyId',p->>'policyId','policySha256',p->>'policySha256','catalogId',c->>'catalogId','catalogRevisionId',c->>'revisionId',
    'catalogSha256',c->>'catalogSha256','assetId',c#>>'{asset,assetId}','assetRevisionId',c#>>'{asset,revisionId}',
    'definitionSha256',c#>>'{asset,definitionSha256}',
    'targetCatalogSha256',student_notebook.hash_jsonb('targets',jsonb_build_object('scopeSha256',student_notebook.hash_jsonb('scope',s),'targets',targets)),
    'catalogState','declared_synthetic_reference','limits',p->'limits');
$$;
CREATE FUNCTION student_notebook.body_valid(b jsonb,s jsonb,l jsonb,targets jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog,student_notebook AS $$
DECLARE stroke jsonb; point jsonb; note jsonb; target jsonb; field text; kind text; identity text; seen text[];
BEGIN
  IF NOT student_notebook.exact_keys(b,ARRAY['text','strokes','bookmarks','notes','concerns'])
    OR NOT student_notebook.text_valid(b->'text',(l->>'textMaxUnits')::integer,true)
    OR student_notebook.array_size(b->'strokes') NOT BETWEEN 0 AND (l->>'strokeCount')::integer
    OR NOT student_notebook.exact_keys(b->'bookmarks',ARRAY['questions','topics'])
    OR student_notebook.array_size(b#>'{bookmarks,questions}')<0 OR student_notebook.array_size(b#>'{bookmarks,topics}')<0
    OR student_notebook.array_size(b#>'{bookmarks,questions}')+student_notebook.array_size(b#>'{bookmarks,topics}')>(l->>'bookmarkCount')::integer
    OR student_notebook.array_size(b->'notes') NOT BETWEEN 0 AND (l->>'noteCount')::integer
    OR student_notebook.array_size(b->'concerns') NOT BETWEEN 0 AND (l->>'concernCount')::integer THEN RETURN false; END IF;
  seen:='{}';
  FOR stroke IN SELECT value FROM jsonb_array_elements(b->'strokes') LOOP
    IF NOT student_notebook.exact_keys(stroke,ARRAY['id','color','width','points']) OR NOT student_notebook.id_valid(stroke->'id')
      OR jsonb_typeof(stroke->'color') IS DISTINCT FROM 'string' OR stroke->>'color' NOT IN ('#1c3532','#a44b35','#2f6377','#8b5e32','#6f527a')
      OR NOT coalesce(stroke->'width' IN ('2'::jsonb,'4'::jsonb,'6'::jsonb,'10'::jsonb),false)
      OR student_notebook.array_size(stroke->'points') NOT BETWEEN 1 AND (l->>'pointsPerStroke')::integer THEN RETURN false; END IF;
    identity:=stroke->>'id'; IF identity=ANY(seen) THEN RETURN false; END IF; seen:=array_append(seen,identity);
    FOR point IN SELECT value FROM jsonb_array_elements(stroke->'points') LOOP
      IF NOT student_notebook.exact_keys(point,ARRAY['x','y']) OR NOT student_notebook.coordinate_valid(point->'x') OR NOT student_notebook.coordinate_valid(point->'y') THEN RETURN false; END IF;
    END LOOP;
  END LOOP;
  FOREACH field IN ARRAY ARRAY['questions','topics'] LOOP
    kind:=CASE field WHEN 'questions' THEN 'question' ELSE 'topic' END; seen:='{}';
    FOR target IN SELECT value FROM jsonb_array_elements(b->'bookmarks'->field) LOOP
      IF NOT student_notebook.id_valid(target) OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(targets) AS t(value) WHERE t.value->>'kind'=kind AND t.value->'id'=target) THEN RETURN false; END IF;
      identity:=target#>>'{}'; IF identity=ANY(seen) THEN RETURN false; END IF; seen:=array_append(seen,identity);
    END LOOP;
  END LOOP;
  FOREACH field IN ARRAY ARRAY['notes','concerns'] LOOP
    seen:='{}';
    FOR note IN SELECT value FROM jsonb_array_elements(b->field) LOOP
      IF NOT student_notebook.exact_keys(note,ARRAY['id','text','grade','format']) OR NOT student_notebook.id_valid(note->'id')
        OR note->'grade' IS DISTINCT FROM s->'grade' OR note->>'format' IS DISTINCT FROM 'plain_text'
        OR NOT student_notebook.text_valid(note->'text',(l->>'textMaxUnits')::integer,false) THEN RETURN false; END IF;
      identity:=note->>'id'; IF identity=ANY(seen) THEN RETURN false; END IF; seen:=array_append(seen,identity);
    END LOOP;
  END LOOP;
  RETURN octet_length(student_notebook.canonical_jsonb(b))<=(l->>'maxBodyBytes')::integer;
END $$;

-- This map is seeded by the synthetic provisioning owner, never by an intent,
-- JWT claim, GUC, set_role input or caller-owned "trusted" boolean.
CREATE TABLE student_notebook.principal_scopes(db_role name PRIMARY KEY,scope_sha256 text NOT NULL CHECK(scope_sha256 ~ '^[a-f0-9]{64}$'));
CREATE FUNCTION student_notebook.allowed_scope(scope text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,student_notebook AS $$
  SELECT EXISTS(SELECT 1 FROM student_notebook.principal_scopes WHERE db_role=session_user AND scope_sha256=scope);
$$;
CREATE TABLE student_notebook.notebooks(
  scope_sha256 text PRIMARY KEY CHECK(scope_sha256 ~ '^[a-f0-9]{64}$'),scope_json jsonb NOT NULL,
  catalog_json jsonb NOT NULL,policy_json jsonb NOT NULL,targets_json jsonb NOT NULL,
  current_revision bigint NOT NULL DEFAULT 0 CHECK(current_revision BETWEEN 0 AND 9007199254740991),
  current_body_sha256 text,current_body jsonb,
  CHECK(student_notebook.source_valid(scope_json,catalog_json,policy_json,targets_json)),
  CHECK(scope_sha256=student_notebook.hash_jsonb('scope',scope_json)),
  CHECK((current_revision=0 AND current_body_sha256 IS NULL AND current_body IS NULL) OR
    (current_revision>0 AND current_body_sha256 IS NOT NULL AND current_body IS NOT NULL
      AND current_body_sha256=student_notebook.hash_jsonb('body',current_body)
      AND student_notebook.body_valid(current_body,scope_json,policy_json->'limits',targets_json)))
);
CREATE TABLE student_notebook.history(
  scope_sha256 text NOT NULL REFERENCES student_notebook.notebooks(scope_sha256),resulting_revision bigint NOT NULL CHECK(resulting_revision BETWEEN 1 AND 9007199254740991),
  mutation_id text NOT NULL,idempotency_key text NOT NULL,request_sha256 text NOT NULL CHECK(request_sha256 ~ '^[a-f0-9]{64}$'),
  body_sha256 text NOT NULL CHECK(body_sha256 ~ '^[a-f0-9]{64}$'),body_json jsonb NOT NULL,
  intent_sha256 text NOT NULL CHECK(intent_sha256 ~ '^[a-f0-9]{64}$'),intent_json jsonb NOT NULL,
  receipt_id text NOT NULL UNIQUE,receipt_sha256 text NOT NULL CHECK(receipt_sha256 ~ '^[a-f0-9]{64}$'),receipt_json jsonb NOT NULL,
  governance_binding jsonb NOT NULL,
  PRIMARY KEY(scope_sha256,resulting_revision),UNIQUE(scope_sha256,mutation_id),UNIQUE(scope_sha256,idempotency_key),
  CHECK(body_sha256=student_notebook.hash_jsonb('body',body_json)),
  CHECK(intent_sha256=student_notebook.hash_jsonb('intent',intent_json-'intentSha256')),
  CHECK(receipt_sha256=student_notebook.hash_jsonb('receipt',receipt_json-'receiptSha256')),
  CHECK(coalesce(governance_binding->>'purpose'='student_notebook',false))
);
ALTER TABLE student_notebook.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notebook.notebooks FORCE ROW LEVEL SECURITY;
CREATE POLICY own_notebook ON student_notebook.notebooks FOR ALL USING(student_notebook.allowed_scope(scope_sha256)) WITH CHECK(student_notebook.allowed_scope(scope_sha256));
ALTER TABLE student_notebook.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notebook.history FORCE ROW LEVEL SECURITY;
CREATE POLICY own_history ON student_notebook.history FOR ALL USING(student_notebook.allowed_scope(scope_sha256)) WITH CHECK(student_notebook.allowed_scope(scope_sha256));
CREATE FUNCTION student_notebook.immutable_history() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog,student_notebook AS $$
BEGIN RAISE EXCEPTION 'immutable_notebook_history' USING ERRCODE='55000'; END $$;
CREATE TRIGGER notebook_history_immutable BEFORE UPDATE OR DELETE ON student_notebook.history FOR EACH ROW EXECUTE FUNCTION student_notebook.immutable_history();
CREATE TRIGGER notebook_history_no_truncate BEFORE TRUNCATE ON student_notebook.history FOR EACH STATEMENT EXECUTE FUNCTION student_notebook.immutable_history();

CREATE FUNCTION student_notebook.commit_intent(intent jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,student_notebook AS $$
DECLARE n student_notebook.notebooks%ROWTYPE; old student_notebook.history%ROWTYPE;
  binding jsonb; body_hash text; request_hash text; receipt jsonb; receipt_hash text; receipt_id text; expected bigint; next_revision bigint;
BEGIN
  -- Check outer bytes and closed schema before recursive canonical hashing.
  IF intent IS NULL OR octet_length(intent::text)>524288 OR NOT student_notebook.exact_keys(intent,ARRAY[
    'contractVersion','scope','scopeSha256','mutationId','idempotencyKey','expectedRevision','nextRevision','priorBodySha256',
    'body','bodySha256','requestSha256','governanceBinding','historicalReceipt','intentSha256'])
    OR intent->>'contractVersion' IS DISTINCT FROM '1.0.0' OR NOT student_notebook.hash_valid(intent->'scopeSha256')
    OR NOT student_notebook.id_valid(intent->'mutationId') OR NOT student_notebook.id_valid(intent->'idempotencyKey')
    OR NOT student_notebook.revision_valid(intent->'expectedRevision') OR NOT student_notebook.revision_valid(intent->'nextRevision')
    OR NOT student_notebook.hash_valid(intent->'bodySha256') OR NOT student_notebook.hash_valid(intent->'requestSha256') OR NOT student_notebook.hash_valid(intent->'intentSha256')
    OR (intent->'priorBodySha256' IS DISTINCT FROM 'null'::jsonb AND NOT student_notebook.hash_valid(intent->'priorBodySha256')) THEN
    RAISE EXCEPTION 'invalid_notebook_intent' USING ERRCODE='22023';
  END IF;
  expected:=(intent->>'expectedRevision')::bigint; next_revision:=(intent->>'nextRevision')::bigint;
  IF expected>=9007199254740991 OR next_revision IS DISTINCT FROM expected+1 THEN RAISE EXCEPTION 'invalid_notebook_revision' USING ERRCODE='22023'; END IF;
  -- FORCE RLS consults fixed session_user even within SECURITY DEFINER.
  SELECT * INTO n FROM student_notebook.notebooks WHERE scope_sha256=intent->>'scopeSha256' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'scope_denied' USING ERRCODE='42501'; END IF;
  binding:=student_notebook.governance_binding(n.scope_json,n.catalog_json,n.policy_json,n.targets_json);
  IF intent->'scope' IS DISTINCT FROM n.scope_json OR intent->'governanceBinding' IS DISTINCT FROM binding THEN
    RAISE EXCEPTION 'notebook_source_binding_mismatch' USING ERRCODE='22023';
  END IF;
  IF intent->'historicalReceipt' IS DISTINCT FROM 'null'::jsonb AND
    (NOT student_notebook.exact_keys(intent->'historicalReceipt',ARRAY['receiptId','receiptSha256'])
      OR NOT student_notebook.id_valid(intent#>'{historicalReceipt,receiptId}') OR NOT student_notebook.hash_valid(intent#>'{historicalReceipt,receiptSha256}')) THEN
    RAISE EXCEPTION 'invalid_notebook_historical_receipt' USING ERRCODE='22023';
  END IF;
  IF NOT student_notebook.body_valid(intent->'body',n.scope_json,n.policy_json->'limits',n.targets_json) THEN
    RAISE EXCEPTION 'invalid_notebook_body_or_coordinate_profile' USING ERRCODE='22023';
  END IF;
  body_hash:=student_notebook.hash_jsonb('body',intent->'body');
  request_hash:=student_notebook.hash_jsonb('request',jsonb_build_object('scopeSha256',n.scope_sha256,'contractVersion','1.0.0',
    'mutationId',intent->>'mutationId','idempotencyKey',intent->>'idempotencyKey','expectedRevision',expected,'body',intent->'body'));
  IF intent->>'bodySha256' IS DISTINCT FROM body_hash OR intent->>'requestSha256' IS DISTINCT FROM request_hash
    OR intent->>'intentSha256' IS DISTINCT FROM student_notebook.hash_jsonb('intent',intent-'intentSha256') THEN
    RAISE EXCEPTION 'notebook_hash_mismatch' USING ERRCODE='22023';
  END IF;
  SELECT * INTO old FROM student_notebook.history WHERE scope_sha256=n.scope_sha256
    AND (idempotency_key=intent->>'idempotencyKey' OR mutation_id=intent->>'mutationId');
  IF FOUND THEN
    IF old.request_sha256 IS DISTINCT FROM request_hash OR old.body_sha256 IS DISTINCT FROM body_hash
      OR old.idempotency_key IS DISTINCT FROM intent->>'idempotencyKey' OR old.mutation_id IS DISTINCT FROM intent->>'mutationId'
      OR old.resulting_revision IS DISTINCT FROM next_revision THEN RAISE EXCEPTION 'notebook_idempotency_conflict' USING ERRCODE='23505'; END IF;
    IF intent->'historicalReceipt' IS DISTINCT FROM 'null'::jsonb AND intent->'historicalReceipt' IS DISTINCT FROM
      jsonb_build_object('receiptId',old.receipt_id,'receiptSha256',old.receipt_sha256) THEN RAISE EXCEPTION 'notebook_historical_receipt_mismatch' USING ERRCODE='22023'; END IF;
    RETURN jsonb_build_object('outcome','idempotent_replay','receipt',old.receipt_json,
      'head',jsonb_build_object('revision',n.current_revision,'bodySha256',n.current_body_sha256),'syntheticOnly',true,'productionReady',false);
  END IF;
  IF intent->'historicalReceipt' IS DISTINCT FROM 'null'::jsonb THEN RAISE EXCEPTION 'notebook_historical_receipt_missing' USING ERRCODE='22023'; END IF;
  IF expected IS DISTINCT FROM n.current_revision OR intent->>'priorBodySha256' IS DISTINCT FROM n.current_body_sha256 THEN
    RAISE EXCEPTION 'notebook_revision_conflict' USING ERRCODE='40001';
  END IF;
  receipt_id:='synthetic-receipt-'||substr(request_hash,1,32);
  receipt:=jsonb_build_object('receiptId',receipt_id,'mutationId',intent->>'mutationId','idempotencyKey',intent->>'idempotencyKey',
    'scopeSha256',n.scope_sha256,'requestSha256',request_hash,'bodySha256',body_hash,'expectedRevision',expected,'resultingRevision',next_revision,
    'policySha256',n.policy_json->>'policySha256','catalogSha256',n.catalog_json->>'catalogSha256');
  receipt_hash:=student_notebook.hash_jsonb('receipt',receipt);receipt:=receipt||jsonb_build_object('receiptSha256',receipt_hash);
  INSERT INTO student_notebook.history(scope_sha256,resulting_revision,mutation_id,idempotency_key,request_sha256,body_sha256,body_json,
    intent_sha256,intent_json,receipt_id,receipt_sha256,receipt_json,governance_binding)
    VALUES(n.scope_sha256,next_revision,intent->>'mutationId',intent->>'idempotencyKey',request_hash,body_hash,intent->'body',
      intent->>'intentSha256',intent,receipt_id,receipt_hash,receipt,binding);
  UPDATE student_notebook.notebooks SET current_revision=next_revision,current_body_sha256=body_hash,current_body=intent->'body' WHERE scope_sha256=n.scope_sha256;
  RETURN jsonb_build_object('outcome','accepted','receipt',receipt,'head',jsonb_build_object('revision',next_revision,'bodySha256',body_hash),'syntheticOnly',true,'productionReady',false);
END $$;

CREATE FUNCTION student_notebook.read_current(scope text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog,student_notebook AS $$
DECLARE answer jsonb;
BEGIN
  -- One statement joins the head and its immutable receipt in one snapshot.
  SELECT jsonb_build_object('scope',n.scope_json,'scopeSha256',n.scope_sha256,'revision',n.current_revision,'body',n.current_body,
    'bodySha256',n.current_body_sha256,'receipt',h.receipt_json,'governanceBinding',student_notebook.governance_binding(n.scope_json,n.catalog_json,n.policy_json,n.targets_json),
    'syntheticOnly',true,'productionReady',false) INTO answer FROM student_notebook.notebooks AS n
    LEFT JOIN student_notebook.history AS h ON h.scope_sha256=n.scope_sha256 AND h.resulting_revision=n.current_revision WHERE n.scope_sha256=scope;
  IF answer IS NULL THEN RAISE EXCEPTION 'scope_denied' USING ERRCODE='42501'; END IF; RETURN answer;
END $$;
CREATE FUNCTION student_notebook.read_revision(scope text,revision bigint) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog,student_notebook AS $$
DECLARE answer jsonb;
BEGIN
  IF NOT student_notebook.allowed_scope(scope) THEN RAISE EXCEPTION 'scope_denied' USING ERRCODE='42501'; END IF;
  IF revision IS NULL OR revision NOT BETWEEN 1 AND 9007199254740991 THEN RAISE EXCEPTION 'invalid_notebook_revision' USING ERRCODE='22023'; END IF;
  SELECT jsonb_build_object('scope',n.scope_json,'scopeSha256',h.scope_sha256,'revision',h.resulting_revision,'body',h.body_json,
    'bodySha256',h.body_sha256,'receipt',h.receipt_json,'governanceBinding',h.governance_binding,'syntheticOnly',true,'productionReady',false)
    INTO answer FROM student_notebook.history AS h JOIN student_notebook.notebooks AS n ON n.scope_sha256=h.scope_sha256
    WHERE h.scope_sha256=scope AND h.resulting_revision=revision;
  IF answer IS NULL THEN RAISE EXCEPTION 'notebook_revision_missing' USING ERRCODE='22023'; END IF;RETURN answer;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA student_notebook FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA student_notebook FROM PUBLIC;
GRANT USAGE ON SCHEMA student_notebook TO synthetic_notebook_school_a_app,synthetic_notebook_school_b_app,synthetic_notebook_no_scope_app;
GRANT SELECT ON student_notebook.notebooks,student_notebook.history TO synthetic_notebook_school_a_app,synthetic_notebook_school_b_app,synthetic_notebook_no_scope_app;
GRANT EXECUTE ON FUNCTION student_notebook.allowed_scope(text),student_notebook.commit_intent(jsonb),student_notebook.read_current(text),student_notebook.read_revision(text,bigint)
  TO synthetic_notebook_school_a_app,synthetic_notebook_school_b_app,synthetic_notebook_no_scope_app;
RESET ROLE;
COMMIT;
