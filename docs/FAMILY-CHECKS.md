# LG-22 family experience check record

Date: November 13, 2026. Target: current local, uncommitted LG-03–LG-21 snapshot. **LG-22 In progress; family readiness gate OPEN.** No family or actual-device sessions have been run for this record. Automated checks cannot satisfy the observation criteria. See [device checks](DEVICE-CHECKS.md) for detailed audio, migration and backup procedures.

## Consent and minimal records

Invite several willing families through the product owner; participation is optional. Explain the observation, ask the grown-up's permission and the child's willingness before starting, and stop immediately when either wants to stop. No recruitment, contact, survey delivery or recording is performed by the game or this task. Do not capture children's names, birthdays, contact details, photos, video, voice, exported saves or identifying quotations. Use invented names for name-practice checks. Keep only anonymous session IDs, device/build details, observed actions, amount of help, brief paraphrased parent feedback and issue references. Do not copy a personal name or backup into an issue. Parents retain their own backup locally before replacement/reset checks. Use disposable test profiles for destructive test setup.

## Device and session record

Create one row per actual device, browser, orientation and session. Fill exact model, OS/browser versions, tested commit or local snapshot identifier, URL/file path, date, anonymous session ID and consenting adult confirmation. NOT RUN and blank fields never mean pass.

| Session / consent / date | Device model / OS / browser versions | Build / URL or local file | Orientation / input | Result / evidence |
| --- | --- | --- | --- | --- |
| F01 / NOT RUN / not supplied | Actual iPhone / not supplied | Not supplied | Portrait + landscape / touch | NOT RUN — willing family/device unavailable |
| F02 / NOT RUN / not supplied | Actual tablet / not supplied | Not supplied | Portrait + landscape / touch | NOT RUN — willing family/device unavailable |
| F03 / NOT RUN / not supplied | Actual laptop / not supplied | Not supplied | Touch where supported + keyboard | NOT RUN — willing family/device unavailable |

## Child picture flow and parent feedback

Let the child try without reading the screen aloud first; offer help when requested or frustrated. Record independent / picture or spoken cue / adult help / stopped for each step, plus what confused or pleased them. Avoid interpreting successful taps as learning mastery.

1. From home, choose Letter Garden or Number Garden by picture, choose an activity, replay guidance, make an incorrect attempt and recover. Include all activities across sessions, both number ranges, free picnic exploration and optional buddy/skip.
2. Finish five discoveries across both subjects. Check one flower per successful round, no credit for repeated taps/help/picnic, and a single patch celebration. Let the child choose when to continue.
3. Find and open a visitor gift, return to the collection, choose a decoration and place/move/return it in My Garden. Check pending gifts remain findable when deferred and both subjects return to the shared garden.
4. Try each of the three named missions and optional name practice using an invented name. Observe story pictures, continue/replay, help and returning to free play. Check that an unfinished mission waits while free play and name practice remain available.
5. Let the child rest or stop at any point without pressure. Reopen later and find earned progress and pending choices. Ask the parent whether subjects, rewards, stopping, local saves/backups and the participation summary are understandable; capture a short paraphrase and desired change. Review scope clarity before considering future commerce; this check adds no commerce features.

| Session / build / device row | Subject → patch → rewards → stop help levels | Parent feedback (anonymous paraphrase) | Scope understandable? / follow-up issue |
| --- | --- | --- | --- |
| F01 / not supplied | NOT RUN | NOT RUN | NOT RUN |
| F02 / not supplied | NOT RUN | NOT RUN | NOT RUN |
| F03 / not supplied | NOT RUN | NOT RUN | NOT RUN |

## Device modes

For each device record PASS/FAIL/NOT RUN and an issue or brief observation per case. Use normal playback only in a willing tester's session; silent development cannot verify listening.

| Case | Procedure and expected observation | Result / device-version row / evidence |
| --- | --- | --- |
| First tap, rapid taps, app return | Follow DEVICE-CHECKS audio procedure in every activity and reward/story narration; no overlap, stale audio or extra credit after app switch. | NOT RUN / not supplied |
| Sound off | Mute during narration and queued counts; immediate silence, sufficient visual prompts, understandable rewards/stories, then intentional replay after unmute. | NOT RUN / not supplied |
| Reduced motion | Enable OS preference before loading; exercise buddy, hints, patch, reveals, collection, placement and mission ending; observe calm usable feedback. | NOT RUN / not supplied |
| Fit and keyboard | Phone/tablet both orientations; laptop keyboard and touch if supported; check all screens/settings, enlarged text, visible focus, modal close/return and reachable bottom controls. | NOT RUN / not supplied |
| Offline local files | Copy index.html plus app.js, style.css and complete audio folder together. Open the local index.html with networking disabled; exercise both subjects, all reward/mission stages, mute and reopen. Record file URL support, audio/storage availability and any warning. Do not confuse cached online play with this check. | NOT RUN / not supplied |
| Files and backups | Actual iPhone Files/share and laptop download/import, cancel and rejected files, then valid replacement in disposable profile; check name privacy and complete progress. See DEVICE-CHECKS. | NOT RUN / not supplied |
| Parent controls | Check independent settings, invented name save/remove, local practice-summary explanation, history-only clear/cancel and preserved garden/rewards; retain backup first. | NOT RUN / not supplied |

