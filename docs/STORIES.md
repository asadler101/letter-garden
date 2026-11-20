# Learning Garden — roadmap and story cards

Updated: November 19, 2026

## How to use this backlog

This is the source of truth for planned work. Keep Markdown only for now; do not create GitHub Issues until requested. Stable LG identifiers can later become issue titles, for example `LG-05: Find a number`.

- **Backlog:** described and ready for refinement; not implemented.
- **In progress:** actively being built; normally one card at a time.
- **Done:** acceptance criteria and the shared definition of done have passed.
- **Future proposal:** an idea to revisit, not a commitment or permission to implement it.

Move one card to In progress, build its smallest complete experience, verify the criteria, then mark it Done and link its commit or pull request. Checkboxes below are acceptance checks, not a claim that work is complete. Dependencies specify what must be ready first; independent cards can be reordered.

The repository and public URL retain **Letter Garden**. LG-01 introduces **Learning Garden** product branding. Repository and URL renaming are outside that card.

## Current backlog snapshot — November 19, 2026

- **Implemented and published:** LG-01–LG-08 and LG-10–LG-21. The expansion shipped in [PR #2](https://github.com/asadler101/letter-garden/pull/2); narration, landscape letter flow, and automatic letter progression were updated in [PR #3](https://github.com/asadler101/letter-garden/pull/3), [PR #4](https://github.com/asadler101/letter-garden/pull/4), [PR #5](https://github.com/asadler101/letter-garden/pull/5), and [PR #6](https://github.com/asadler101/letter-garden/pull/6). The dated “not committed/published” implementation notes below describe the earlier work session and are superseded by these releases.
- **Still open before full sign-off:** LG-03 backup/share/import on actual devices; LG-09 numbers/device verification; LG-15 saved decoration layouts across phone/tablet/laptop; LG-22 family testing. Other implemented cards retain In progress until their shared device, layout, accessibility, and listening checks are recorded. See [device checks](DEVICE-CHECKS.md) and [family checks](FAMILY-CHECKS.md).
- **Audio follow-up:** latest iPhone recording restoration and letter/picture-word feedback shipped in PR #6; successful actual-device confirmation is still needed. Replacing the original synthetic recordings with a more natural narrator has not been delivered.
- **Break features:** LG-31 configuration, LG-32 scheduling, and LG-33 app locking are implemented in [PR #9](https://github.com/asadler101/letter-garden/pull/9). LG-34 physical-device/family verification remains open; see [break checks](BREAK-CHECKS.md).
- **New, not implemented:** LG-35–LG-41, optional seasonal/holiday themes, themed collections, and little missions.
- **Future proposals, not scheduled:** LG-23–LG-26 shapes, colors, patterns, and early letter sounds; LG-27–LG-30 paid-offering research, iOS preparation/unlock, and optional paid web/cross-device saves.

A published feature is not automatically a passed device/family test. The open checkboxes below remain the acceptance record.

## Product direction

A calm learning game for ages roughly 3–5, built for touch and spoken guidance. Children learn through discoveries, gentle hints, and creative choices. Parents control practice settings. Monetization is future state.

- Learning Garden contains **Letter Garden** and **Number Garden**.
- One buddy, flower patch, visitor collection, and decorated garden are shared across subjects.
- Five successful learning rounds grow five flowers and complete a garden.
- One round earns at most one flower, including a round with several counting taps. Incorrect attempts never remove progress.
- Free exploration remains available and does not award flowers merely for repeated taps.
- No timed learning challenges, streak pressure, competitive leaderboards, purchasable reward currency, or punishment for stopping. Optional grown-up-configured break schedules (LG-31–LG-34) are permitted and never remove earned progress.
- No child account is needed for the planned web releases. Progress stays in the browser unless a parent explicitly exports it.

## Already delivered — preserve these behaviors

| Capability | Status | Evidence |
| --- | --- | --- |
| Find a Letter, Big & Little, Alphabet Picnic | Done | Current live game |
| Starter/custom letters and uppercase/lowercase preferences | Done | Grown-up settings |
| Browser-saved flowers and preferences | Done | Existing local save |
| Tap-triggered recordings and sound test | Done | User confirmed iPhone sound works |
| Picnic narration says the letter once | Done | Published fix and regression check |
| Five-flower celebration, rest, and replant with total retained | Done | Published feature and regression checks |
| Responsive layouts and reduced-motion support | Done | Previous browser checks; repeat device checks for new screens |

The cards below add to these capabilities rather than rebuilding them.

## Release map

| Phase | Cards | Playable outcome |
| --- | --- | --- |
| 1 — Learning Garden + numbers | LG-01–LG-09 | Choose letters or numbers; learn 1–5; both grow the same garden |
| 2 — A friend and surprises | LG-10–LG-13 | Choose a buddy, get encouragement, reveal and collect visitors |
| 3 — Make it mine | LG-14–LG-20 | Decorate a garden, take little missions, learn letters in a name |
| 4 — Family readiness | LG-21–LG-22 | Simple parent progress view and a real-family quality pass |
| 5 — Family break times | LG-31–LG-34 | Grown-ups schedule named picture-led breaks; play pauses throughout each break window |
| 6 — Seasonal garden fun | LG-35–LG-41 | Optional seasons and holiday themes, themed collections and short missions, controlled by grown-ups |
| Future learning proposals | LG-23–LG-26 | Shapes, colors, patterns, early sounds; refine before scheduling |
| Future commercial proposals | LG-27–LG-30 | Validate pricing, prepare iOS, purchase restoration, optional paid web |

## Phase 1 — Learning Garden + numbers

### LG-01 — Introduce Learning Garden

**Status:** Done · **Dependencies:** None

**Story:** As a parent and child, we want a clear home for different learning activities so the game can grow beyond letters.

**Experience:** The home screen welcomes the child to Learning Garden and offers two large illustrated destinations: Letter Garden and Number Garden. Until numbers are ready, the unfinished destination is not presented as playable.

**Acceptance criteria:**
- [x] Visible branding and document title use Learning Garden; existing letter activities remain recognizable.
- [x] A child can reach either available subject through large picture buttons and return home easily.
- [x] Existing flowers, settings, and completed gardens survive the update.
- [x] Existing links continue to work; the repository and public URL are not renamed as part of this card.

**Implementation notes (November 13, 2026):** [Implementation commit](https://github.com/asadler101/letter-garden/commit/bc872491ae7f950c43483e1b1e1c483718c4f168). Learning Garden home and branding are implemented. Letter Garden opens the existing three activities; Number Garden is a non-interactive Coming soon destination. All 13 regressions and JavaScript syntax checks pass, including navigation and save preservation. The existing storage key and public URL are unchanged. The user tested the local browser preview and approved shipping. Separate phone/tablet, keyboard, and actual-device checks were not repeated for this release; that remains a verification limitation.

**Out of scope:** New activities, a logo commission, store branding, and monetization.

### LG-02 — Make progress ready for more subjects

**Status:** Done · **Dependencies:** None; required before new progress-producing features ship

**Story:** As a family, we want updates and new activities to preserve the garden we already grew.

**Acceptance criteria:**
- [x] A versioned browser save holds shared garden progress plus separate letter and number preferences.
- [x] Existing saves migrate without losing flowers, sound preferences, custom letters, or a completed patch.
- [x] Future visitor, decoration, mission, and name fields can be added without resetting unrelated data.
- [x] Missing, invalid, or unavailable storage does not prevent play; show parents when progress cannot be saved.
- [x] Save migration and completed-garden behavior have regression coverage.

**Implementation notes (November 13, 2026):** Version 1 saves retain the `letter-garden` key and separate `garden`, shared `preferences.sound`, `preferences.letters`, and `preferences.numbers`. Legacy saves migrate on load; unknown fields are preserved for future additions. Unsupported versions are not overwritten. Grown-up settings show storage failures while in-memory play continues. Regression coverage includes legacy and versioned reloads, completed patches, invalid/missing storage, read/write failures, and future-field preservation. All 18 regressions and JavaScript syntax checks pass. The user reviewed the local preview and approved shipping. Separate phone/tablet, keyboard, and actual-device checks were not repeated; that remains a verification limitation. [Implementation commit](https://github.com/asadler101/letter-garden/commit/ed8d9b6). The user approved publication through a pull request and merge.

**Out of scope:** Cloud sync and user accounts.

### LG-03 — Back up or move my garden

**Status:** In progress · **Dependencies:** LG-02

**Story:** As a grown-up, I want to back up progress or move it to another device without creating an account.

**Acceptance criteria:**
- [x] Grown-up settings can export a versioned progress file and import a compatible file.
- [x] Import validates contents and shows a summary before the parent confirms replacing current progress.
- [x] Invalid or unsupported files leave the existing garden unchanged.
- [ ] Export/import works through the iPhone share/file flow as well as laptop downloads.
- [x] Explain that the backup may contain a child's entered name; exporting does not send it to a service.

**Implementation notes (November 13, 2026):** Implemented version 1 JSON downloads and a feature-detected native file share option, plus a local file picker for import. Strict validation precedes a text-only progress/settings summary and an explicit replacement button; cancel, malformed/unsupported files, failed reads, oversized files (over 1 MB), and failed storage writes leave the existing garden unchanged. Unknown saved fields are retained. Parents are told that backups may include an entered name and are not uploaded by the game. All 23 silent regressions and app/server JavaScript syntax checks pass, including five new backup regression cases covering confirmation, rejection, cancellation/read races/storage failures, round-trip preservation, completed gardens, and synchronous native-share initiation. Native share is mocked in these tests. Parent-agent silent in-app browser DOM and screenshot checks covered desktop 1265×712 and simulated phone 390×844: settings remained within the viewport and vertically scrollable; backup download returned a local JSON path. Actual iPhone share/Files, import file-picker, keyboard/focus, and landscape/tablet checks remain unverified; the device-flow acceptance criterion remains open. Not published or committed as part of this implementation.

**Out of scope:** Automatic merging, cloud storage integration, and syncing devices.

### LG-04 — Choose number practice settings

**Status:** In progress · **Dependencies:** LG-02

**Story:** As a grown-up, I want to choose an appropriate number range without changing letter practice.

**Acceptance criteria:**
- [x] Number practice starts at 1–5 and optionally expands to 1–10.
- [x] The chosen range is remembered independently of letter settings.
- [x] All number activities use the selected range and always offer valid, distinct choices.
- [x] Settings explain the difference between recognizing a numeral and counting a quantity.

**Implementation notes (November 13, 2026):** Grown-up settings independently save numbers 1–5 (default) or 1–10 in version 1 preferences. Missing or invalid stored ranges default safely; future number fields remain intact. Backup review includes the number range, accepts older empty number preferences as 1–5, and rejects unsupported explicit ranges before replacement. Shared `numberPool()` and `numberRound()` helpers generate in-range targets and three distinct choices for LG-05–LG-07; Find a number now uses these helpers and restarts with valid choices after range changes; Count with me also uses the range; How many do you see now uses the same helpers, completing integration across the three planned number activities. All 27 silent regressions and app/server syntax and diff checks pass, including four new cases for range normalization, independent settings/reloads, choice validity, and backup compatibility. Parent-agent silent in-app browser DOM and screenshot checks covered desktop 1265×712 and simulated phone 390×844: settings remained within the viewport and vertically scrollable. Actual iPhone, import file-picker, keyboard, landscape/tablet checks remain unverified. Not committed or published.

**Out of scope:** Zero, negative numbers, arithmetic, and automatic difficulty changes.

### LG-05 — Find a number

**Status:** In progress · **Dependencies:** LG-01, LG-02, LG-04

**Story:** As a little learner, I want to hear a number and find its numeral.

**Experience:** “Can you find three?” appears with three large numeral cards.

**Acceptance criteria:**
- [x] Each round contains one target and two distinct distractors within the chosen range.
- [x] A tap can replay the spoken prompt; sound-off play shows the target in words/numerals.
- [x] Incorrect choices provide a gentle hint and unlimited retries.
- [x] A correct choice earns one shared garden flower, then offers another round or the existing five-flower celebration.
- [x] Repeated taps cannot award extra flowers for the same round.

**Out of scope:** Counting objects; that is a separate activity.

**Implementation notes (November 13, 2026):** Find a number is available from the basic Number Garden menu; LG-07 now adds the third playable activity and the fuller subject hub remains LG-08. Three distinct numeral choices honor the independently saved range. Replay, gentle unlimited retries, sound-off words/numerals, one-flower credit, mixed-subject patch completion, replanting, and completed-save reload use the shared garden. Round identifiers reject stale answer/next handlers. Thirty bundled narration clips were generated silently, with the existing speech synthesis fallback and visible guidance when playback fails. All 32 silent regression tests, JavaScript syntax checks, and diff checks pass. Parent-agent silent in-app browser checks covered navigation, a sound-off target with three distinct choices, and a gentle wrong-answer hint retaining 11 flowers. Simulated phone 390×844 fit; landscape 844×390 had no horizontal overflow. Actual audio/device, successful-answer browser flow, keyboard/focus and reduced-motion remain unverified. Story remains In progress pending shared definition-of-done checks. Not committed or published.

### LG-06 — Count with me

**Status:** In progress · **Dependencies:** LG-01, LG-02, LG-04

**Story:** As a little learner, I want to touch objects and hear them counted so numbers connect to real quantities.

**Experience:** The child taps a small group of apples. Each touched apple lights up, and the narrator says the next number.

**Acceptance criteria:**
- [x] Show a clearly separated group containing 1–5 objects initially, or up to 10 when enabled.
- [x] Each object counts once, regardless of tap order; an already-counted object does not advance the count.
- [x] Each new tap gets immediate visual feedback and understandable counting audio during rapid tapping.
- [x] Completing the group shows its numeral and earns exactly one flower for the whole round.
- [x] The child chooses when to continue; no timed tapping is required.

**Out of scope:** Adding/removing objects and drag-and-drop counting.

**Implementation notes (November 13, 2026):** Count with me is reachable through a basic Number Garden menu alongside Find a number; LG-07 now adds the third playable activity and LG-08 full hub work remains planned. Separated apples honor 1–5/1–10, accept any order once each, show persistent tap-order badges immediately, and queue short number recordings without overlaps or stale feedback writes. Completion shows the quantity and saves exactly one shared flower; the child chooses another group or, at five flowers, See my garden. Partial groups restart without credit on reload; earned flowers and completed patches persist. Eleven count-only recordings were generated silently without changing existing WAVs. All 36 silent regressions and app/server JavaScript syntax/diff checks pass, covering duplicate/invalid/stale taps, both ranges, saved fifth-flower reload, mute, rapid audio queues and fallback failures. Browser checks belong to the parent agent and are not claimed here. Actual iPhone/audio, keyboard/focus, reduced-motion and responsive browser checks remain unverified. Not committed or published.

### LG-07 — How many do you see?

**Status:** In progress · **Dependencies:** LG-01, LG-02, LG-04

**Story:** As a little learner, I want to match a group of objects to the number that tells how many there are.

**Acceptance criteria:**
- [x] Show one group and three distinct numeral choices, including the correct quantity.
- [x] Objects are large enough to count and never overlap ambiguously.
- [x] A counting-help option lets the child count the objects without changing the answer or earning an extra reward.
- [x] Incorrect answers give hints without removing progress.
- [x] A correct answer earns one shared flower, including after using help.

**Out of scope:** Comparing groups and recognizing quantities beyond the chosen range.

**Implementation notes (November 13, 2026):** One separated apple group and three distinct numeral choices honor the saved 1–5/1–10 range. A third picture-led Number Garden card opens the game. Individual help taps count once each and retain their badges across wrong answers; Count with me replays the complete count even after all objects were tapped. Help awards no flowers; a correct answer awards exactly one shared flower, including after help, and stale/repeated handlers cannot duplicate credit. Two prompts were generated silently; existing count queue/recordings and success clips are reused. All 41 silent Node regressions and app/server syntax/diff checks pass. Browser checks belong to the parent agent and are not claimed here. Actual device/audio, browser layout, keyboard/focus, and reduced-motion checks remain unverified, so the story remains In progress. Not committed or published.

### LG-08 — Visit Number Garden

**Status:** In progress · **Dependencies:** LG-05–LG-07

**Story:** As a little learner, I want to choose how to play with numbers and see that my discoveries grow the same garden.

**Acceptance criteria:**
- [x] Number Garden offers Find a Number, Count With Me, and How Many through picture-led cards.
- [x] Navigation among the home screen, either subject, and activities is consistent and returns to the top.
- [x] Flowers earned in either subject contribute to one five-flower patch and one lifetime total.
- [x] Completing a mixed letter/number patch celebrates once; planting another patch preserves lifetime flowers.
- [x] Letter activities retain their existing behavior and saved settings.

**Implementation notes (November 13, 2026):** All three picture-led activity cards are reachable. Number Garden now displays the same five-flower patch and lifetime total used by letters and home, with a completed-garden entry that returns to Number Garden and replants into number play. The quantity-card picture matches its numeral. Three integrated regressions cover every subject/activity return-to-top handler, mixed letter/number completion across all five rewarded activities, duplicate credit, one celebration announcement, completed-save reload, replanting, independent custom/lowercase letters and 1-10 number preferences. All 44 silent Node regressions, app/server syntax checks and diff checks pass. The scroll checks observe mocked browser calls; they do not establish actual layout or focus behavior. Parent-agent silent in-app browser checks observed all three cards, count tap-order feedback/duplicate protection, quantity help, unchanged choices and retained progress; successful reward flow and actual audio were not exercised there. Responsive, keyboard/focus, reduced-motion and actual-device checks remain unverified. Shared definition-of-done checks and LG-09 device verification remain open, so this story remains In progress despite implemented acceptance behavior. Not committed or published.

### LG-09 — Verify the numbers release on real devices

**Status:** In progress · **Dependencies:** LG-01–LG-08

**Story:** As a family, we want Learning Garden to behave consistently on the devices we use.

**Acceptance criteria:**
- [ ] Test all new activities on an actual iPhone, including first-tap audio, rapid taps, sound off, and returning from another app.
- [ ] Check phone portrait/landscape, tablet, and touchscreen laptop; no horizontal clipping or inaccessible settings.
- [ ] Verify old-save migration, a mixed-subject five-flower celebration, and progress after reopening the browser.
- [ ] Verify export/import on iPhone and laptop, including a rejected invalid backup.
- [ ] Record device/browser versions and results; distinguish real-device checks from desktop viewport simulation.

**Verification notes (November 13, 2026):** Terminal checks pass: 44/44 silent Node regressions, app/server JavaScript syntax, all 176 WAV integrity checks (within the suite), and diff whitespace checks. These use mocked browser/audio APIs; they do not establish actual playback, touch, native share/file-picker, or device layout behavior. Earlier parent-agent in-app browser observations remain scoped to LG-03–LG-08 notes and are desktop/viewport simulation evidence only. No new browser or physical-device checks were performed for LG-09. Actual iPhone, tablet and touchscreen laptop access and device/browser versions are unavailable to this task; all actual-device acceptance checks remain NOT RUN. [Device record and actionable checklist](DEVICE-CHECKS.md) covers the remaining work. LG-09 stays In progress and Phase 1 is not cleared for release.

**Release gate:** Phase 1 is ready only when blocking issues are fixed and this card passes.

## Phase 2 — A friend and surprises

### LG-10 — Choose my garden buddy

**Status:** In progress · **Dependencies:** LG-01, LG-02

**Story:** As a little learner, I want to choose an animal friend so the garden feels like mine.

**Acceptance criteria:**
- [x] Offer Bunny, Turtle, and Dinosaur as large picture cards with a name and spoken introduction.
- [x] Tapping selects a buddy; a clear confirmation starts play.
- [x] The selected buddy appears at home and is remembered after reopening.
- [x] The child can skip selection or change buddies without losing progress or rewards.

**Implementation notes (November 13, 2026):** An optional home entry opens three large named picture cards. Tapping a card selects a pending buddy and starts its bundled spoken introduction from the tap; an explicit “Let’s play with…” confirmation saves the choice and returns to the home subject choices. The home shows the remembered friend and a Change buddy button. Skip, back, and leaving before confirmation retain the existing buddy and all progress. The optional version 1 `buddy` identifier accepts only bunny, turtle, or dinosaur: invalid stored values are removed safely; invalid explicit backup values reject replacement; absent fields remain compatible and unrelated future fields survive. Three introductions were generated to WAV files silently. All 48 silent Node regressions (including the existing 44), app/server syntax checks and diff checks pass. New coverage checks pending/confirmed/skipped/changed/reloaded choices, completed rewards and replanting, muted/silent introductions and stale fallback, safe save normalization and backup imports. Browser, responsive layout, keyboard/focus, reduced-motion and actual-device/audio checks remain unverified for this story; the parent agent owns browser verification. Shared definition-of-done checks remain open, so this card remains In progress. No LG-11 activity reactions, commits or publication are included.

**Additional parent-agent browser review (November 13, 2026):** Silent in-app browser at 1265×712 showed three named buddy cards. Tapping Turtle selected it, displayed its introduction and enabled confirmation; Skip returned home without choosing a buddy or changing the 11 flowers. Actual audio and mobile layout remain unverified.

**Out of scope:** Accessories and distinct character voices.

### LG-11 — My buddy helps me learn

**Status:** In progress · **Dependencies:** LG-10, LG-08

**Story:** As a little learner, I want my buddy to encourage me while I discover letters and numbers.

**Acceptance criteria:**
- [x] The chosen buddy appears in learning activities with waiting, encouraging, and happy reactions.
- [x] Prompts remain clear and play once; reactions do not overlap narration or cover answers.
- [x] Wrong answers keep the tone gentle, with no sad punishment animation.
- [x] The buddy joins the five-flower celebration and respects sound-off/reduced-motion settings.

**Implementation notes (November 13, 2026):** The optional saved buddy now accompanies Find a letter, Big & little, Alphabet picnic, Find a number, Count with me, and How many do you see. A compact component in normal document flow shows waiting, gentle encouragement after retries/counting help, and happy discovery reactions; no buddy means no extra component or required selection. Reactions add no speech or recordings, so existing prompts, queued counts, and celebration narration remain the only audio. Buddy reactions do not change reward credit, and the selected friend joins the five-flower celebration and survives reloads. Happy motion has an explicit reduced-motion override. Letter and picnic callbacks now reject stale rounds/navigation. All 53 silent Node regressions and app/server syntax and diff checks pass, including five new regression cases across optional buddies, all activities, retries, counting help, duplicate taps, stale handlers, mute and celebration reload. DOM and audio are mocked: responsive browser layout, keyboard/focus, actual reduced-motion rendering, and actual-device/audio checks remain unverified; parent-agent browser review is separate. Story remains In progress pending shared definition-of-done checks. Not committed or published.

**Out of scope:** New game rules and conversational AI.

### LG-12 — Reveal a surprise garden visitor

**Status:** In progress · **Dependencies:** LG-02, LG-08

**Story:** As a little learner, I want someone new to visit when my garden blooms.

**Acceptance criteria:**
- [x] A completed patch earns one reveal, opened by tapping a large visual cue on the celebration screen.
- [x] Start with Butterfly, Ladybug, Bee, Snail, and Bird; introduce each with a picture and name.
- [x] Reveal uncollected visitors before repeats; after all five are collected, familiar visitors can return.
- [x] Save the earned reward before revealing it; reloads and repeated taps cannot lose or duplicate it.
- [x] A child can rest or plant another patch without opening a reveal; unopened rewards remain accessible.

**Implementation notes (November 13, 2026):** Each fifth flower saves a sequential patch reward receipt before the reveal is offered. The large gift on the celebration screen and Learning Garden home opens one saved receipt and introduces Butterfly, Ladybug, Bee, Snail, or Bird with a picture and bundled name recording. Opened receipts retain the discovered visitor; choices favor unseen visitors until all five have appeared. Rest, replant, fresh garden, subject changes and reload retain unopened receipts. Old completed saves receive one deterministic current-patch receipt, without retroactive rewards for historic totals. Imports validate receipt identities, pending/opened consistency and visitor identifiers; malformed local visitor data remains preserved and unavailable rather than being overwritten. Failed reveal writes keep the receipt unopened and show guidance. Full collection browsing remains LG-13. All 62 silent Node regressions, app/server syntax and diff checks pass, including nine new visitor cases covering all earning activities, reloads, unopened queues, replant/reset, stale/repeated callbacks, unseen-first selection, migration, storage failures, backup rejection and narration fallback. Five name recordings were generated without speaker playback. Browser checks belong to the parent agent. Actual-device/audio, browser layout, keyboard/focus and reduced-motion rendering remain unverified, so the card remains In progress. Not committed or published.

**Out of scope:** Rarity tiers, paid reveals, and trading.

### LG-13 — Meet my visitor collection

**Status:** In progress · **Dependencies:** LG-12

**Story:** As a little learner, I want to revisit the friends I discovered.

**Acceptance criteria:**
- [x] A picture-led collection shows discovered visitors and friendly silhouettes for undiscovered ones.
- [x] Tapping a discovered visitor plays its name and a small reaction, without earning flowers.
- [x] Unopened earned reveals can be opened from the collection.
- [x] Visitors and unopened rewards persist when changing subjects, resting, or reopening the game.

**Implementation notes (November 13, 2026):** Home opens a picture-led visitor collection without requiring a buddy. Discovered friends read saved opened receipts and use existing name recordings with a small reaction, without changing flowers or rewards. Generic smiling silhouettes contain no unknown visitor names in visible or accessible labels. Gifts reuse the durable reveal flow and stale-view guards; every reveal provides a return to the collection. Five new silent regression cases cover entries, repeated/stale taps, mute, pending reveals, navigation and persistence; all 67 tests and app/server syntax and diff checks pass. Parent-agent silent in-app browser review at 1265×712 checked home to collection, five generic silhouettes without unknown names in the accessibility tree, fitting desktop layout and visible rest action. Discovered-card browser behavior, actual audio/devices, mobile/tablet layouts, keyboard/focus and reduced-motion rendering remain unverified. Shared definition-of-done checks remain open; not committed or published.

## Phase 3 — Make it mine

### LG-14 — Choose a decoration reward

**Status:** In progress · **Dependencies:** LG-02, LG-12

**Story:** As a little learner, I want to choose something special for the garden I grew.

**Acceptance criteria:**
- [x] A completed patch grants one decoration choice alongside its visitor reward, with a separate clear step.
- [x] Offer two picture choices with spoken labels; begin with Mushroom, Pond, Birdhouse, Stepping Stones, Rainbow, and Sunflower.
- [x] Favor unowned decorations while available; owning all six still permits a friendly repeat choice.
- [x] Leaving before choosing preserves an unclaimed reward; claiming cannot happen twice for one patch.

**Implementation notes (November 13, 2026):** Completed patches earn independent durable decoration receipts alongside visitor receipts. Home and celebration offer a separate, skippable choice of two pictures, each with a tap-to-hear bundled label. Options are saved before display and remain fixed across reloads; claiming saves before confirmation, and failed writes retain the pending receipt. Offers favor unowned items, include the last unowned item alongside a repeat, and allow friendly repeats after all six. Visitor claims never consume decoration rewards. Older completed saves gain one current-patch decoration receipt regardless of visitor history; historic totals and pending visitor counts do not grant retroactive decorations. Replant/reset retain pending and claimed rewards; backups validate receipts/options and preserve unrelated fields. All 74 silent Node regressions, app/server syntax checks and diff checks pass, including seven new decoration cases for shared activity rewards, all six items/repeats, durable options, interrupted/reloaded flows, stale taps, migration, malformed backups/local data, failed writes and muted narration. Six labels were generated silently. Browser layout, keyboard/focus, actual-device audio and reduced-motion rendering remain unverified; the shared definition of done remains open. Placement is implemented locally under LG-15 with separate verification limitations. Not committed or published.

**Out of scope:** A currency shop, paid items, and forced reward screens.

### LG-15 — Decorate my garden with taps

**Status:** In progress · **Dependencies:** LG-14

**Story:** As a little learner, I want to place my decorations without needing precise dragging.

**Acceptance criteria:**
- [x] One garden scene provides six large placement spots.
- [x] Tap an owned item, then tap a spot to place it; the selected item and available spots are visually clear.
- [x] Items can be moved, swapped, or returned to the collection without being lost.
- [x] A unique owned decoration is not accidentally duplicated into several spots.
- [ ] Placements survive reopening and fit phone, tablet, and laptop layouts.

**Implementation notes (November 13, 2026):** Home and the decoration claim confirmation open a single garden with six fixed tap spots. A selected picture and available spots are highlighted; tap an owned picture then a spot, tap a placed picture to move it, swap two placed pictures, or return the selection to its collection. Placing a collection picture over another returns the displaced picture to the collection. Repeated reward receipts retain their history but unlock one reusable item per decoration type, never duplicate placed copies. No flowers or rewards are earned here. Version 1 `gardenPlacements` saves six nullable type identifiers transactionally; failed writes roll back. Backups reject invalid, unowned, duplicated or unsupported placements, and malformed local layouts are retained with editing blocked. Labels render only known catalog values, with status text assigned through `textContent`. Five new silent regressions cover all six placements, repeats, move/swap/return, no reward changes, reload, empty state, stale handlers, validation and failed saves. All 79 silent Node regressions, app/server syntax checks and diff checks pass. CSS uses responsive two/three-column grids and large tap controls; phone/tablet/laptop browser fit, actual-device touch, keyboard/focus and reduced-motion rendering remain unverified. The final responsive/device acceptance criterion and shared definition of done remain open. Not committed or published.

**Out of scope:** Freeform positioning and multiple garden scenes.

### LG-16 — Revisit my garden and collections

**Status:** In progress · **Dependencies:** LG-13, LG-15

**Story:** As a little learner, I want an easy place to enjoy everything I have grown and collected.

**Acceptance criteria:**
- [x] Home provides a clear My Garden destination with access to decorations and visitors.
- [x] A first-time garden feels welcoming even before rewards are earned.
- [x] The child can return to either learning subject in one clear action.
- [x] Viewing and rearranging collections never consumes rewards or changes learning progress.

**Implementation notes (November 13, 2026):** Home now offers one My Garden destination while keeping the buddy chooser and pending visitor/decoration gifts visible. The hub welcomes an empty garden, shows the six saved decoration spots and shared flowers, links to decoration arrangement and visitor collections, and offers direct Letter Garden and Number Garden actions. Both collections return to My Garden; existing reveal, rest and claim routes remain available. Browsing does not write progress or claim rewards. All 82 silent Node regressions, app/server syntax checks and diff checks pass. Three new hub cases cover empty and populated gardens, subject navigation, collection return, stale navigation/reveal handlers, pending gifts, saved rearrangement and reload without changes to learning or reward receipts. Existing collection and placement navigation tests follow the new destination. Browser rendering, phone/tablet layouts, keyboard/focus, reduced motion and actual-device/audio checks have not yet been performed for LG-16. Not committed or published.

**Additional parent-agent browser review for LG-15/LG-16 (November 13, 2026):** Silent in-app browser at 1265×712 navigated home → My Garden and observed six welcoming empty spots and 11 shared flowers. Decorate my garden was reachable with six empty spots, a welcoming empty collection, and disabled return/cancel controls. Actual placement, mobile layout, audio and keyboard behavior were not checked.

### LG-17 — Give my buddy a little mission

**Status:** In progress · **Dependencies:** LG-11, LG-08

**Story:** As a little learner, I want to help my buddy with a small adventure that has a clear finish.

**Acceptance criteria:**
- [x] A mission consists of three successful learning rounds, shown as three picture markers.
- [x] Every success advances the mission once and earns one normal garden flower; mistakes remove neither.
- [x] Only one active mission is shown at a time, and leaving saves its progress.
- [x] Garden completion during a mission preserves mission progress and rewards both milestones once.
- [x] Free play remains available; a mission can be abandoned from grown-up controls without losing earned flowers.

**Out of scope:** Extra reward currencies and daily mission pressure.

**Implementation notes (November 13, 2026):** An optional home entry offers a generic three-discoveries mission using the five current rewarded letter/number activities. Three seed/star picture markers show saved progress and a durable completion message. The mission retains its starting buddy context, or a generic garden context when no buddy was chosen; choosing a friend is never required. The chooser resumes the saved activity or allows another activity. Home and normal subject choices offer free play while the mission waits. The shared successful-round flower helper advances an active mission once behind existing round guards and saves progress/completion alongside the normal flower in one record. Completed patches retain mission progress, independent visitor and decoration receipts, and the correct replant activity; completion adds no extra flowers or currency. Grown-up settings can abandon the mission without changing flowers, with rollback on a failed write. Malformed mission backups reject replacement; malformed local mission fields are preserved and blocked from starting until abandoned or restored. Mission setup/ending currently use visible words and picture markers without new narration; the three named stories and spoken setups/endings remain LG-18.

All 88 silent Node regressions, app/server syntax checks and diff checks pass. Six new cases cover all five earning activities, wrong/repeated answers, counting help, stale callbacks, optional buddies, mixed activities/free play, reload/resume across patch boundaries, simultaneous milestones, completed reload, abandonment, failed writes and invalid imports/local fields. DOM/audio are mocked. Browser layout, keyboard/focus, reduced-motion rendering and actual-device/audio checks remain unverified for LG-17, so shared definition-of-done checks remain open. Not committed or published.

### LG-18 — Play three starter missions

**Status:** In progress · **Dependencies:** LG-17

**Story:** As a little learner, I want different little stories to give familiar activities a purpose.

**Acceptance criteria:**
- [x] Include Pack a Picnic (letters), Count the Garden Guests (numbers), and Help a Seed Grow (a short mixed sequence).
- [x] Each mission has a short spoken setup, three meaningful visual progress steps, and an ending.
- [x] Activities honor grown-up letter and number settings.
- [x] Missions can be replayed; no deadline or consecutive-day requirement applies.

**Implementation notes (November 13, 2026):** Three optional starter stories build on the existing saved mission and shared flower helper. Pack a Picnic uses Find a Letter → Big & Little → Find a Letter, with basket/snack/picnic pictures. Count the Garden Guests uses Find a Number → Count with Me → How Many, welcoming visitor pictures and preparing an apple feast. Help a Seed Grow uses Find a Letter → Count with Me → Find a Number, with seed/water/flower pictures. Each step and ending has visible text and a bundled narration (12 new WAVs generated silently); spoken content uses a generic garden context so choosing a buddy is optional. Tap to continue between steps, rest at home, resume the saved next activity, or replay after completion. Active stories cannot be replaced through the chooser; grown-ups can abandon through the existing settings control. No deadlines or streaks. Each guarded success advances one story step and its normal flower in the same save; endings add no rewards. Letter pools/case and number ranges use existing activity preferences. Completed patches keep story progress and both independent reward receipts through replant/reload. Invalid story/sequence backups reject replacement and failed starts roll back.

All 92 silent Node regressions, app/server syntax checks and diff checks pass. Four added story cases cover every sequence/stage, guarded repeated/stale clicks, replay, mixed subjects, custom lowercase letters and 1–10 range, free play, reload at a garden boundary, backups, invalid sequences and failed starts; the existing 88 checks remain passing, including PCM validation of all 202 recordings. DOM/audio are mocked. Browser/device layout, keyboard/focus, reduced motion and listening on actual devices remain unverified for LG-18. Story remains In progress for those shared definition-of-done checks. Not committed or published.

### LG-19 — Set up letters from my name

**Status:** In progress · **Dependencies:** LG-02

**Story:** As a grown-up, I want to personalize learning with a name without creating an online child profile.

**Acceptance criteria:**
- [x] Name entry is optional and located in Grown-up Settings; it is stored in the browser save.
- [x] Preserve the entered display name, with a reasonable length limit and safe text rendering.
- [x] Preview which A–Z letters can be practiced; explain unsupported characters rather than silently misrepresenting a name.
- [x] Editing or removing the name preserves all other progress.
- [x] Explain that exported backups include the saved name; no name is uploaded for narration.

**Implementation notes (November 13, 2026):** Optional name entry and a live text-only preview are in Grown-up Settings. Edits stay as drafts until Ready to grow; empty removes the structured `preferences.name` field. The exact display spelling (including spaces, accents and emoji) is retained, with a limit of 40 Unicode codepoints and no control/unpaired-surrogate characters. Only original ASCII A–Z/a–z characters become playable uppercase positions, preserving order and repeats; unsupported characters are explicitly explained, without transliteration or converting ß to SS. No child name game is added (LG-20 remains Backlog). Existing unknown top-level name fields are preserved; malformed local structured names remain intact until explicitly replaced/removed and cannot export as valid backups. Version 1 backup validation bounds the structured name, and review shows it through textContent. Backups include the name; the game does not upload it or request name narration. Other preferences, missions, flowers and independent rewards survive editing/removal.

All 97 silent Node tests and app/server syntax/diff checks pass. Five new cases cover exact Unicode display, ordered/repeated positions, unsupported-only names, 40-codepoint limits, unsafe text, drafts/cancel/edit/remove/reload, unknown fields, backup round trips/rejection, malformed local names and no name audio requests. DOM/audio are mocked. Browser/device layout, keyboard/focus, reduced motion and actual-device checks remain unverified; shared definition-of-done checks keep the story In progress. Not committed or published.

**Out of scope:** Generating or guaranteeing spoken name pronunciation.

### LG-20 — Discover my name

**Status:** In progress · **Dependencies:** LG-19, LG-11

**Story:** As a little learner, I want to uncover letters that belong to my name.

**Acceptance criteria:**
- [x] Show large letter positions and uncover playable letters in name order.
- [x] Repeated letters and names with fewer than three distinct letters work; use distinct alphabet distractors when needed.
- [x] Each completed letter-matching round earns one flower; completing the name adds a celebration, not duplicate flower credit.
- [x] Save partial name progress and handle changing the entered name without affecting other learning progress.
- [x] Use dependable narration such as “You found your name!” rather than guessing pronunciation.

**Implementation and validation (November 13, 2026):** Discover my name is reachable from Letter Garden. Ordered uppercase matching uncovers the exact original characters, including repeated positions; other Unicode characters remain visible with an explanation. Names with no playable ASCII letter show setup guidance without a round. Three distinct alphabet choices work for short names independently of letter settings. Fingerprint, next index, completion and the usual flower share one save transaction. Name edits reset only this progress. Invalid local progress is preserved and blocked until settings repair it; backups reject mismatches and bounds errors. Name play is optional free play and leaves every existing mission waiting. Child-chosen next actions and replanting retain the next position; coinciding name and patch completion expose both celebrations without extra credit. Generic name completion has a bundled recording, generated silently. All 104 silent Node regressions, syntax and diff checks pass. Browser layout, keyboard/focus, reduced motion and actual-device/audio checks remain unverified; shared device validation keeps the card In progress. No commit or publication.

## Phase 4 — Family readiness

### LG-21 — See what we have explored

**Status:** In progress · **Dependencies:** LG-08, LG-20

**Story:** As a grown-up, I want a simple picture of the activities my child has tried so I can choose what to practice together.

**Acceptance criteria:**
- [x] A grown-up view summarizes subjects, activities, and letters/numbers practiced on this device.
- [x] Present discoveries and participation without claiming that a few correct answers prove mastery.
- [x] Explain that retries, adult help, and shared-device play affect interpretation.
- [x] Keep the information in the local save; permit a parent to clear practice history separately from collectibles.

**Implementation notes (November 13, 2026):** Grown-up Settings shows device/browser subjects, activities, distinct target letters/numbers and flower-earning discoveries since tracking began or history was cleared. Valid answer attempts (including retries), counting taps/help and picnic letter taps record participation; screen visits, replay prompts and mission story introductions do not. Discoveries use the existing guarded reward save, including name positions and mission rounds, without another reward write. Distinct sets are bounded to eight activities, 26 letters and ten numbers; discoveries saturate at 999,999. No timestamps, attempt logs, name association or telemetry are added. Old saves/backups start empty rather than inferring past practice from flowers. Invalid local history is retained and unavailable until separately cleared; strict backup validation rejects invalid or oversized history fields. A confirmed clear rolls back on save failure and preserves flowers, collectibles, arrangement, mission, name and preferences. The view explains retries, undetected adult help, shared devices and participation versus mastery. All 110 silent Node tests, app/server syntax and diff checks pass. Browser/device rendering, keyboard/focus, reduced-motion and actual audio remain unverified; shared definition-of-done checks remain open. Not committed or published.

**Out of scope:** Third-party analytics, rankings, diagnostic scores, and school reports.

### LG-22 — Test the complete family experience

**Status:** In progress · **Dependencies:** LG-10–LG-21

**Story:** As the product owner, I want evidence that the full game is understandable, dependable, and pleasant for families.

**Acceptance criteria:**
- [ ] Try the game with several willing families and record parent feedback without collecting unnecessary child information.
- [ ] Observe whether children can choose a subject, finish a patch, reveal rewards, and stop with minimal reading or help.
- [ ] Check actual iPhone/tablet/laptop use, offline-file play, reduced motion, and sound-off play.
- [ ] Verify reopening during every reward step and mission step; progress is neither lost nor duplicated.
- [ ] Record issues, fix blockers, and review whether the learning scope is understandable before adding commerce.

**Verification preparation (November 13, 2026):** [Family check record](FAMILY-CHECKS.md) provides anonymous consent/feedback rows, child picture-flow observations, exact device/version fields, offline-file/mute/reduced-motion checks and every reward/mission interruption checkpoint. All family and actual-device results remain NOT RUN; willing families and physical-device evidence are unavailable. Existing silent regression coverage was audited; it cannot replace these observations. Corrected stale grown-up number help that described playable counting activities as coming soon. LG-22 remains In progress with every acceptance criterion open; not committed or published.

## Phase 5 — Family break times

These cards add optional breaks configured by grown-ups, not timed learning challenges. Breaks block play inside Learning Garden; they do not lock the device or other apps. Schedule and duration are separate settings. Scheduling supports both fixed local clock times (for example lunch at noon) and intervals of active play (for example a stretch after 20 minutes). Implementation and release are tracked in [PR #9](https://github.com/asadler101/letter-garden/pull/9); physical-device/family sign-off remains LG-34.

### LG-31 — Configure named break times

**Status:** In progress (implemented; verification pending LG-34) · **Dependencies:** LG-02

**Story:** As a grown-up, I want to create breaks with a name and a picture so our family can plan potty, stretch, lunch, or other time away from the game.

**Acceptance criteria:**
- [x] Grown-up Settings can add, edit, enable/disable, and delete multiple break rules; breaks are optional and disabled until a grown-up configures them.
- [x] Each rule has a required custom display name with a reasonable length limit and safe text rendering.
- [x] Offer a curated emoji picker, including examples such as 🚽 potty, 🤸 stretch, 🍽️ lunch, 💧 water, and 🛋️ rest. A grown-up can choose the emoji independently of the name.
- [x] Each rule includes a configurable break duration and a schedule (LG-32); validate missing, zero/negative, or unsupported time values before saving.
- [x] Show a readable summary before saving, such as “🚽 Potty break — after 30 minutes of play, for 5 minutes.”
- [x] Persist rules in the browser save and compatible backups; editing breaks preserves all learning preferences, progress, missions, and collectibles.
- [x] Explain whether breaks are enabled and that these settings apply to this saved garden/browser.

**Out of scope:** Child accounts, syncing schedules to other devices, and operating-system parental controls.

**Implementation notes (November 19, 2026):** Configuration CRUD, separate draft/summary/save flow, bounded Unicode names, curated pictures, strict versioned backup validation, older-save defaults, invalid-local-data retention and failed-write rollback are implemented. Existing data stays intact. All 131 silent Node regressions, app/server syntax checks and diff checks pass. LG-32/LG-33 now provide runtime scheduling and full-window play pauses. Limited silent browser checks are recorded in [BREAK-CHECKS.md](BREAK-CHECKS.md); actual-device, full accessibility and family checks remain open. Not committed or published; shared definition-of-done checks remain open.

### LG-32 — Schedule when a break begins and ends

**Status:** In progress (implemented; verification pending LG-34) · **Dependencies:** LG-31

**Story:** As a grown-up, I want to configure when a break happens and how long it lasts so breaks fit our family’s routine.

**Acceptance criteria:**
- [x] Support a fixed device-local start time with selectable days (for example lunch at 12:00 for 30 minutes), and a recurring active-play interval (for example a stretch after every 20 minutes of play for 2 minutes).
- [x] Active-play intervals accumulate only while learning activities are visible and usable, including exploration; time in settings, collections, a break, or the background does not count as active learning play.
- [x] Remember accumulated active-play time across navigation/reload; a completed interval break resets only its own interval. Editing a rule explains any reset before it happens.
- [x] Calculate fixed-clock break windows from the saved schedule and device-local time; reopening during a scheduled window enters the break immediately. An elapsed window does not start a retroactive break.
- [x] A break already triggered by an active-play interval keeps its saved end time across reload/backgrounding; time away counts toward the break duration.
- [x] Handle windows crossing midnight and overlapping rules deterministically: play stays locked until every active window ends, with no brief unlocked gap or duplicate reset.
- [x] Re-evaluate schedules on opening, returning to the foreground, and time/day changes. Define and document behavior for local timezone and daylight-saving changes; do not claim tamper-proof clock enforcement.
- [x] Automated tests cover time boundaries, exact end times, overlap, midnight, reload, backgrounding, and independently configured intervals.

**Out of scope:** Push notifications while the website is closed, calendar integration, and server time/account services.

**Implementation notes (November 19, 2026):** Pure local-window/interval calculations, independent versioned runtime and strict backup validation are implemented. Navigation/settings/visibility/page lifecycle hooks checkpoint partial learning time; one-second checks re-evaluate clocks and overlaps. Configuration edits reset only changed signatures. Missing runtime initializes safely; invalid local runtime is retained with interval guidance. Storage failure retains in-memory timing with the existing save warning. README documents timezone/DST, backward clocks and bounded-gap policy. Automated scheduling regressions cover boundaries, midnight, overlaps, independent intervals, reload/background/settings, edits, invalid backups, failed writes and DST. LG-33 now locks throughout all active overlaps. Limited silent browser evidence and remaining device/family checks are recorded in [BREAK-CHECKS.md](BREAK-CHECKS.md). Not committed or published.

### LG-33 — Alert the child and pause play for the whole break

**Status:** In progress (implemented; verification pending LG-34) · **Dependencies:** LG-32

**Story:** As a family, we want a clear “break time” alert and no app play during its window so the child can take the planned break.

**Acceptance criteria:**
- [x] At break start, show a full-app, picture-led break screen with the configured emoji/name and a clear “It’s break time” message. Indicate when play becomes available again.
- [x] Give a gentle spoken alert when sound is enabled, using dependable generic narration for custom names; do not upload names for speech. Muted play still gives a clear visual alert, and reduced motion is respected.
- [x] Stop learning narration and pending automatic advancement; block activities, exploration, missions, rewards/reveals, decoration, and collections for the full active break window.
- [x] Enforce the lock before accepting learning/reward actions, not only with a dismissible overlay. Home/back navigation, reload, and stale answer/reward handlers cannot bypass it or earn progress during the break.
- [x] Preserve every earned flower and reward, plus mission/name progress, if a break interrupts an activity or reward screen. Unfinished rounds may restart safely after the break without credit or lost earned progress.
- [x] Child controls cannot dismiss the lock early. A clearly separated grown-up verification step permits schedule management or an explicit end/skip for the current occurrence, without disabling future breaks accidentally.
- [x] Keep the grown-up access and help reachable during a break. Disabling/deleting/editing a rule while it is active clearly explains its effect; skipping one overlapping break does not unlock other active breaks.
- [x] When the last active break ends, offer a large “Back to the garden” action; do not resume narration or answer submission unexpectedly.

**Out of scope:** Locking the phone/tablet, punitive feedback, and removing learning rewards for taking a break.

**Implementation notes (November 19, 2026):** Full-app break content, generic bundled narration, action-boundary enforcement and stale-handler invalidation are implemented. Audio/auto-next stop, earned state survives, and returning after the last break requires a deliberate tap. Grown-up verification protects settings opened before or during a deadline; its two-digit addition check is explicitly not a security PIN. Transactional occurrence skips preserve future rules and overlaps, survive reload/backup, and are excluded from interval accounting. Active-rule UI explains edit/disable/delete effects; malformed runtime guidance remains accessible. Every accepted synchronous child operation shares one timestamp to avoid nested-helper boundary races. The local audio server now serves only manifest IDs with existing range/path safeguards. All 160 silent Node regressions, JavaScript syntax and diff checks pass. Automated/DOM simulation is not actual-device or family evidence; LG-34 and the shared definition of done remain open. No commit or publication performed in this implementation stage.

### LG-34 — Verify break times across devices and saved progress

**Status:** In progress; automated and limited browser checks passed, physical/family checks not run · **Dependencies:** LG-31–LG-33

**Story:** As a family, we want breaks to be dependable on our devices without losing the garden or unexpectedly allowing play.

**Acceptance criteria:**
- [ ] Test actual iPhone, iPad, and laptop behavior for the alert, full-window lock, grown-up access, and returning to play; record device/browser versions and distinguish real devices from simulation.
- [ ] Verify mute, speech failure, portrait/landscape, reduced motion, keyboard/focus, and a long custom break name/emoji.
- [ ] Test scheduled and interval breaks when the app is opened/reloaded/backgrounded around the start/end boundaries, including midnight and overlap.
- [ ] Interrupt correct-answer feedback, automatic next-letter advancement, a fifth-flower celebration, visitor/decorations claims, a mission step, and name practice; nothing earned is lost or duplicated.
- [ ] Verify backup export/import with break rules and an active break. Missing old break fields mean no configured breaks; invalid schedules reject import without replacing the garden.
- [ ] Verify unavailable/failed storage produces clear grown-up guidance and a working in-memory break; do not claim persistence across reload if saving fails.
- [ ] Observe whether a willing family understands the name/emoji alert and can take and finish a break without treating it as punishment; record blockers without unnecessary child information.

**Verification notes (November 19, 2026):** [BREAK-CHECKS.md](BREAK-CHECKS.md) records 166 passing silent regressions, 204 WAV structural/content checks, targeted interruption coverage, limited silent browser observations, and the remaining physical checklist. Actual iPhone/iPad/laptop, listening, full accessibility and willing-family checks are NOT RUN; the acceptance checks above remain open. No physical-device or family sign-off is implied.

**Release gate:** Break times are ready for family use when blocking issues are fixed and this card’s results are recorded.

## Phase 6 — Seasonal garden fun

These are optional cosmetic and story experiences, not new learning rules or a seasonal sales system. Everyday Garden stays available. Families choose which holidays, if any, appear; the app does not infer beliefs, location, or family traditions. Theme changes never reset learning progress, take away earned items, or create pressure to play by a deadline. Calendar automation is optional; every theme can be chosen manually.

### LG-35 — Choose and control our garden theme

**Status:** Backlog · **Dependencies:** LG-02, LG-16

**Story:** As a grown-up, I want to choose our garden’s look and which seasonal or holiday themes appear so the experience fits our family.

**Acceptance criteria:**
- [ ] Grown-up Settings offers picture previews of Everyday Garden and available themes, with clear selection, confirmation, and an easy return to Everyday.
- [ ] Default to Everyday Garden; seasonal changes and holiday content are opt-in. Show only the holiday themes the grown-up has enabled.
- [ ] Offer a fixed manually chosen theme or optional automatic seasonal/holiday changes. A manual choice stays fixed until changed; automatic mode explains when and why the next change occurs.
- [ ] In automatic mode, use explicit grown-up choices for seasonal calendar/hemisphere and eligible holidays rather than location tracking. Define overlapping holiday/season priority and show it in settings.
- [ ] Automatic holiday windows use a documented, reviewed calendar for the supported year/region; do not assume every holiday has a fixed Gregorian date. If a date is unavailable, leave manual selection available instead of guessing.
- [ ] Save theme preferences and enabled holidays in the browser and compatible backups. Older saves start with Everyday; invalid imported theme settings cannot replace the existing garden.
- [ ] Choosing a theme preserves flowers, visitors, decorations/placements, buddy, mission/name progress, practice history, and break rules. A theme does not bypass an active break.
- [ ] The theme is applied consistently to home, both subjects, learning screens, My Garden, celebrations, and the break screen without changing answers or navigation.

**Out of scope:** Location permission, inferred religion/culture, paid theme packs, and changing device settings.

### LG-36 — Enjoy four seasonal gardens

**Status:** Backlog · **Dependencies:** LG-35

**Story:** As a little learner, I want a garden that can look like spring, summer, autumn, or winter so familiar learning feels fresh and playful.

**Acceptance criteria:**
- [ ] Provide Spring Blossoms, Summer Sunshine, Autumn Leaves, and Winter Snow as distinct picture-led seasonal themes.
- [ ] Use gentle garden art, backgrounds, and accents: blossoms/butterflies, sunshine/picnic details, leaves/acorns, and snowflakes/cozy details. Do not imply that every family’s local weather matches the theme.
- [ ] Keep letters, numerals, countable groups, answer states, prompts, and touch targets clear; decorative objects cannot be mistaken for objects in a counting question.
- [ ] Seasonal animations are subtle, do not cover controls, and stop under reduced motion; avoid flashing or automatically playing background music.
- [ ] Season selection and automatic transitions work through LG-35 without restarting an activity, interrupting narration, or changing rewards.
- [ ] All four seasons can be selected outside their calendar dates. No attendance, streak, countdown, or deadline is needed to enjoy them.

### LG-37 — Visit optional holiday gardens

**Status:** Backlog · **Dependencies:** LG-35

**Story:** As a family, we want optional holiday looks that we can choose and revisit without being expected to celebrate every holiday.

**Acceptance criteria:**
- [ ] Include separate manually selectable Halloween, Thanksgiving, Christmas, Hanukkah, and Lunar New Year themes with a preview and grown-up enable/disable control for each.
- [ ] Give each theme its own reviewed visual identity rather than treating different holidays as interchangeable. Begin with friendly pumpkins/costumes; a harvest/gratitude garden; festive trees/lights; a Hanukkah lights garden; and Lunar New Year lantern/garden details.
- [ ] Review holiday names, symbols, written/spoken labels, and any year-specific imagery for accuracy and age suitability before release; explicitly define the supported tradition/region where it matters.
- [ ] Keep Halloween gentle: no frightening surprises, jump scares, threatening characters, or flashing effects. Keep all holidays free from purchase prompts and pressure to participate.
- [ ] No holiday is enabled automatically merely because a device date matches it. Automatic changes apply only to the grown-up’s enabled choices through LG-35.
- [ ] Show holiday art as scenery; it cannot obscure learning content or add ambiguous objects to a counting group.
- [ ] Themes remain available for manual revisits after their calendar window ends. Turning a holiday off immediately restores an allowed theme without affecting progress.

**Out of scope:** Teaching religious practice, claiming every family celebrates the same way, and expanding the initial holiday set without a new content review.

### LG-38 — Collect and keep themed garden surprises

**Status:** Backlog · **Dependencies:** LG-12–LG-15, LG-36, LG-37

**Story:** As a little learner, I want visitors and decorations that match my garden’s theme and remain mine when the season changes.

**Acceptance criteria:**
- [ ] Define a small reviewed catalog of cosmetic visitor/decoration variants for the initial themes, such as a butterfly with spring blossoms, autumn mushroom details, or a cozy winter birdhouse; show clear picture previews and spoken labels.
- [ ] Start with variants of existing visitor/decoration types and stable identifiers. Distinguish the owned base item from its unlocked cosmetic looks; do not duplicate one unique decoration into multiple placement spots.
- [ ] Use the normal completed-patch reward flow: one visitor reveal and one decoration choice per earned patch, with no extra flowers, currency, or duplicate reward grants caused by switching themes.
- [ ] Save the exact earned/pending reward and variant options when the reward is granted. Changing the theme, reloading, or crossing a calendar boundary cannot reroll or replace an unopened reward.
- [ ] Unlocked variants stay owned, visible in collections, and usable after switching back to Everyday or turning a holiday off. New holiday art respects the grown-up’s enabled content settings; a disabled holiday’s look can be hidden without deleting ownership.
- [ ] Existing placements survive theme changes; moving/swapping a decorated item remains tap-based and preserves its selected look.
- [ ] No “last chance” countdowns or expiring earned rewards. Themes and unclaimed rewards can be revisited without needing to play on a holiday.
- [ ] Backup/import and old-save migration preserve inventory, pending rewards, ownership, and placements without duplicate claims.

**Out of scope:** Rarity tiers, collectible trading, paid currency, and a new reward economy.

### LG-39 — Play little seasonal and holiday missions

**Status:** Backlog · **Dependencies:** LG-18, LG-36, LG-37

**Story:** As a little learner, I want short themed adventures that give my familiar letter and number games a fun setting.

**Acceptance criteria:**
- [ ] Include one three-success mission for each season and each initial holiday. Define and review every mission’s title, picture steps, narration, and existing activity sequence before implementation.
- [ ] Use gentle setups such as Help the Spring Garden Bloom, Pack a Summer Picnic, Gather Autumn Leaves, Help a Winter Bird, Find Friendly Pumpkins, Share a Harvest Picnic, Decorate a Festive Tree, Light Up a Hanukkah Garden, and Welcome the New Year with Lanterns.
- [ ] Reuse existing learning activities and honor grown-up letter, number, sound, and theme/holiday settings; do not require reading or introduce unreviewed new learning rules.
- [ ] Each successful learning round earns one normal flower and advances the mission once. Completing a themed story adds an ending, not duplicate flower credit or a new reward currency.
- [ ] Only one mission is active. Choosing another theme cannot silently replace an active mission; show a clear resume/rest choice and retain the grown-up abandonment control.
- [ ] Persist the exact story and step across reload, garden completion, and theme/date changes. If its holiday is disabled, explain the grown-up choices without erasing progress silently or exposing disabled holiday art.
- [ ] Keep missions available for replay without deadlines or consecutive-day requirements. Active breaks pause missions normally.

### LG-40 — Keep themed play clear, calm, and accessible

**Status:** Backlog · **Dependencies:** LG-36–LG-39

**Story:** As a family, we want the fun scenery to remain easy to understand and comfortable on every supported screen.

**Acceptance criteria:**
- [ ] Every theme preserves readable prompts, recognizable letters/numerals, large touch targets, visible focus, and answer feedback understandable without color alone.
- [ ] Countable learning objects remain clearly separated from theme scenery and decorations; verify every quantity layout up to the configured limit of ten.
- [ ] Spoken labels/setups are understandable and use the established single narration channel. Theme changes do not interrupt a prompt or celebration; mute and audio-failure guidance remain usable.
- [ ] Honor reduced motion and sound-off play; no essential instruction depends on animation, a flashing effect, or background audio.
- [ ] Theme assets work in offline-file play and have graceful fallbacks when an image/emoji is unavailable. Keep asset loading bounded so a theme does not fetch every other theme unnecessarily.
- [ ] Long labels, narrow/landscape layouts, settings dialogs, and the full break lock remain usable in all themes.
- [ ] Switching themes never changes the learning target, re-enables an answered card, awards a flower, or bypasses a break. Automated tests cover these invariants and malformed imported theme/variant fields.

### LG-41 — Verify seasonal fun with families and real devices

**Status:** Backlog · **Dependencies:** LG-35–LG-40

**Story:** As the product owner, I want evidence that themes feel fun and optional without harming learning, reliability, or family choice.

**Acceptance criteria:**
- [ ] Record actual iPhone, iPad, and laptop results for seasonal/holiday selection, readable activities, sound, collections, and narration; distinguish device observations from automated/viewport checks.
- [ ] Verify manual selection, enabled/disabled holidays, supported automatic date windows, overlapping windows, hemisphere preferences, and reopening after a calendar change.
- [ ] Reopen during a themed reveal, decoration choice/placement, mission step, name round, and break window; earned rewards and learning progress are neither lost nor duplicated.
- [ ] Export/import a themed garden and migrate a pre-theme save; missing theme fields default to Everyday, while invalid data leaves the current garden unchanged.
- [ ] Try reduced motion, mute, missing assets, offline-file play, and phone/tablet portrait and landscape with theme scenery enabled.
- [ ] Ask willing families whether themes are welcoming, age-appropriate, understandable, and easy to opt out of; gather minimal anonymous feedback without inferring beliefs or collecting unnecessary child information.
- [ ] Record content-review results and fix blocking cultural, accessibility, audio, layout, and save issues before marking theme work Done.

**Release gate:** Seasonal garden fun is ready when the supported themes have reviewed content and blocking verification issues are resolved.

## Future learning proposals — refine before scheduling

### LG-23 — Explore shapes

**Status:** Future proposal · **Dependencies:** Shared subject navigation and reward flow

**Story:** As a little learner, I want to recognize and match shapes in a new garden area.

**Candidate acceptance criteria:**
- [ ] Start with Circle, Square, Triangle, and Rectangle.
- [ ] Offer spoken shape finding and matching with visual examples that do not rely on color.
- [ ] Successful rounds use the existing shared flower/reward system.
- [ ] Decide the exact activity set and parent controls before moving this card to Backlog.

### LG-24 — Explore colors

**Status:** Future proposal · **Dependencies:** Shared subject navigation and reward flow

**Story:** As a little learner, I want to explore colors through familiar garden objects.

**Candidate acceptance criteria:**
- [ ] Agree on a small starter palette and narration before implementation.
- [ ] Offer relaxed exploration and spoken color-matching activities.
- [ ] Keep navigation, instructions, and feedback understandable without color alone.
- [ ] Confirm an appropriate supported experience for children who cannot distinguish particular colors.

### LG-25 — Finish a simple pattern

**Status:** Future proposal · **Dependencies:** Shape/color content decisions

**Story:** As a little learner, I want to notice what repeats and choose what comes next.

**Candidate acceptance criteria:**
- [ ] Begin with simple AB patterns using distinguishable pictures or shapes.
- [ ] Show the repeating sequence and two large choices, with a replayable spoken prompt.
- [ ] Offer unlimited hints and retries; one solved sequence earns one flower.
- [ ] Keep more complex patterns outside the first version.

### LG-26 — Explore early letter sounds

**Status:** Future proposal · **Dependencies:** Existing letter games and reviewed narration

**Story:** As a little learner, I want to connect letters with beginning sounds and familiar words.

**Candidate acceptance criteria:**
- [ ] Define a small sound set and review it with an early-literacy educator before recording.
- [ ] Distinguish letter names from letter sounds clearly.
- [ ] Use carefully chosen examples and recordings; address letters with multiple common sounds explicitly.
- [ ] Keep spelling, reading assessment, and broad phonics claims outside the initial scope.

## Future commercial proposals — not part of current development

No paywalls, checkout, store enrollment, or account system is authorized by this roadmap. Prices are hypotheses to validate, not commitments. Recheck platform rules when these cards become active.

### LG-27 — Validate the paid offering

**Status:** Future proposal · **Dependencies:** LG-22

**Story:** As the product owner, I want to learn what parents value enough to buy before building billing.

**Candidate acceptance criteria:**
- [ ] Gather parent feedback on the free starter versus a complete paid experience.
- [ ] Test one-time unlock pricing concepts; record feedback rather than projecting guaranteed revenue.
- [ ] Define exactly which content is included and what future expansions would mean.
- [ ] Choose whether to proceed, and explicitly approve the next commercial cards.

### LG-28 — Prepare a polished iOS app

**Status:** Future proposal · **Dependencies:** LG-22, LG-27 and explicit approval

**Story:** As a parent, I want a dependable app that installs easily and plays offline.

**Candidate acceptance criteria:**
- [ ] Select an implementation approach that delivers an app-like experience, not merely a remote website frame.
- [ ] Bundle core learning content/audio and verify offline play, interrupted audio, saves, and upgrades on real devices.
- [ ] Prepare support/privacy information, age/category settings, and accessible parent controls.
- [ ] Review current Apple requirements and complete beta testing before submitting; store approval is not assumed.

### LG-29 — Offer one parent-controlled iOS unlock

**Status:** Future proposal · **Dependencies:** LG-27, LG-28 and explicit approval

**Story:** As a parent, I want to understand and buy the full game once, then recover my purchase if I reinstall it.

**Candidate acceptance criteria:**
- [ ] Define the free starter and a clearly described non-consumable full-game purchase.
- [ ] Keep purchase opportunities in the grown-up area with the required parental gate.
- [ ] Verify purchase, cancellation, pending state, restoration, and refunds with the platform purchase system.
- [ ] Distinguish restored purchase access from restored gameplay progress; neither is falsely promised to include the other.
- [ ] Paid ownership never depends only on an editable browser flag.

### LG-30 — Consider paid web access and cross-device saves

**Status:** Future proposal · **Dependencies:** LG-27 and an explicit decision that web demand warrants accounts

**Story:** As a parent, I want paid access and, if offered, a recoverable garden across devices.

**Candidate acceptance criteria:**
- [ ] Move commercial web hosting to an appropriate service; source can remain on GitHub.
- [ ] Use a parent account, verified purchase ownership, and secure server-side records for paid access.
- [ ] Define whether web and iOS purchases unlock the same content; review current store rules before promising cross-platform access.
- [ ] Treat progress syncing as an explicit feature with conflict handling, recovery, and deletion controls.
- [ ] Keep children's information minimal and complete the applicable privacy review before introducing accounts or uploads.

**Out of scope until separately approved:** Subscriptions, advertising, social features, and school licensing.

## Shared definition of done

For every implemented story:

- [ ] Acceptance criteria have been checked; material limitations are recorded.
- [ ] Touch targets are generous; reading is not required for core child actions.
- [ ] Phone portrait/landscape, tablet, and laptop layouts fit without horizontal clipping; long settings remain scrollable.
- [ ] Sound-off play works; audio starts from an intentional tap, respects mute, and does not overlap or double-play.
- [ ] Development and automated testing stay silent; use `?silent=1` for browser checks.
- [ ] New spoken content is checked for correct names/counts and has a dependable recording or documented fallback.
- [ ] Reduced-motion and keyboard/focus behavior remain usable.
- [ ] Saves, reloads, repeated taps, and interrupted rewards preserve progress without duplicate credit.
- [ ] Relevant regression checks pass; actual-device results are distinguished from simulation.
- [ ] Documentation and story status are updated, and the deployed change is verified when publication is in scope.

## Decisions to revisit, not blockers for the next release

- Final visual identity for Learning Garden; do not rename the repository or URL automatically.
- Whether parents later need multiple local child profiles; the first releases retain one garden per browser.
- Additional voices/languages and educational review of future phonics content.
- Reward pacing after observing families use both visitors and decorations.
- Automatic cross-device syncing and monetization only after explicit prioritization.
