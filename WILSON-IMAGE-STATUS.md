# Wilson picture cards — 2026-11-26

Target: **1500 individually reviewed usable picture cards**. Current release: **388 active unique word cards**: 333 nouns, 22 verb/action tasks, 33 number-word tasks. **1112 cards remain**. This is a reviewed expansion, not completion of the 1500-card target.

## Inventory and review decisions

| Inventory | Count | Used by trainer |
| --- | ---: | --- |
| Previous project illustrations | 22 | Yes |
| Approved Mulberry word/image mappings | 366 | Yes |
| Blocked mappings needing replacement/context | 53 | No |
| Alternative motifs for existing words | 5 | No; never counted again |
| Unreviewed saved candidates | 0 | No |

The repository contains 424 Mulberry candidate records. The baseline at commit `1634346e04916ad68d2dcd92400fe420dcad8f9d` already had 222 active cards and a shared vocabulary projection, despite the older handover describing 22. This release adds **166 active words**. Of the initial 35 blocked mappings, six are now usable: Bagel, Mütze, Sattel, Scheibe, Spülbecken, Woche. Five have a new motif; Sattel retains its horse-saddle image with the Chinese meaning corrected to 马鞍 (mǎ'ān).

184 additional candidates and 16 replacement trials were downloaded from the same pinned Mulberry revision, checked against their upstream Git blob hashes, rendered with Inkscape and inspected individually in labeled contact sheets (enlarged where needed). DE lemma/article/plural, EN/ZH meanings and broad German IPA were assessed alongside the pictures. All new decisions and reasons are stored in `wilson-image-candidates.js`; replaced decisions retain their history. Rejected examples include pupil (eye pupil, not girl), bow (ribbon, not bowing), a data cable for power cable, a stand mixer for hand mixer and a broom for dustpan. Duplicate existing images for Hocker, Couchtisch and Pfeffermühle do not add words.

This is an **AI editorial first review**, not independent native-speaker/phonetics validation, a pedagogical certification or a security guarantee. Unpictured vocabulary remains a draft and does not count toward the picture-card target.

## Shared data and protected progress

- `wilson-lexicon.js` remains unchanged. No stable lexicon IDs were renumbered. `wilson-image-candidates.js` stores approved corrections, images, credit, review decisions and explicit answer variants; `wilson-vocabulary.js` projects it for both applications.
- All 222 previous active input IDs, German lemmas, image paths and image hashes are protected by a regression fixture. Existing main-app English IDs and input-trainer IDs remain separate. No progress-store migration occurred.
- Input keeps `ttk-wilson-picture-input-v1` and backup version 1; unknown historical IDs remain preserved. Simple and Pro remain present, and Kids retains its separate progress key and suitability filter.
- Nouns ask the appropriate singular/plural forms. Plural-only nouns such as Chips and Shorts now use the actual plural rather than the source inventory's dash. Weak Geldautomat is marked for N-declension.
- Verbs ask for the infinitive, including reflexive pronouns where needed; numbers ask for German words. No artificial noun article/plural is requested. Hundert/einhundert and tausend/eintausend are accepted.
- Gallery filters separate nouns, activities and number words. Active cards have direct practice links. A direct link requests that one active word first, then ordinary due-first practice resumes. Early successful direct practice does not increase the planned interval/streak. Blocked IDs cannot be selected through a URL.
- No daily cap, account or automatic device sync was added. Device-local backups remain exportable/importable.
- `node scripts/build-wilson-offline.cjs` rebuilds the standalone main app with all 388 SVGs embedded. Source/license/navigation links require internet; device audio may too.

## Provenance

Mulberry Symbols revision: `fa94a93ca1b5357c0b6e0d9f8a81c426a1dfefdf`. Copyright 2018–2026 Steve Lee, **CC BY-SA 4.0**. `wilson/mulberry/LICENSE.txt` is retained unchanged. Each SVG is an unchanged upstream file and has an individual pinned source link. New/replaced files carry SHA-256 and upstream Git blob hashes. The trainer, word details, gallery and learning-path footer expose creator, source and license attribution. No blanket legal-clearance claim is made.

No PONS pictures, book pages or recordings were copied. Audio is device speech synthesis. No paid service was used. This environment is Linux, without access to the Windows DPAPI key store and without `MOONSHOT_API_KEY`; Moonshot answered unauthenticated HTTP 401, so **no Kimi request or review was made**. No secret was printed or committed. DNS and hosting configuration were unchanged.

## Validation

Logic/content checks cover every active canonical answer and image, first/second attempt, Chinese comma, capitalization, IME, pronunciation hooks/fallback, save/reload, export/import validation, due-first/early reviews, number tasks, weak nouns, blocked links, source hashes, duplicate-image exclusions and old IDs. The site/CTA checks and offline rebuild are included in the existing GitHub workflow.

Browser verification is recorded with the deployment checks for this release. Physical iPhone/Android keyboard, IME and audible device output still require real-device verification; desktop narrow-width rendering is not a substitute. Independent Mandarin/IPA review remains outstanding.

## Work remaining

1. Reach 1500 with **1112 further distinct, reviewed, usable word/image tasks**. Downloads, duplicate motifs and generic placeholders do not fill this gap.
2. Replace or contextualize the 53 blocked mappings; retain their IDs and review history.
3. Expand beyond the easy exact-name matches using appropriate objects and distinct action/relationship scenes. The finite Mulberry collection does not cover the whole draft inventory.
4. Add independently checked language/phonetics corrections and real-device QA. Keep active cards, rejected/pending material and the remaining gap separate in every report.
