# LG-34 break verification record

November 19, 2026 · local LG-31–LG-34 implementation · release verification **OPEN**.

## Evidence and limits

- **PASS — silent Node simulation:** 166 tests, including all 204 manifest WAV files checked for RIFF/WAVE structure and non-silent samples. Mocked audio checks never play sound. Coverage includes fixed/interval boundaries, midnight/DST, independent overlaps, foreground/reload, partial active-play accounting, invalid backups/runtime, storage failures, adult verification and transactional occurrence skips. Syntax and diff checks pass.
- **PASS — targeted interruption simulation:** queued counting audio and a pending automatic next-letter timer stop; fifth-flower receipts survive lock/reload and can each be claimed once afterward; earned name/mission progress survives; detached visitor/decoration/placement/mission handlers cannot mutate at a break deadline; a previously reviewed import cannot bypass a newly required adult check. These are JavaScript/DOM mocks, not browser or hardware observations.
- **PASS — limited parent-agent browser observations:** local HTTP preview on port 4174 with `?silent=1`. Enabled a five-minute clock rule named `QA Lunch <break>` with 🍽️; its deadline closed settings and replaced play. Home/reload stayed locked. Incorrect adult answer 0 was rejected; 23+82=105 opened settings. End only this occurrence, Close and manual Back returned home; reload retained 10 flowers, one pending visitor and one pending decoration. Literal custom-name rendering, a 25-minute interval/three-minute duration draft summary and Cancel were checked. Settings measured 337 pixels wide inside simulated 390 pixels and scrolled vertically. A scaled screenshot was inconclusive for complete visual inspection.
- **PASS — additional limited browser observations:** temporary two-minute clock rule `Stretch time` with 🤸 displayed a prominent configured emoji, name, end time and Hear break time button. Simulated 390×844 screenshot showed the alert and grown-up control fitting; DOM body width/scroll width were both 390, emoji box height 111. Simulated 844×390 landscape had scroll width 829 with vertical scrolling and no horizontal overflow. Adult check 25+24=49 opened settings; deleting the rule, closing settings and manual Back retained the same flowers/pending gifts. Temporary rules were removed. Viewport simulation is not physical-device evidence. Silent mode means neither alert nor learning narration was heard.
- **NOT RUN:** actual iPhone/iPad/laptop hardware, audible first-tap/replay/failure behavior, full keyboard/focus and reduced-motion checks, offline-file behavior, native backup/share, and willing-family observations. No device/browser versions or family feedback were supplied. These limits keep LG-34 open.

## Physical run record

Record actual model, OS/browser versions, orientation/input, tested commit/build/URL, date/tester and evidence per run. Use a disposable profile or preserve an exported backup before replacement tests. NOT RUN is not a pass.

| Actual device | Model / OS / browser / build / tester | Alert / lock / adult access / return | Interruption / rewards / backup | Layout / accessibility / family feedback |
| --- | --- | --- | --- | --- |
| iPhone | Not supplied | NOT RUN | NOT RUN | NOT RUN |
| iPad | Not supplied | NOT RUN | NOT RUN | NOT RUN |
| Laptop | Not supplied | NOT RUN | NOT RUN | NOT RUN |

## Remaining checklist

1. On each actual device, create a named emoji clock rule and an interval rule. Test just before/start/end, opening/reloading/backgrounding across a deadline, midnight and overlaps. Every active window must finish or be individually ended by the grown-up before manual return. Reload retains partial active-play time without counting time away.
2. Hear first-tap/replay alert, mute immediately, simulate unavailable speech/recording and retry. Custom names are displayed only. Check portrait/landscape, long Unicode name/emoji, text enlargement, reduced motion, keyboard access and dialog return focus; scrolling must keep all controls reachable.
3. Interrupt correct feedback, pending automatic next, queued counting, flower five, visitor reveal, decoration choice/placement, mission and name round. Reload during the break and after returning. Earned flowers/progress/receipts persist once; stale callbacks cannot mutate or resume narration. Partial unfinished rounds may restart.
4. Test the adult gate with settings already open, wrong/correct answers, closing/reopening and a second overlapping occurrence. End only one occurrence, reload and verify other windows still lock and future schedules remain configured. Editing/disabling/deleting explains its effect.
5. Export/import an active clock/interval break and skipped occurrence; restore after reload. Old backups without break fields have no rules; malformed rules/runtime/receipts cannot replace the garden. Try an import reviewed before a deadline. Exercise actual file pickers/share separately from automation.
6. With storage unavailable or writes failing, verify parent guidance, working in-memory lock and failed-skip rollback. Do not expect persistence after a failed write. Restore storage and repeat affected steps.
7. With a willing family, observe whether the picture/name and manual return are understood and calm. Record anonymous blockers and expected/actual behavior without unnecessary child details. Fix blockers and rerun before LG-34 is Done.

See [device checks](DEVICE-CHECKS.md) and [family checks](FAMILY-CHECKS.md) for broader release gates.