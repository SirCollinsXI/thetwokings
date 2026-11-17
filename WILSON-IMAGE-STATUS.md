# Wilson picture cards — 2026-11-17

Target: **1500 individually reviewed usable picture cards**. Current release: **222 active unique word cards** (22 previous cards + 200 additional Mulberry cards). Remaining gap: **1278**. The 1500-card goal is **not complete**.

## Review of the 240 saved candidates

| Decision | Count | Used by trainer |
| --- | ---: | --- |
| Approved additional words | 200 | Yes |
| Approved alternative motifs for existing words | 5 | No; existing illustrations retained |
| Blocked: replacement or context required | 35 | No |
| Not yet assessed in this batch | 0 | No |

All 240 SVGs were rendered with Inkscape and individually inspected in eight labeled 30-card contact sheets. DE article/lemma/plural, EN and ZH meanings were assessed alongside each rendered motif. Each manifest record now stores its decision, reason, date, method, and, when approved, editorial broad German IPA without the article. This is an **AI-assisted editorial first review**, not independent native-speaker/phonetics validation or a security guarantee.

Examples deliberately blocked: file (metal file, not computer file), hand mixer (stick blender), fat (body size), saddle (horse saddle vs bicycle-seat translation), kitchen sink (bathroom basin), week (only Monday–Friday), several family relationships requiring explained reference persons. Some generic food containers and visually ambiguous fruit motifs also remain blocked. No blocked motif is included in training.

## Shared data and stable progress

- `wilson-lexicon.js` remains the stable base inventory; no lexicon IDs were renumbered.
- `wilson-image-candidates.js` contains review decisions, sources and the reviewed correction for egg white as an ingredient (singular-only exercise).
- `wilson-vocabulary.js` projects this data for the input trainer and main application. Original main-app English IDs and original input-trainer IDs are intentionally preserved separately; this is **not a migration or merge of progress stores**.
- Input keeps its original storage key and version. Historical records for temporarily unavailable cards are retained instead of rejecting the entire backup. Due-first scheduling and export/import remain in place.
- Simple, Pro and Kids use the same vocabulary/image projection. Kids retains its own progress key and filters the new material using editorial child-suitability annotations; these annotations are not a pedagogical certification.
- The standalone offline download is reproducibly rebuilt from the same source with `node scripts/build-wilson-offline.cjs`. All 222 active SVGs are embedded. External source/license/navigation links need internet; device audio may too.

## Provenance

Mulberry Symbols revision: `fa94a93ca1b5357c0b6e0d9f8a81c426a1dfefdf`.
Copyright 2018–2026 Steve Lee, **CC BY-SA 4.0**. Original upstream `wilson/mulberry/LICENSE.txt` retained unchanged. All SVG files retained unchanged. Each candidate has its pinned upstream source link. The input trainer displays creator, source and license links beside each Mulberry image. Main word details link the individual source; cards and the persistent footer identify the creator/license, with the source gallery accessible from every learning path. No blanket legal-clearance claim is made.

No PONS images, pages or recordings were copied. Remaining unpictured vocabulary is still an editorial draft and must not be counted as finished picture cards.

## Validation and limits

- Logic tests exercise all 222 cards, number modes, first/second attempt, Chinese comma, capitalisation, IME guard, pronunciation hooks, missing-audio fallback, persistence, due-first selection and early-review intervals.
- Content tests check unique IDs and image hashes, complete active language/IPA fields, local image existence, static SVG patterns, individual pinned sources, blocked-image exclusion, alternative-image exclusion, legacy IDs and child separation.
- Browser QA uses the real rendered trainer at 390px and 1280px CSS frame widths, Enter/retry/next, reload/continue, new Mulberry card attribution, gallery filtering, and Simple/Pro/Kids navigation. On mobile, advancing a card brings its picture into view without forcing the keyboard open.
- A real iPhone/Android keyboard, IME and audible device output still need physical-device verification. Mandarin and IPA should receive independent review.

## Next expansion work

1. Replace or provide task-appropriate scene context for the 35 blocked items; keep existing IDs.
2. Find and license additional concrete-object imagery; preserve creator, license, pinned source and review records from acquisition onward.
3. Design distinct scenes and prompts for actions and abstract concepts. A download, duplicate, generic placeholder or unrelated symbol must never count as a card.
4. Review newly rendered motifs individually against DE/EN/ZH forms and IPA, then activate only reviewed entries.
5. Keep reporting active unique words, pending material and the gap to 1500 separately. Do not represent this release as completion of the expansion.
