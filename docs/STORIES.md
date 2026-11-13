# Learning Garden — roadmap and story cards

Updated: November 13, 2026

## How to use this backlog

This is the source of truth for planned work. Keep Markdown only for now; do not create GitHub Issues until requested. Stable LG identifiers can later become issue titles, for example `LG-05: Find a number`.

- **Backlog:** described and ready for refinement; not implemented.
- **In progress:** actively being built; normally one card at a time.
- **Done:** acceptance criteria and the shared definition of done have passed.
- **Future proposal:** an idea to revisit, not a commitment or permission to implement it.

Move one card to In progress, build its smallest complete experience, verify the criteria, then mark it Done and link its commit or pull request. Checkboxes below are acceptance checks, not a claim that work is complete. Dependencies specify what must be ready first; independent cards can be reordered.

The repository and public URL retain **Letter Garden**. LG-01 introduces **Learning Garden** product branding. Repository and URL renaming are outside that card.

## Product direction

A calm learning game for ages roughly 3–5, built for touch and spoken guidance. Children learn through discoveries, gentle hints, and creative choices. Parents control practice settings. Monetization is future state.

- Learning Garden contains **Letter Garden** and **Number Garden**.
- One buddy, flower patch, visitor collection, and decorated garden are shared across subjects.
- Five successful learning rounds grow five flowers and complete a garden.
- One round earns at most one flower, including a round with several counting taps. Incorrect attempts never remove progress.
- Free exploration remains available and does not award flowers merely for repeated taps.
- No timers, streak pressure, competitive leaderboards, purchasable reward currency, or punishment for stopping.
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

**Status:** Backlog · **Dependencies:** None; required before new progress-producing features ship

**Story:** As a family, we want updates and new activities to preserve the garden we already grew.

**Acceptance criteria:**
- [ ] A versioned browser save holds shared garden progress plus separate letter and number preferences.
- [ ] Existing saves migrate without losing flowers, sound preferences, custom letters, or a completed patch.
- [ ] Future visitor, decoration, mission, and name fields can be added without resetting unrelated data.
- [ ] Missing, invalid, or unavailable storage does not prevent play; show parents when progress cannot be saved.
- [ ] Save migration and completed-garden behavior have regression coverage.

**Out of scope:** Cloud sync and user accounts.

### LG-03 — Back up or move my garden

**Status:** Backlog · **Dependencies:** LG-02

**Story:** As a grown-up, I want to back up progress or move it to another device without creating an account.

**Acceptance criteria:**
- [ ] Grown-up settings can export a versioned progress file and import a compatible file.
- [ ] Import validates contents and shows a summary before the parent confirms replacing current progress.
- [ ] Invalid or unsupported files leave the existing garden unchanged.
- [ ] Export/import works through the iPhone share/file flow as well as laptop downloads.
- [ ] Explain that the backup may contain a child's entered name; exporting does not send it to a service.

**Out of scope:** Automatic merging, cloud storage integration, and syncing devices.

### LG-04 — Choose number practice settings

**Status:** Backlog · **Dependencies:** LG-02

**Story:** As a grown-up, I want to choose an appropriate number range without changing letter practice.

**Acceptance criteria:**
- [ ] Number practice starts at 1–5 and optionally expands to 1–10.
- [ ] The chosen range is remembered independently of letter settings.
- [ ] All number activities use the selected range and always offer valid, distinct choices.
- [ ] Settings explain the difference between recognizing a numeral and counting a quantity.

**Out of scope:** Zero, negative numbers, arithmetic, and automatic difficulty changes.

### LG-05 — Find a number

**Status:** Backlog · **Dependencies:** LG-01, LG-02, LG-04

**Story:** As a little learner, I want to hear a number and find its numeral.

**Experience:** “Can you find three?” appears with three large numeral cards.

