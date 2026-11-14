# Learning Garden

A calm, touch-friendly learning game for a little learner. No account, installation, ads, timers, or scores required.

## Play

[Play Learning Garden online](https://asadler101.github.io/letter-garden/).


Open **index.html** in Edge or Chrome and choose **Letter Garden**, then tap a game. Choose Number Garden for Find a number, Count with me, or How many do you see. Turn up your laptop volume to hear the letters. Use the browser's full-screen mode (F11) for more room.

For a local web preview, run `node server.js` and open http://localhost:4173. No packages need to be installed.

## Three ways to play

- **Find a letter:** hear a letter and pick it from three large buttons. A wrong answer gives a gentle hint; a discovery grows a flower.
- **Big & little:** match an uppercase letter to its lowercase friend.
- **Alphabet picnic:** tap any letter to hear its name and a picture word.

Grown-ups can choose the first five letters, the whole alphabet, or a custom group (at least three different letters), and switch the finding game between uppercase and lowercase. The default is A–E. Sound can be turned off; written prompts then identify the target. Flowers and preferences are saved only in this browser. The fresh garden button resets flowers while keeping your buddy and visitor rewards. Grown-ups can choose the number range 1–5 or 1–10.

Voice recordings are included and load one at a time as needed. Playback starts directly from a tap, including on iPhone. If a recording cannot load, browser speech synthesis is a backup. On iPhone, check media volume and Silent Mode; use **Grown-ups → Test sound** to check playback. Downloads require a connection when playing online. For offline play, keep the audio folder beside index.html. The optional Google Fonts fall back to system fonts. On older systems a few emoji may be unavailable.

Each correct answer grows one of five flowers. At five, a garden celebration appears with a spoken cheer and a choice to plant another garden or rest. Planting resets the five flower slots while keeping lifetime flowers; a completed garden stays available until the child chooses to plant again. Older saves carry their current progress forward from the total. There are no competitive scores or automatic advancement: the child chooses when to try another letter. Alphabet picnic is free exploration and does not add flowers.

## Development

Plain HTML, CSS, and JavaScript with a dependency-free Node local server. Run `node --check app.js` and `node --check server.js` for JavaScript syntax checks.

## Publishing

GitHub Pages serves the root of the main branch. Push changes to main to update the live game. No build step is needed.


## Audio and compatibility checks

Run `node --test tests/audio.test.js` for audio lifecycle and recording-integrity regressions. The 203 recordings are PCM WAV, 16 kHz mono, about 20 MB total, fetched on demand. To regenerate them silently using an installed Windows English voice, run `powershell.exe -NoProfile -File generate-audio.ps1`. This writes directly to files, without speaker playback. Use -ClipPrefix number-, count-, quantity-, buddy-, visitor-, or decoration- to regenerate a group. Rapid counting queues names in order; leaving, muting, replaying or opening settings cancels pending counts.

Add `?silent=1` to the game URL for silent development and layout testing. This suppresses all audio without changing saved sound preferences. Layout checks covered widths from 280 to 1920 pixels, including phone landscape and a scrollable settings dialog. Actual iPhone hardware playback still needs device confirmation; desktop responsive testing is not an iOS audio test.

## Product roadmap

The Learning Garden expansion, release order, and detailed acceptance criteria are tracked in [the story backlog](docs/STORIES.md). Planned cards are separate from delivered features. GitHub Issues are not being created at this stage.

## Current local features

Number Garden offers numeral finding, counting individual apples, and matching a group to its numeral. Each successful round earns one shared flower; counting help never adds extra credit. Number range settings are shared by these activities.

Choose Bunny, Turtle or Dinosaur as an optional garden buddy. Preview a friend, then confirm or skip. The saved buddy accompanies learning with quiet visual reactions, including the five-flower celebration. Choosing or changing a buddy does not change flowers.

Each completed patch earns one surprise visitor. Gifts stay available on home and in Meet my visitors until opened. Reveals favor Butterfly, Ladybug, Bee, Snail and Bird before familiar friends return. The collection shows discovered friends and friendly unnamed silhouettes; tap a discovered friend to hear its name and see a small reaction, without earning flowers. Every reveal has a return to the collection. Rewards survive subjects, rest, replant and reopening. A completed older save receives one gift for its current patch, without retroactive gifts for older gardens. Failed reveal writes keep the gift unopened; malformed local visitor rewards are preserved and blocked from reveal/export until a valid backup replaces them.

Progress stays in this browser and is not synced across devices. Grown-up settings can download a versioned JSON backup, or share it when the browser supports file sharing. Import reviews the backup before replacing the whole garden, including settings, buddy, visitors and any saved name or future fields. Keep a copy before clearing browser storage. Unsupported versions do not overwrite newer progress; read/write failures show guidance. A failed import write retains the current garden.

LG-03 through LG-12 implementation and validation notes remain in the story backlog. Earlier automated checks cover save normalization, backups, number activities, quiet buddy reactions and durable visitor receipts. Actual-device audio is distinct from silent Node tests and browser simulation. Current work is not committed or published.

LG-13 validation: all 67 silent Node regressions, app/server syntax and diff checks pass. Five collection cases cover unnamed silhouettes, optional buddy, discovered-name recordings and reactions, repeated/stale taps without reward changes, mute, pending reveals, return navigation, subject changes, rest and reload. Parent-agent silent in-app browser review at 1265×712 checked home to collection, five generic silhouettes without unknown names in the accessibility tree, fitting desktop layout and visible rest action. Parent review also checked buddy selection: Turtle selection displayed introduction and enabled confirmation; Skip returned home without choosing a buddy or changing the 11 flowers. Actual audio, revealed visitor cards, phone/tablet layouts, keyboard/focus and reduced-motion rendering remain unverified. Not committed or published.

LG-14 adds a separate, optional decoration choice for every completed patch. Home and celebration offer two pictures with tap-to-hear names: Mushroom, Pond, Birdhouse, Stepping Stones, Rainbow and Sunflower. Unowned items are favored; repeats remain available after all six. Offers are saved before display, so leaving or reloading keeps the same choices. Claims save before confirmation, and failed writes keep the reward pending. Independent visitor and decoration receipts survive rest, replant and fresh-garden resets; existing visitor history does not consume or multiply decoration rewards. Completed older saves receive one decoration choice for the current patch only. Backups include and validate pending offers and claimed items; unrelated future fields are retained. Garden placement is available locally under LG-15.

LG-14 validation: all 74 silent Node regressions and app/server syntax and diff checks pass. Seven new cases cover shared activity rewards, all six items and repeats, saved options, rest/reload/interruption, stale taps, migration with outstanding/opened visitors, backup validation, malformed local rewards, failed saves and muted labels. Browser/device layout, keyboard/focus, reduced-motion rendering and actual audio remain unverified for the decoration screen. Not committed or published.

LG-15 adds **Decorate my garden**, now reached through **My Garden** on home and after a decoration claim. Tap an owned picture, then one of six large garden spots. Tap a placed picture to move or swap it; return it with the collection button. Placing a collection item over a picture returns that picture to the collection. Repeated rewards unlock one item per type while preserving reward history. Placements save in this browser and travel with validated backups; failed saves retain the previous arrangement. A garden without decorations welcomes the child and keeps all six spots ready. No dragging or learning rewards are involved.

LG-15 validation: all 79 silent Node regressions, app/server syntax and diff checks pass. Five new cases exercise all six items, unique inventory despite repeats, move/swap/return, persistence, no extra flowers or rewards, stale handlers, empty state, invalid backups/local layouts and write rollback. Responsive grids and large controls are implemented; browser/device layout, keyboard/focus and reduced-motion rendering remain unverified. Not committed or published.

LG-16 adds **My Garden** on home: a welcoming view of the six saved spots and shared flowers, with decorations, visitors and direct Letter Garden / Number Garden actions. Pending gifts remain visible on home and in the hub, and the buddy chooser stays on home. Viewing the garden does not claim gifts or change learning progress; the existing tap placement editor handles arranging pictures. Collections return to My Garden; reveal and rest routes remain available. All 82 silent Node regressions, app/server syntax and diff checks pass. LG-16 browser rendering, phone/tablet layouts, keyboard/focus, reduced-motion and actual-device/audio checks remain unverified. Not committed or published.


LG-17 adds an optional **A little mission** entry on home. Make three discoveries using any current rewarded letter or number activity; three picture markers retain progress, the starting buddy (if chosen), last activity and completion across reopening. Each success gives its usual one flower; counting help/retries add no credit. Home and the regular subject choices remain free play while the mission waits. Continue through a completed patch by replanting, or rest and resume later. Grown-ups can abandon the mission without losing flowers. Backups validate mission progress and its completion marker. A failed write warns that progress may be lost; mission start/abandon operations roll back when saving fails. Named story sequences and mission narration remain LG-18; this generic mission uses visible instructions and pictures.

LG-17 validation: all 88 silent Node tests and app/server syntax/diff checks pass, including six mission cases covering all rewarded activities, wrong/repeated/stale answers, help, free play, mixed activities, saved milestones, reload/replant, abandonment and invalid backups. Browser/device layout, keyboard/focus, reduced-motion and actual audio remain unverified for LG-17. The story remains In progress for those shared checks. Not committed or published.

Additional parent-agent LG-15/LG-16 browser evidence: silent in-app browser at 1265×712 showed the My Garden empty six-spot welcome with 11 flowers, and reachable decoration editing with six empty spots, empty collection guidance and disabled return/cancel controls. Actual placement, mobile, audio and keyboard behavior were not checked.

LG-18 adds three starter stories to **A little mission**: **Pack a Picnic** (letters), **Count the Garden Guests** (numbers and an apple feast), and **Help a Seed Grow** (letters and numbers). Each has three picture steps with spoken guidance, a child-chosen continue action and an ending. Existing grown-up settings apply. The next step survives reloads and completed patches; normal guarded flowers are the only rewards. Rest any time or replay after completion, with no deadline or streak. Choosing another story keeps an unfinished mission; grown-ups can put it away in settings.

LG-18 validation: 92 silent Node tests, syntax and diff checks pass, including all three sequences, replay, preferences, saved next steps/replanting, stale/repeated actions and backup validation. Twelve recordings were generated to files without playback; all 202 bundled WAVs pass PCM/content checks. Browser/device layout, keyboard/focus, reduced motion and actual listening remain unverified. No commit or publication was performed.

LG-19 adds optional **Letters from my name** setup in Grown-up Settings. Save an exact display spelling of up to 40 Unicode codepoints, or leave empty to remove it. A draft preview lists playable ASCII A–Z letters in order, including repeats, and explains other characters without changing the spelling. Accents, non-Latin letters, spaces, punctuation and emoji remain in the display but are not playable. Name games remain planned for LG-20. Name edits preserve other progress; closing settings discards the draft. The structured name stays in browser storage and is included in backups; the game neither uploads it nor speaks it. Older unknown name fields remain preserved in backups.

LG-19 validation: all 97 silent Node tests, app/server syntax and diff checks pass, including five new name cases for Unicode, length, safe text, draft/save/remove/reload, reward preservation, backup validation and no name narration requests. Browser/device layout, keyboard/focus, reduced motion and actual-device checks remain unverified. Not committed or published.

LG-20 adds **Discover my name** in Letter Garden. Match each playable A–Z position in the saved name, in order, with distinct alphabet choices even for one-letter or repeated-letter names. Other characters remain visible; names without playable letters show setup guidance. Each matched position earns one normal flower, and a generic “You found your name!” recording celebrates completion without another flower. Partial progress survives reopening and patch celebrations. Saving a different name resets only name progress. This is free play; existing missions wait. Names stay local and are never pronounced or uploaded. All 104 silent Node regressions, app/server syntax and diff checks pass; the new recording was generated without playback. LG-20 browser/device layout, keyboard/focus, reduced motion and actual listening remain unverified. Not committed or published.


LG-21 adds **See what we have explored** in Grown-up Settings. It summarizes subjects, activities, distinct target letters/numbers and discoveries on this browser/device. A valid answer attempt, counting tap/help or picnic letter tap records participation; simply opening a screen or replaying a prompt does not. Each successful normal flower-earning round adds one discovery, including name positions and mission rounds. Retries/help do not add separate discoveries. This is participation, not mastery: adult help is not detected and shared-device play combines everyone. Earlier saves have no practice history to reconstruct. Tracking begins with this update or the last clear.

History stores only version 1, up to eight known activities, 26 distinct letters, ten distinct numbers and a discovery total capped at 999,999. It adds no dates, per-attempt logs, child profile or telemetry. Backups carry and strictly validate history; old backups start empty. Invalid local history stays preserved and unavailable until a grown-up clears it. **Clear practice history only** has its own confirmation and preserves flowers, visitors, decorations, placements, mission, name and preferences; a failed save retains the previous history. Export a backup first to retain restorable history. Starting a fresh garden does not clear history.

LG-21 validation: all 110 silent Node regressions and app/server syntax/diff checks pass. New cases cover every activity, intentional participation versus visits, retries/help/picnic duplicate writes, name/mission participation, reloads, separate clear and save failure, old/invalid histories and bounded backup round-trips. Browser/device layout, keyboard/focus, reduced motion and actual audio remain unverified. Not committed or published.

LG-22 family verification is In progress. The [family check record](docs/FAMILY-CHECKS.md) contains consent/minimal-data guidance, anonymous feedback rows, actual-device and offline-file checks, and reward/mission interruption checkpoints. All 110 silent Node regressions, including 203 WAV integrity checks, and app/server syntax/diff checks pass. Family sessions, actual iPhone/tablet/laptop observations, listening, offline-file behavior and full interruption results remain NOT RUN; automated checks do not close that gate. Corrected stale number-settings help to describe the three playable activities. Not committed or published.


## Letter round improvements

Correct Find a Letter and Big & Little answers automatically start the next letter after spoken feedback and a short pause (about 0.9 seconds when muted). The five-flower celebration still waits for the child. Leaving, opening settings, hiding the page, or replaying audio cancels the pending advance; Another letter remains available. Landscape tablet letter screens use compact spacing and put the matching target beside the speaker controls.

Grown-ups can choose Automatic, Device voice, or Original recordings under Narration voice, and preview with Try this voice before saving. Automatic prefers a suitable local English voice when available. Device voice quality depends on installed voices; the original Windows Zira recordings remain available. Device speech uses a neutral pitch and a slightly slower natural rate. Preview never changes saved mute or voice preferences, and silent development previews remain silent. Entered names are never narrated.

Verification: silent regressions, JavaScript syntax, and diff checks pass. Browser automation was unavailable for this follow-up; actual iPad landscape fit and voice quality still require device confirmation. These changes supersede the earlier manual-next-letter behavior for the two letter matching/finding activities.


Voice preview correction: both Try this voice and Test sound now preview the current unsaved voice selection. The status identifies the actual device voice name or original Windows Zira recording, and Ready to grow saves the choice for play. A device synthesis error or unavailable API falls back once to the recording. Neither preview changes saved mute or voice preferences. This corrects the earlier mismatch where Test sound used the saved voice instead; it does not replace the bundled synthetic recordings with a human or neural narrator. Actual iPad listening remains unverified.


Device speech stall recovery: a voice that never reports starting within 2.5 seconds falls back to the original recording. Speech that starts but never finishes has a bounded timeout based on prompt length; unexpected interruptions also recover. Once device speech fails, subsequent narration uses recordings for that session until a deliberate voice preview retries it. Leaving the activity cancels watchdogs so old audio cannot resume later. Saved progress and voice preferences are preserved. Automated checks simulate these browser failures; actual iPad playback remains unverified.
