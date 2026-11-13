# Letter Garden

A calm, touch-friendly alphabet game for a little learner. No account, installation, ads, timers, or scores required.

## Play

[Play Letter Garden online](https://asadler101.github.io/letter-garden/).


Open **index.html** in Edge or Chrome and tap a game. Turn up your laptop volume to hear the letters. Use the browser's full-screen mode (F11) for more room.

For a local web preview, run `node server.js` and open http://localhost:4173. No packages need to be installed.

## Three ways to play

- **Find a letter:** hear a letter and pick it from three large buttons. A wrong answer gives a gentle hint; a discovery grows a flower.
- **Big & little:** match an uppercase letter to its lowercase friend.
- **Alphabet picnic:** tap any letter to hear its name and a picture word.

Grown-ups can choose the first five letters, the whole alphabet, or a custom group (at least three different letters), and switch the finding game between uppercase and lowercase. The default is A–E. Sound can be turned off; written prompts then identify the target. Flowers and preferences are saved only in this browser. The fresh garden button resets flowers.

Voice recordings are included and load one at a time as needed. Playback starts directly from a tap, including on iPhone. If a recording cannot load, browser speech synthesis is a backup. On iPhone, check media volume and Silent Mode; use **Grown-ups → Test sound** to check playback. Downloads require a connection when playing online. For offline play, keep the audio folder beside index.html. The optional Google Fonts fall back to system fonts. On older systems a few emoji may be unavailable.

Each correct answer grows one of five flowers. At five, a garden celebration appears with a spoken cheer and a choice to plant another garden or rest. Planting resets the five flower slots while keeping lifetime flowers; a completed garden stays available until the child chooses to plant again. Older saves carry their current progress forward from the total. There are no competitive scores or automatic advancement: the child chooses when to try another letter. Alphabet picnic is free exploration and does not add flowers.

## Development

Plain HTML, CSS, and JavaScript with a dependency-free Node local server. Run `node --check app.js` and `node --check server.js` for JavaScript syntax checks.

## Publishing

GitHub Pages serves the root of the main branch. Push changes to main to update the live game. No build step is needed.


## Audio and compatibility checks

Run `node --test tests/audio.test.js` for audio lifecycle and recording-integrity regressions. The 133 recordings are PCM WAV, 16 kHz mono, about 17 MB total, fetched on demand. To regenerate them silently using an installed Windows English voice, run `powershell.exe -NoProfile -File generate-audio.ps1`. This writes directly to files, without speaker playback.

Add `?silent=1` to the game URL for silent development and layout testing. This suppresses all audio without changing saved sound preferences. Layout checks covered widths from 280 to 1920 pixels, including phone landscape and a scrollable settings dialog. Actual iPhone hardware playback still needs device confirmation; desktop responsive testing is not an iOS audio test.

## Product roadmap

The proposed Learning Garden expansion, release order, and detailed acceptance criteria are tracked in [the story backlog](docs/STORIES.md). Planned cards are separate from delivered features. GitHub Issues are not being created at this stage.