**Acceptance criteria:**
- [ ] Each round contains one target and two distinct distractors within the chosen range.
- [ ] A tap can replay the spoken prompt; sound-off play shows the target in words/numerals.
- [ ] Incorrect choices provide a gentle hint and unlimited retries.
- [ ] A correct choice earns one shared garden flower, then offers another round or the existing five-flower celebration.
- [ ] Repeated taps cannot award extra flowers for the same round.

**Out of scope:** Counting objects; that is a separate activity.

### LG-06 — Count with me

**Status:** Backlog · **Dependencies:** LG-01, LG-02, LG-04

**Story:** As a little learner, I want to touch objects and hear them counted so numbers connect to real quantities.

**Experience:** The child taps a small group of apples. Each touched apple lights up, and the narrator says the next number.

**Acceptance criteria:**
- [ ] Show a clearly separated group containing 1–5 objects initially, or up to 10 when enabled.
- [ ] Each object counts once, regardless of tap order; an already-counted object does not advance the count.
- [ ] Each new tap gets immediate visual feedback and understandable counting audio during rapid tapping.
- [ ] Completing the group shows its numeral and earns exactly one flower for the whole round.
- [ ] The child chooses when to continue; no timed tapping is required.

**Out of scope:** Adding/removing objects and drag-and-drop counting.

### LG-07 — How many do you see?

**Status:** Backlog · **Dependencies:** LG-01, LG-02, LG-04

**Story:** As a little learner, I want to match a group of objects to the number that tells how many there are.

**Acceptance criteria:**
- [ ] Show one group and three distinct numeral choices, including the correct quantity.
- [ ] Objects are large enough to count and never overlap ambiguously.
- [ ] A counting-help option lets the child count the objects without changing the answer or earning an extra reward.
- [ ] Incorrect answers give hints without removing progress.
- [ ] A correct answer earns one shared flower, including after using help.

**Out of scope:** Comparing groups and recognizing quantities beyond the chosen range.

### LG-08 — Visit Number Garden

**Status:** Backlog · **Dependencies:** LG-05–LG-07

**Story:** As a little learner, I want to choose how to play with numbers and see that my discoveries grow the same garden.

**Acceptance criteria:**
- [ ] Number Garden offers Find a Number, Count With Me, and How Many through picture-led cards.
- [ ] Navigation among the home screen, either subject, and activities is consistent and returns to the top.
- [ ] Flowers earned in either subject contribute to one five-flower patch and one lifetime total.
- [ ] Completing a mixed letter/number patch celebrates once; planting another patch preserves lifetime flowers.
- [ ] Letter activities retain their existing behavior and saved settings.

### LG-09 — Verify the numbers release on real devices

**Status:** Backlog · **Dependencies:** LG-01–LG-08

**Story:** As a family, we want Learning Garden to behave consistently on the devices we use.

**Acceptance criteria:**
- [ ] Test all new activities on an actual iPhone, including first-tap audio, rapid taps, sound off, and returning from another app.
- [ ] Check phone portrait/landscape, tablet, and touchscreen laptop; no horizontal clipping or inaccessible settings.
- [ ] Verify old-save migration, a mixed-subject five-flower celebration, and progress after reopening the browser.
- [ ] Verify export/import on iPhone and laptop, including a rejected invalid backup.
- [ ] Record device/browser versions and results; distinguish real-device checks from desktop viewport simulation.

**Release gate:** Phase 1 is ready only when blocking issues are fixed and this card passes.

## Phase 2 — A friend and surprises

### LG-10 — Choose my garden buddy

**Status:** Backlog · **Dependencies:** LG-01, LG-02

**Story:** As a little learner, I want to choose an animal friend so the garden feels like mine.

**Acceptance criteria:**
- [ ] Offer Bunny, Turtle, and Dinosaur as large picture cards with a name and spoken introduction.
- [ ] Tapping selects a buddy; a clear confirmation starts play.
- [ ] The selected buddy appears at home and is remembered after reopening.
- [ ] The child can skip selection or change buddies without losing progress or rewards.

**Out of scope:** Accessories and distinct character voices.

