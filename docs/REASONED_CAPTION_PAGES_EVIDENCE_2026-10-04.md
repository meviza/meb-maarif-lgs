# Bounded current-cue caption pages — technical evidence

Observed 2026-10-04. This is a deterministic, pure, editor-only caption-presentation slice. It addresses dense caption paragraphs without shortening the canonical explanation. It is not a complete solution video, TTS preparation, word alignment, a student authorization gate, geometry-fit acceptance or premium educational-quality acceptance.

Only three new owned files were created: `packages/media/reasoned_caption_pages.mjs`, `test/reasoned_caption_pages.test.mjs` and this evidence file. Existing renderer, source/trace/job modules, CLI, HTML/CSS, SQL and prior evidence were not edited. No Git, network/provider, Docker, downloads, model calls or student data were used. Root owns any later CLI/UI wiring and actual screen/raster evidence.

## API and plain-text consumer contract

```js
const captions = createReasonedCaptionPages(liveScenePlan, {
  cueIndex: 1, progress: 1, reveal: false,
});
// captions.pages[pageIndex].lines contains one or two literal strings.
// Insert each line via textContent, never innerHTML or SVG/HTML interpolation.
```

Before accessing the caller's plan or options, this API invokes the existing `renderReasonedSceneFrame`. Therefore original locally branded scene-plan trust, immutable source/trace/job bindings and closed bounded frame options are rechecked. Cloned, serialized, proxy-wrapped or caller-rehashed plans do not become authority. The API accepts at most two arguments; options remain only `cueIndex`, `progress`, `reveal`, with the existing defaults `0`, `0`, `false`. A caller cannot add a custom caption, override a source digest, raise a limit or supply a future answer.

The result has no SVG, HTML, raw asset or all-cues payload. Its principal fields are:

| Field | Meaning |
| --- | --- |
| `pages[].lines` | One or two literal plain-text strings; at most 62 UTF-16 code units per line |
| `pages[].lineSpans` | Exact `start`, `end`, `separatorAfter` positions in `displayText` |
| `fullTranscript`, `fullTranscriptSha256` | Exact selected canonical cue transcript/hash, or both null while its protected response is locked |
| `displayText` | Full current cue text, or a safe locked-response placeholder |
| `cueId`, `cueIndex`, `kind`, `progress`, `revealRequested`, `resultVisible` | The already validated selected frame state |
| `source`, `trace`, `job` | Existing ID/content digest refs, not new approval evidence |
| `geometrySha256`, `scenePlanSha256`, `frameSha256`, `frameSvgSha256` | Existing geometry/plan/frame-content/SVG digests |
| `paging`, `pagingSha256`, `contentSha256` | Paging policy/current pages digest and complete presentation DTO digest |
| `contentFormat` | `plain_text_textContent_only` |
| `serializedAuthority` | `none` |

`pagingSha256` covers `{ paging, pages }`; the full DTO content digest covers every presentation field. Outputs are deeply immutable and deterministic, including exact duplicate calls. These are integrity declarations, not signed authorization or evidence that any audio, video or lesson has been accepted.

## Losslessness and bounded atoms

Fixed limits are **62 UTF-16 code units per line**, **two lines per page**, **32 pages**, and **4096 UTF-16 code units of input text**. These are bounded character measurements, not actual rendered glyph/pixel widths. Browser font metrics, screen density, zoom, Turkish typography and the diagram's usable area still need actual UI review.

Words are never sliced, hyphenated, title-cased, ellipsized, summarized or truncated. Supported numeric atoms attach their unit and supported numeric operator chains: signed integers/decimals/rationals; `+`, `−`, `-`, `×`, `÷`, `=`; units `cm`, `cm²`, `m`, `m²`, `santimetre`, `santimetrekare`, `metre`, `metrekare`, `adet`. For example `3 + 3 + 3 + 3 = 12 cm.` remains one atom, as does `12 santimetre`. This is a small presentation grammar for existing canonical cue text, not a general symbolic-math parser or proof of new mathematical semantics. Other words remain indivisible whitespace-delimited words. A single word or supported math atom longer than 62 units fails closed with `reasoned_caption_token_too_long`; there is no overflow/truncation fallback.

Internal source whitespace is retained through exact source spans and `separatorAfter`. Reconstructing each `line + separatorAfter` in page/line order reproduces `displayText` byte-for-byte. The complete allowed canonical narration is separately preserved in `fullTranscript`; inserting visual line/page breaks does not alter that narration. Leading/trailing padding, controls/newlines/tabs, malformed UTF-16, empty text and non-string objects are rejected by the pure text utility. Page-budget excess fails closed rather than returning a partial explanation.

