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

Speech comes from browser speech synthesis and available device voices. Voice availability varies; some device voices may require an internet connection. The game works without internet, using system fonts if the optional Google Fonts cannot load. On some older systems a few picture emoji may be unavailable. 

The garden shows five flower icons and keeps a total count as play continues. There are no competitive scores or automatic advancement: the child chooses when to try another letter. Alphabet picnic is free exploration and does not add flowers.

## Development

Plain HTML, CSS, and JavaScript with a dependency-free Node local server. Run `node --check app.js` and `node --check server.js` for JavaScript syntax checks.

## Publishing

GitHub Pages serves the root of the main branch. Push changes to main to update the live game. No build step is needed.