### LG-11 — My buddy helps me learn

**Status:** Backlog · **Dependencies:** LG-10, LG-08

**Story:** As a little learner, I want my buddy to encourage me while I discover letters and numbers.

**Acceptance criteria:**
- [ ] The chosen buddy appears in learning activities with waiting, encouraging, and happy reactions.
- [ ] Prompts remain clear and play once; reactions do not overlap narration or cover answers.
- [ ] Wrong answers keep the tone gentle, with no sad punishment animation.
- [ ] The buddy joins the five-flower celebration and respects sound-off/reduced-motion settings.

**Out of scope:** New game rules and conversational AI.

### LG-12 — Reveal a surprise garden visitor

**Status:** Backlog · **Dependencies:** LG-02, LG-08

**Story:** As a little learner, I want someone new to visit when my garden blooms.

**Acceptance criteria:**
- [ ] A completed patch earns one reveal, opened by tapping a large visual cue on the celebration screen.
- [ ] Start with Butterfly, Ladybug, Bee, Snail, and Bird; introduce each with a picture and name.
- [ ] Reveal uncollected visitors before repeats; after all five are collected, familiar visitors can return.
- [ ] Save the earned reward before revealing it; reloads and repeated taps cannot lose or duplicate it.
- [ ] A child can rest or plant another patch without opening a reveal; unopened rewards remain accessible.

**Out of scope:** Rarity tiers, paid reveals, and trading.

### LG-13 — Meet my visitor collection

**Status:** Backlog · **Dependencies:** LG-12

**Story:** As a little learner, I want to revisit the friends I discovered.

**Acceptance criteria:**
- [ ] A picture-led collection shows discovered visitors and friendly silhouettes for undiscovered ones.
- [ ] Tapping a discovered visitor plays its name and a small reaction, without earning flowers.
- [ ] Unopened earned reveals can be opened from the collection.
- [ ] Visitors and unopened rewards persist when changing subjects, resting, or reopening the game.

## Phase 3 — Make it mine

### LG-14 — Choose a decoration reward

**Status:** Backlog · **Dependencies:** LG-02, LG-12

**Story:** As a little learner, I want to choose something special for the garden I grew.

**Acceptance criteria:**
- [ ] A completed patch grants one decoration choice alongside its visitor reward, with a separate clear step.
- [ ] Offer two picture choices with spoken labels; begin with Mushroom, Pond, Birdhouse, Stepping Stones, Rainbow, and Sunflower.
- [ ] Favor unowned decorations while available; owning all six still permits a friendly repeat choice.
- [ ] Leaving before choosing preserves an unclaimed reward; claiming cannot happen twice for one patch.

**Out of scope:** A currency shop, paid items, and forced reward screens.

### LG-15 — Decorate my garden with taps

**Status:** Backlog · **Dependencies:** LG-14

**Story:** As a little learner, I want to place my decorations without needing precise dragging.

**Acceptance criteria:**
- [ ] One garden scene provides six large placement spots.
- [ ] Tap an owned item, then tap a spot to place it; the selected item and available spots are visually clear.
- [ ] Items can be moved, swapped, or returned to the collection without being lost.
- [ ] A unique owned decoration is not accidentally duplicated into several spots.
- [ ] Placements survive reopening and fit phone, tablet, and laptop layouts.

**Out of scope:** Freeform positioning and multiple garden scenes.

### LG-16 — Revisit my garden and collections

**Status:** Backlog · **Dependencies:** LG-13, LG-15

**Story:** As a little learner, I want an easy place to enjoy everything I have grown and collected.

**Acceptance criteria:**
- [ ] Home provides a clear My Garden destination with access to decorations and visitors.
- [ ] A first-time garden feels welcoming even before rewards are earned.
- [ ] The child can return to either learning subject in one clear action.
- [ ] Viewing and rearranging collections never consumes rewards or changes learning progress.

### LG-17 — Give my buddy a little mission

**Status:** Backlog · **Dependencies:** LG-11, LG-08

