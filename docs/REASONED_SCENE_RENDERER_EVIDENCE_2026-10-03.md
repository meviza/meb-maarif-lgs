# Source-bound reasoned SVG scene renderer — bounded technical evidence

Observed 2026-10-03; narrow inline accessible-name correction reverified 2026-10-04. This slice is a pure editor-only SVG scene/frame API, not a complete solution video, a human handwriting renderer, a learner product, or an approval gate. Only the new renderer, its test file and this evidence file were edited. No existing modules/CLI, Git operations, network/provider calls, rasterizer, Docker, paid SDK or student data were used by this slice.

## API and trust boundary

```js
const plan = createReasonedScenePlan({ source, trace, job });
const frame = renderReasonedSceneFrame(plan, {
  cueIndex: 3, progress: 0.5, reveal: false,
});
// frame.svg is an inert SVG string. plan.cues is an array.
```

`createReasonedScenePlan` calls the existing `resolveReasonedMediaGeometry` afresh with the caller's original trace and job. Its root WeakSet brand audits, complete canonical source regeneration, exact source/trace/job matching, anchor matching and bounded inert DTO inspection remain mandatory. A serialized binding is not input authority. The new plan is deeply immutable and locally branded; even byte-equal JSON round trips, caller-rehashed plans and proxy wrappers cannot render.

Frame options have only the own keys `cueIndex`, `progress` and `reveal`, with defaults `0`, `0`, `false`. The cue index must be an in-range integer; progress must be a finite number in `[0,1]`; reveal must be boolean. No coercion or clamping is performed. Options are a plain/null-prototype object with data descriptors only. Unknown fields, symbols, accessors, functions, foreign objects, cycles, proxies and revoked proxies reject without caller hook execution. There is no arbitrary caption, markup, image URL, font URL, event, callback or network option.

## Source assets are not the visible frame

The plan contains unchanged original SVG bytes as `plan.assets[].svg`, with their byte hashes and source view boxes. This is an editor artifact containing all cues, geometry, source metadata and answer-bearing assets. It must not be presented as a hidden-answer student payload.

Canonical concept-lesson source SVGs already contain answers in descriptions and comparison text. Consequently **no complete source SVG is embedded into a frame**. Frames use a deterministic derived safe layer at the original SVG coordinates, with only given labels, geometric bounds/openings and verified concept unit grids. `frameRepresentation` is `derived_safe_geometry_not_original_svg_embedding`. `sourceAssetSvgSha256` and `safeLayerSha256` deliberately identify different things. Preserving asset bytes does not mean rendering original artwork unchanged; font, color, label placement, background and caption are safe derived presentation choices. Unit-grid spacing is retained only for the canonical concept instances where the resolver has verified it. Unscaled rectangle/garden illustrations do not gain an inferred physical scale or invented unit grid.

Source bindings retained in plan/frame manifests are source, trace and job ID/digest refs plus `geometrySha256`, `scenePlanSha256`, `svgSha256` and a complete frame `contentSha256`. Safe-layer accessibility title/description uses the same current safe caption, never original source alt/description or freeform style text. XML text escapes ampersands, angle brackets, quotes and apostrophes. Generic local `sans-serif` is the sole font request; no external resource references are emitted.

## Scope, cue meanings and reveal

Supported canonical sources are the six rectangle families (`perimeter`, `area`, `width_from_area`, `width_from_perimeter`, `error_diagnosis`, `fence_gap`), the fixed `garden_two_rows`, and the canonical perimeter/area concept lesson. Goals, evidence, plans, reasons, results, check prompts/answers and summaries retain their canonical cue IDs and display-anchor IDs. The frame displays the current cue only; it does not spool future result text or all editor cues into the SVG.

Width/height strokes, perimeter boundary paths, actual gap segments and open boundary paths use resolver-supplied SVG bounds. Area results use an interior underline, not a perimeter outline. Repeated concept edge operands can target opposite edges of the same verified source rectangle. Progressive length is computed along these paths; at progress zero there is no pen/stroke, at an intermediate progress the final segment is interpolated, and at one the path is complete. The small nib is a **programmatic highlight pen**, not a human hand, number-writing animation or handwriting authenticity claim.