The additional exported `paginateReasonedCaptionText(text)` is a small non-authoritative pure utility for literal text/boundary tests. It carries `sourceAuthority: none` and no source provenance. It does not grant scene-plan trust, and its result cannot be submitted as a live plan. Literal markup-like input remains literal data: the utility does not escape it into a new markup representation, strip it or execute it. Consumers must use `textContent`; inserting these strings into a markup sink would violate this API's contract.

## Reveal, transfer and narration boundary

Protected `result`, `check_answer`, `summary`, `transfer_answer` cue transcripts are emitted only when the existing renderer says `resultVisible=true` (explicit `reveal=true` and `progress=1`). Otherwise `fullTranscript` and its hash are null, `transcriptVisibility=protected_response_locked`, and pages contain only a safe placeholder. The output never retains the protected response in another raw field. Unprotected goals/evidence/plans/reasons/check prompts retain the selected cue's entire canonical text even though `resultVisible=false` for those non-result cues. Future cue text and source answer-bearing SVG assets are not emitted.

Selecting/revealing a cue remains an editor control, not enforced learner progression, authentication or child authorization. Serialized pages are not a capability. Actual student-facing navigation and permitted answer access need independent application policy and human review.

Transfer prompts/answers retain `sourceDiagramProof=false`, `representationStatus=unsupported_new_geometry_pending`, and `transfer_geometry_not_in_canonical_source` pending. Pagination cannot prove a new square, changed opening or other transfer shape. No word-boundary timestamps, caption/audio boundary times, durations, TTS requests or synchronizing data are produced. Full narration is not sacrificed to a short caption, but its audio has not been generated or aligned.

## Watched TDD and fresh verification

The test-driven-development skill, its writing-good-tests reference and verification-before-completion skill were read completely before implementation. Systematic debugging was read when the spoken-unit boundary issue was reproduced. Real source/trace/job/scene builders are used; expected line/atom boundaries are literal manually derived fixtures, not the paginator's own helpers.

1. Tests were created first. `node --test test/reasoned_caption_pages.test.mjs` exited 1: **0 PASS / 20 FAIL**, from expected missing caption/paginator API assertions; the absent module was handled without a loader/syntax error.
2. Minimal implementation produced **20/20 PASS**.
3. A separate boundary probe found that a 59-character word followed by `12 santimetre` split the number from its spoken unit. A new real regression ran **20 PASS / 1 FAIL**, showing the incorrect line ending in `12`. Extending the unit-atom vocabulary to the existing job narration's spoken units closed that failure; final caption tests are **21/21 PASS**.
4. The fresh seven-file related regression below passed **112/112**, zero failures/skips. Syntax check also exited zero.

```sh
node --test test/reasoned_caption_pages.test.mjs test/reasoned_scene_renderer.test.mjs test/reasoned_geometry_resolver.test.mjs test/reasoned_media_job.test.mjs test/reasoned_math_adapter.test.mjs test/reasoned_concept_lesson.test.mjs test/reasoned_teaching_trace.test.mjs
node --check packages/media/reasoned_caption_pages.mjs
```

Tests cover all eight canonical source types and every canonical cue, exact full-text reconstruction, dense garden evidence, symbolic/narrated number-unit atoms, lowercase/capitalization and repeated spaces, exact 62/63-unit word bounds, overlong math atoms, fixed text/page budgets, all protected cue gates, no future intermediates/assets, transfer fallback, literal textContent-only data, inert style non-egress, clone/rehash/proxy authority rejection, option hooks/keys/bounds, immutable digests and closed approvals.

An additional in-memory matrix tested widths/heights `1,2,3,4,6,50,100` across six rectangle families; fence gates at `1` and full width where distinct; fixed garden and concept. Three canonical error-diagnosis premises where area numerically equals perimeter were skipped as rejected by the existing builder. The matrix checked **335 canonical sources, 29,244 caption outputs and 42,061 pages**. All outputs reconstructed exact `displayText`, stayed within two lines/62 units and kept input plans unchanged. The maximum actual canonical page count was **five**. It checked **10,510 locked outputs** with no protected transcript and **4,020 text-only transfer outputs**. Exact **32 pages** were accepted; the 33-page fixture in unit tests was rejected. Another **20 hostile probes rejected 20/20**, including primitive/string-object coercion, malformed UTF-16, custom fields/limits/source hashes, extra argument expansion and plan-options objects; **hooks executed: 0**.

