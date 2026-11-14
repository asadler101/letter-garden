# LG-09 device verification record

Date: November 13, 2026. Target: current local, uncommitted LG-03–LG-08 implementation. Phase 1 release gate: **OPEN**.

## Evidence and limits

- **PASS — terminal, silent:** `node --check app.js`, `node --check server.js`, `node --test tests/audio.test.js` (44/44), and `git diff --check`.
- The suite validates all 176 bundled WAV files as non-silent PCM and exercises mocked audio lifecycle, rapid counting, mute/fallback, save migration/reload, mixed patch completion, duplicate credit prevention and backup validation/round-trip. It does not listen to narration or exercise device playback, touch hardware, real browser storage, native share or file pickers.
- **Prior parent-agent in-app browser observations:** see LG-03–LG-08 implementation notes in [STORIES.md](STORIES.md). Desktop and simulated phone checks, download and selected navigation/count/help observations are limited to those recorded steps. No additional browser checks were performed for this record. Viewport simulation is not actual-device evidence.
- **NOT RUN — actual iPhone, tablet and touchscreen laptop:** no physical devices or device/browser version evidence are available to this verification task. First-tap playback, app interruption/resume and native iPhone Files/share flows therefore remain blocked. Do not mark LG-09 Done or Phase 1 released from the automated results.

## Run record

Use a separate row for each device/browser/orientation. Record exact model, OS/browser versions, tested revision or local snapshot, URL/build, date, tester, result and issue/evidence links. Empty or NOT RUN cells are not passes. Use a disposable browser profile or download a backup before migration/import replacement tests; retain the original backup.

| Device / OS / browser versions | Orientation / input | Revision / URL / date / tester | Audio / interruption | Layout / navigation | Save / rewards | Backup | Evidence / issues |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Actual iPhone — not supplied | Portrait + landscape / touch | Not supplied | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Hardware unavailable |
| Actual tablet — not supplied | Portrait + landscape / touch | Not supplied | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Hardware unavailable |
| Actual touchscreen laptop — not supplied | Touch + keyboard | Not supplied | NOT RUN | NOT RUN | NOT RUN | NOT RUN | Hardware unavailable |

## Device checklist

Run on the actual iPhone, then repeat applicable steps on tablet and touchscreen laptop. For audible checks use normal play in a willing tester's device session; `?silent=1` intentionally suppresses sound and cannot verify audio. Keep development/browser simulation silent.

1. **All activities and ranges:** open Find a number, Count with me and How many do you see through Number Garden; test both 1–5 and 1–10. Verify correct prompts/counts, three distinct choices where applicable, gentle wrong answers, and one flower per completed round. Try all three existing letter activities as regression coverage; picnic awards no flowers.
2. **First tap and rapid taps:** after a fresh load, tap each activity and replay/help. Confirm audio begins from intentional taps, is intelligible and does not overlap. Rapidly tap distinct counting objects, duplicate objects, answers and Next; each object counts once, count audio stays understandable, and rewards never duplicate. Replay quantity help after counting all objects: no extra flower or changed choices.
3. **Mute and app return:** switch sound off during playback/queued counts; confirm immediate silence and sufficient visual prompts. Leave for another app during narration and a partial round, then return. Confirm usable replay, no stale audio/reward, and retained earned progress. Repeat muted; re-enable sound and replay once.
4. **Fit and access:** check home, both subject menus, every activity, five-flower celebration and all settings in each listed orientation/input. At range 1–10, objects stay distinct/countable. No horizontal clipping; bottom settings/import controls remain reachable by scrolling. Check browser text enlargement, visible keyboard focus, dialog close/return focus and reduced-motion preference. Record any platform-specific limits.
5. **Migration and mixed rewards:** in a disposable test profile, load a representative old `letter-garden` save with custom/lowercase letters, sound preference and flowers; confirm migration retains them and numbers default to 1–5. Earn a five-flower patch using both subjects; confirm one celebration. Close/reopen the browser with a partial round, after an earned flower, at the completed patch and after replanting. Earned progress/settings persist; partial counting may restart without credit; reopening never repeats a reward. Replant retains the lifetime total.
6. **Valid backup on iPhone and laptop:** export current progress; on iPhone exercise Share backup file → Save to Files where available, and Download backup; on laptop exercise download. Locate the actual JSON using the device file UI, import it, verify the summary and cancel once (no changes), then confirm replacement. Check flowers, completed patch, letter settings, sound and number range after reopening. Test transfer to another device using the exported file. Record unsupported share capability explicitly rather than claiming a native-share pass.
7. **Rejected backup on both devices:** import malformed JSON, unsupported version (e.g. `{"version":99}`), and an invalid garden/range. Confirm a useful error, no replacement summary/confirmation of invalid content, and unchanged flowers/settings after reopening. Cancel the file picker once and confirm play remains usable.

For every failure record reproduction steps, expected/actual behavior, severity and device/build. Fix blockers and rerun affected cases. LG-09 passes only with recorded actual-device evidence for every acceptance criterion and no unresolved blocking issue.


## Follow-up: narration and letter flow

NOT RUN on actual iPad: compare Automatic / Device voice / Original recordings using Try this voice; confirm intelligibility, first-tap playback, repeat audio, mute, and rapid counting with each mode. Check Big & Little with and without a buddy in iPad landscape with Safari browser bars visible: answers, feedback, and flower strip should stay visible without scrolling. Correct letter answers should advance after narration; muted answers after a short pause. Verify leaving/settings/backgrounding/replay cancels automatic advancement, no duplicate flower is awarded, and flower five stops at the garden celebration. Browser controls were unavailable during implementation; layout has not been visually confirmed for this follow-up.