## Interruption matrix

For **each checkpoint below**, record separate app-switch/return and close/reopen results on every device. Also leave via Home/Rest where offered. Save a before/after count of lifetime/patch flowers, pending/opened visitor receipts, pending/claimed decoration receipts, placement and mission/name position, without copying a personal name. Earned progress must persist exactly once; deferred choices remain pending, saved decoration options remain the same, stopping is free, and replay never repeats credit. Partial counting may restart without credit. Report storage-unavailable behavior explicitly rather than claiming durable saves.

| Checkpoint | Expected after reopening | App return / reopen / device-version row |
| --- | --- | --- |
| Flower 1–4; immediately after flower 5; celebration before rest/replant; after each action | One credit per round; completed patch waits; lifetime total and both reward receipts retained. | NOT RUN / NOT RUN / not supplied |
| Visitor unopened; immediately after reveal; collection greeting; after return | Same pending receipt or one saved reveal, no repeated gift/flower. | NOT RUN / NOT RUN / not supplied |
| Decoration pending before offer; saved two-option offer; after label preview; immediately after claim; after return | Same offer before claim; one claim afterward; visitor reward independent. | NOT RUN / NOT RUN / not supplied |
| Decoration selected but unplaced; placed; moved/swapped; returned | Saved arrangement retained; no new reward; transient selection may clear. | NOT RUN / NOT RUN / not supplied |
| Each named story: intro, steps 1/2/3 before continue, partial activity, after success before Next, ending before leave, replay start | Correct saved next step/ending, partial round may restart without credit, replay begins at zero mission steps while lifetime rewards remain. Repeat all three stories. | NOT RUN / NOT RUN / not supplied |
| Generic mission: start, discoveries 1/2/3, rest/resume, completed mission replay | Saved markers, one normal flower each, no completion bonus. | NOT RUN / NOT RUN / not supplied |
| Mission crosses fifth flower at each possible step; rewards deferred, revealed or claimed before resuming | Replant resumes next saved mission step; independent gifts neither lost nor duplicated. | NOT RUN / NOT RUN / not supplied |
| Name practice: partial position, final position, fifth-flower interruption, completion and replay | Next saved position/completion; final position has one normal flower, no bonus; mission remains waiting. | NOT RUN / NOT RUN / not supplied |

## Evidence, issues and decision

Silent Node tests already cover save migration/validation, all learning activities, duplicate/stale handlers, reward receipts/offers/claims and write rollback, placements, mission stages/replay and patch crossings, name progress, bounded history and backup round-trips. These use mocked browser/audio/storage; they establish neither real-family understanding nor real-device playback, file access, persistence or interruption behavior. No extra implementation-mirroring tests were added for this documentation pass. Final silent verification: `node --test tests/audio.test.js` passed 110/110 with zero failures/skips, including all 203 bundled non-silent PCM WAV integrity checks. `node --check app.js`, `node --check server.js` and `git diff --check` passed. No audio was played and no actual hardware result is inferred.

Prior parent-agent silent in-app browser observations: at 1265×712, parent controls showed optional name/privacy, independent number range, history explanation and backup controls. Draft `Ana <3` displayed literally with A·N·A preview and unsupported-character guidance. Escape closed settings and returned focus to Grown-ups; reopening showed an empty unsaved draft and unchanged 11 flowers. Mission chooser showed all three named story cards and generic activity buttons. No story was started there; these are limited desktop observations, not family or device evidence.

| ID / severity | Reproduction or missing evidence | Expected / actual | Status / retest |
| --- | --- | --- | --- |
| F-B01 / readiness blocker | Willing-family sessions and anonymous feedback | Several observed family flows / none available | OPEN — NOT RUN |
| F-B02 / readiness blocker | Actual devices, offline file, listening, reduced motion, mute and full interruption matrix | Recorded device/version results / unavailable | OPEN — NOT RUN |
| F-I01 / copy issue | Grown-up number help called counting activities “coming soon” although both are playable | Explain all three available activities / stale readiness copy | FIXED locally; syntax/diff checks below; family comprehension NOT RUN |

For new issues record anonymous session ID, device/version/build, exact steps, expected/actual behavior, severity, affected checkpoint, fix reference and rerun evidence. Blocker means lost/duplicated progress, unusable navigation/play or a required flow that cannot finish; address blockers and rerun affected cases. Product owner reviews anonymous feedback, scope clarity and all required results before closing LG-22. Acceptance boxes remain unchecked until those actual observations exist. No commit, publication or release is implied.