## Original frozen hashes and remaining acceptance debt

| Artifact | SHA-256 |
| --- | --- |
| `packages/media/reasoned_caption_pages.mjs` | `162ceff732cf0c5f6871d8265bcc3120e44d622dbf098e3b17bd8091ed48364b` |
| `test/reasoned_caption_pages.test.mjs` | `29ae50e49879427470e509c417636125af63cd4011f5655a6d3d05a4363c9cf6` |
| Unchanged existing renderer | `503f92d8751ec72a099f37c2a0563fce941e587862abd9b982e1328bf743c5cf` |
| Unchanged existing renderer tests | `c39c8b270f0271256db5c23d661cb426c889883f7e05809981cf4807bb6acd7e` |

`teacherApproved`, `publicationReady`, `learnerReady`, `productionReady`, `audioGenerated`, `ttsPrepared`, `videoRendered`, `captionAudioSyncVerified`, `wordPenAlignmentVerified`, `wordBoundaryTimestampsProvided` are false. Expert/curriculum/rights review are pending; privacy inspection is not performed. Existing provider/style hashes are provenance, not provider use; provider calls and source-file reads are zero.

This local technical proof does not close dense-garden pedagogy, geometry fit, visible UI page navigation, actual textContent wiring, accessibility/screen-reader acceptance, learner safety, full explanation voice/video, premium quality or publication. It isolates caption presentation while preserving full current-cue narration and explicit pending gates. Root's later independent UI/audit evidence must be reported separately.

## Root factory binding and independent correction — 00:35 Türkiye time

The normal `tools/content_factory_pilot.mjs` now emits `captionPreparation.questionCuePages` and `conceptCuePages`, one caption packet per current cue of every retained scene plan. Defaults are `progress: 1, reveal: false`; protected response transcripts and their hashes remain null. The complete audit JSON remains **editor-only**: other existing trace/plan fields contain answer material. This sidecar does not turn that report into a student-safe delivery package. HTML/CSS and visible page navigation remain unchanged.

The two new CLI tests ran **0 PASS / 2 FAIL** before wiring, then passed. Root saved one- and 100-candidate private review packages and independently rebuilt every scene/caption packet through the current live builders; all packets matched exactly, with exact source-span reconstruction.

| Candidates | Retained question drafts + lesson | Cues / pages | Locked response cues | Audit JSON bytes / SHA-256 |
| --- | --- | --- | --- | --- |
| 1 | 1 + 1 | 40 / 55 | 18 | 531406 / `ae3a52c5ca535d9bc62c1f060bc0b0c5520949d85ca87104253e83c335e27578` |
| 100 | 12 + 1 | 194 / 277 | 84 | 2275034 / `c4de38d90a6cf16d577a9d1b9386e603fd981ab88b4be8cdcebdf5286b748d5b` |

Independent audit found one small presentation-grammar defect: unary `+` was omitted from the numeric atom even though signed numbers were declared supported. At a full-line boundary, `+3` separated from `cm`. Root reproduced this with integer, decimal and fraction fixtures: the new regression failed before the numeric sign class was corrected. The combined caption/notebook regression first ran **39 PASS / 2 FAIL** (the other failure was the separate revoked-root notebook bug); after minimal independent fixes, caption + notebook + CLI ran **43/43 PASS**.

Independent recheck matched the new hashes and passed another **186 probes**: 180 signed number/unit boundaries, five operator chains and one oversized positive-atom rejection. The one/100 canonical outputs retained exactly the same byte SHA values; 102 locked response cues disclosed no protected transcript. All 234 packets reconstructed their full permitted display text. Serialized/rehash plan or packet probes (249 in the initial independent audit) did not gain authority. No current reproducible P1/P2 remained in the audited scope.

Current module SHA: `bb5a440a08b8c2f3e8926cef04f8f9bbbbae62b2a715d78a2a0b8dc702d1f359`; current caption test SHA: `24b17ac6544fcaf28a878311af86b1a59ad82fc7e0dc90464dbecd436c2d054d`. The earlier hashes/test counts above are historical, before root's independent fix. Root's fresh full suite passed **783/783, fail 0, skip 0**, with existing trusted Sharp and real-media opt-in; ad-hoc probes are not added to that test total. No new scene renderer bytes, raster/video, audio, provider call, student data, curriculum/rights acceptance or learner UI was produced by this binding.