`result`, `check_answer`, `summary` and `transfer_answer` require **both** `reveal: true` and `progress: 1` before their response text, compact numeric equation or result highlight appears. Otherwise `resultVisible` is false, the stage is `locked_for_reveal`, and response text/paths are absent from visible SVG and accessible names. Givens such as 6/4 cm, or 20 cm/24 cm² explicitly given in inverse questions, are allowed. Computed inverse width and the garden's computed long side remain `?` in the base layer. Future intermediate results are not relabeled as givens. Revealed check/summary numeric annotation is bound to its existing result anchor.

The reveal option is an editor rendering control, not authorization, enforced lesson navigation or student-access protection. An editor can select any cue and explicitly reveal it. A learner UI still needs independent sequencing, authorization and teacher review.

Logical definitions, ratio/partition/repetition and comparison retain semantic review pending. A repeated-wire result highlights the existing source open path, with `logical_repeat_representation_review`; it does not invent a second physical wire or claim that the visual proves the full teaching meaning. Unsupported transfer geometry is a text-only fallback with `sourceVisualId: null`, `sourceDiagramProof: false`, no paths/pen, and `transfer_geometry_not_in_canonical_source` pending. Its answer is also reveal-gated. Original-source diagram provenance is not claimed for a new square or changed shape.

## Watched RED → GREEN

The test-driven-development skill and its `writing-good-tests.md` were read completely before implementation. The verification-before-completion skill was also read completely. Tests use real source/trace/job builders and manual coordinate/length expectations, not mocks or renderer-derived expectations.

1. Created the test file first. `node --test test/reasoned_scene_renderer.test.mjs` exited 1: **0 pass, 24 fail**, from the expected missing `createReasonedScenePlan` function assertion (`scene plan not implemented`). Dynamic import handled an absent module; there was no loader/syntax failure masking the missing behavior.
2. Added the minimal pure renderer. The same command exited 0: **24 pass, 0 fail**.
3. Fresh related regression exited 0: **90 pass, 0 fail**, with the six files below.

```sh
node --test test/reasoned_geometry_resolver.test.mjs test/reasoned_scene_renderer.test.mjs test/reasoned_media_job.test.mjs test/reasoned_math_adapter.test.mjs test/reasoned_concept_lesson.test.mjs test/reasoned_teaching_trace.test.mjs
node --check packages/media/reasoned_scene_renderer.mjs
```

For the 6×4 rectangle reason cue, the hand-derived top/right highlight path has length `400 + 165 = 565` SVG user units. Progress `0 / 0.5 / 1` yields drawn lengths `0 / 282.5 / 565`, with pen positions absent / `(347.5,85)` / `(465,250)`. These positions do not arise from assuming that 6 cm maps to 400 pixels on a physically scaled shape.

Tests cover each canonical source, unchanged input/assets, digest bindings, progressive paths, actual fence/garden gaps, protected cue reveal, answer-bearing concept source descriptions, inverse-side givens, area interior representation, logical-repeat pending, transfer fallback, markup/style non-egress, deep freeze, rehashed/serialized plans, source tamper/fake approval, swapped/serialized root artifacts, exact option keys and zero-hook hostile DTOs.

An additional in-memory boundary matrix (no file/network writes) tested widths/heights `1,2,3,4,6,50,100` across six families, gate widths `1` and the full width where distinct, plus garden and concept. It produced **335 canonical source cases, 29,244 frames and 43,131 emitted highlight points**, all finite and within the relevant original source view box. It checked **10,510 locked protected frames** with no canonical response transcript/path/pen, **4,020 text-only transfer frames**, all closed approval flags, no external-resource markup, and unchanged input JSON. Three error-diagnosis cases where area numerically equals perimeter were intentionally skipped because the canonical builder rejects the mathematically indistinguishable premise. A separate **20 hostile options/forged-plan probes rejected 20/20**, with **0 getter/proxy/coercion hooks executed**.

## Inline accessible-name correction — 2026-10-04

Independent audit identified a document-global IDREF risk: each frame originally emitted `scene-title`/`scene-desc` IDs and `aria-labelledby` references. Joining a revealed and a locked frame reproduced two of each ID; the first title contained the revealed answer while the locked frame referred to the same IDs. This markup could resolve an accessible name against a sibling when used inline in one HTML document. A cue-derived namespace would still collide when an identical frame was embedded twice, so the narrow correction removes the IDREF dependency entirely.