**Story:** As a little learner, I want to help my buddy with a small adventure that has a clear finish.

**Acceptance criteria:**
- [ ] A mission consists of three successful learning rounds, shown as three picture markers.
- [ ] Every success advances the mission once and earns one normal garden flower; mistakes remove neither.
- [ ] Only one active mission is shown at a time, and leaving saves its progress.
- [ ] Garden completion during a mission preserves mission progress and rewards both milestones once.
- [ ] Free play remains available; a mission can be abandoned from grown-up controls without losing earned flowers.

**Out of scope:** Extra reward currencies and daily mission pressure.

### LG-18 — Play three starter missions

**Status:** Backlog · **Dependencies:** LG-17

**Story:** As a little learner, I want different little stories to give familiar activities a purpose.

**Acceptance criteria:**
- [ ] Include Pack a Picnic (letters), Count the Garden Guests (numbers), and Help a Seed Grow (a short mixed sequence).
- [ ] Each mission has a short spoken setup, three meaningful visual progress steps, and an ending.
- [ ] Activities honor grown-up letter and number settings.
- [ ] Missions can be replayed; no deadline or consecutive-day requirement applies.

### LG-19 — Set up letters from my name

**Status:** Backlog · **Dependencies:** LG-02

**Story:** As a grown-up, I want to personalize learning with a name without creating an online child profile.

**Acceptance criteria:**
- [ ] Name entry is optional and located in Grown-up Settings; it is stored in the browser save.
- [ ] Preserve the entered display name, with a reasonable length limit and safe text rendering.
- [ ] Preview which A–Z letters can be practiced; explain unsupported characters rather than silently misrepresenting a name.
- [ ] Editing or removing the name preserves all other progress.
- [ ] Explain that exported backups include the saved name; no name is uploaded for narration.

**Out of scope:** Generating or guaranteeing spoken name pronunciation.

### LG-20 — Discover my name

**Status:** Backlog · **Dependencies:** LG-19, LG-11

**Story:** As a little learner, I want to uncover letters that belong to my name.

**Acceptance criteria:**
- [ ] Show large letter positions and uncover playable letters in name order.
- [ ] Repeated letters and names with fewer than three distinct letters work; use distinct alphabet distractors when needed.
- [ ] Each completed letter-matching round earns one flower; completing the name adds a celebration, not duplicate flower credit.
- [ ] Save partial name progress and handle changing the entered name without affecting other learning progress.
- [ ] Use dependable narration such as “You found your name!” rather than guessing pronunciation.

## Phase 4 — Family readiness

### LG-21 — See what we have explored

**Status:** Backlog · **Dependencies:** LG-08, LG-20

**Story:** As a grown-up, I want a simple picture of the activities my child has tried so I can choose what to practice together.

**Acceptance criteria:**
- [ ] A grown-up view summarizes subjects, activities, and letters/numbers practiced on this device.
- [ ] Present discoveries and participation without claiming that a few correct answers prove mastery.
- [ ] Explain that retries, adult help, and shared-device play affect interpretation.
- [ ] Keep the information in the local save; permit a parent to clear practice history separately from collectibles.

**Out of scope:** Third-party analytics, rankings, diagnostic scores, and school reports.

### LG-22 — Test the complete family experience

**Status:** Backlog · **Dependencies:** LG-10–LG-21

**Story:** As the product owner, I want evidence that the full game is understandable, dependable, and pleasant for families.

**Acceptance criteria:**
- [ ] Try the game with several willing families and record parent feedback without collecting unnecessary child information.
- [ ] Observe whether children can choose a subject, finish a patch, reveal rewards, and stop with minimal reading or help.
- [ ] Check actual iPhone/tablet/laptop use, offline-file play, reduced motion, and sound-off play.
- [ ] Verify reopening during every reward step and mission step; progress is neither lost nor duplicated.
- [ ] Record issues, fix blockers, and review whether the learning scope is understandable before adding commerce.

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