The new real-frame regression first ran **24 PASS / 1 expected FAIL**, failing specifically on the intrinsic output's document-global accessible-name IDREF. The minimal correction is `role="img" aria-label="current escaped safe caption"`, with ID-free local `<title>` and `<desc>` containing the same safe caption. It introduces no new render options or random IDs. The test joins revealed, locked and duplicate locked SVGs; checks self-contained own labels, matching local title/description, absence of global IDs/IDREFs, no revealed response in locked labels, and deterministic duplicate SVG/frame hashes. It then ran **25/25 PASS**. Fresh six-file related regression after the correction ran **91/91 PASS**.

This is intrinsic SVG markup behavior, not a real browser accessibility-tree or screen-reader acceptance result. Inline and standalone SVG consumers can use their own current caption without looking up document-global IDs. An external `<img>`/object host still requires host-context accessible-name handling (for example its own appropriate alt text); this slice does not claim that an embedded file's ARIA is propagated by every browser/assistive-technology combination. Supported browser/AT combinations, description announcement, focus behavior, standalone viewing and actual screen-reader testing remain pending. The original editor assets remain byte-equal and may contain their original IDs; they are not embedded into the derived frame. Source geometry, reveal gating and highlight motion were not changed. Frame SVG/digests changed; root raster/motion evidence must be regenerated against the new bytes rather than reusing an old receipt.

## Frozen code hashes and explicit non-claims

| Artifact | SHA-256 |
| --- | --- |
| `packages/media/reasoned_scene_renderer.mjs` | `503f92d8751ec72a099f37c2a0563fce941e587862abd9b982e1328bf743c5cf` |
| `test/reasoned_scene_renderer.test.mjs` | `c39c8b270f0271256db5c23d661cb426c889883f7e05809981cf4807bb6acd7e` |
| Unchanged existing resolver | `dbfe269e8e08f577d740cc01ffccbb2e552ae0bd72599cec95992197a8e76aa2` |
| Unchanged existing resolver tests | `aa66ba47d8bf328ad3cebcf3d41a83512c79b7a445611cea6fdd3658a052a85d` |

These passing tests establish this bounded pure renderer behavior. They do not establish raster appearance, actual playable motion/video, TTS, audio attachment, word/pen alignment, natural handwriting, new transfer diagram correctness, lesson semantic/expert quality, curriculum coverage, rights, accessibility acceptance, student safety, publication or production. Root may separately collect a short silent raster/motion witness; that is a different limited technical observation, not evidence in this implementation slice.

`videoRendered`, `audioGenerated`, `wordPenAlignmentVerified`, `teacherApproved`, `publicationReady`, `learnerReady` and `productionReady` are false. Expert/curriculum/rights review remain pending; privacy inspection is not performed. `svgScenePrepared: true` means only that this pure SVG DTO has been prepared.

## Root integration and independent final audit

Root's normal-CLI scene integration added two tests: missing `scenePreparation` gave the expected 0/2 RED, then GREEN. Fresh one/hundred packages retain 1/12 drafts respectively, plus one concept lesson; hundred keeps 88 diversity rejects. The independent reviewer replayed all 15 saved plans from canonical live sources/traces/jobs and compared all 13 saved source SVGs byte-for-byte (with the CLI's newline). Fifteen serialized plans and 120 hostile option probes rejected with zero getter/proxy/coercion hooks.

Final six-file regression after the IDREF correction: **91/91**. Independent read-only matrix: **90 sources, 18,928 frames, 25,517 finite/bounded points**; 7,618 locked response transcripts absent, 2,520 text-only transfer frames and 2,704 deterministic duplicate-inline pairs. Current own aria-label/title/desc matches each safe caption; global ID/IDREF count zero. No reproducible open P1/P2 remained in that bounded scope; browser/screen-reader/pedagogic acceptance was not inferred.

Root independently reran the full suite with real-media opt-in: **740/740, fail 0, skip 0**. [Separate fresh byte/raster/silent motion witness](REASONED_SCENE_RASTER_MOTION_EVIDENCE_2026-10-04.md) records eight source instances and a 4 s silent highlighter MP4 against this final renderer hash. It is not a solution video, new voice, synchronization or learner/publication acceptance.
