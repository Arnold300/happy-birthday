# A Little Something For You 🎂

A locked, playful birthday page: **PIN → quiz → sudoku → reveal (photo collage + your message)**.
Pure HTML/CSS/JS — no build step, no backend, runs anywhere.

## File overview

```
birthday-surprise/
├── index.html               ← page structure (4 screens)
├── styles.css                ← all visual styling
├── script.js                  ← app logic (don't need to touch this)
├── config.js                  ← ⭐ EVERYTHING you'll actually edit
├── generate-pin-hash.html     ← helper tool to set your PIN
├── photos/                     ← put her photos here
└── README.md                  ← this file
```

**You should only ever need to edit `config.js`** (and drop photos in `/photos`).
Everything else is plumbing.

## 1. Open it in VS Code

Open the `birthday-surprise` folder in VS Code. To preview it live:
- Install the **"Live Server"** extension, right-click `index.html` → "Open with Live Server", or
- Run `python3 -m http.server 8000` in the folder and visit `http://localhost:8000`

Opening `index.html` directly by double-clicking (`file://...`) mostly works too, but a local
server is more reliable, especially for the photo collage.

## 2. Set your PIN

1. Open `generate-pin-hash.html` in your browser (just double-click it).
2. Type the PIN you want.
3. Copy the hash it shows you.
4. Paste it into `config.js` as `pinHash`, and set `pinLength` to match.

**Security note, honestly:** this is a static site with no server, so a *very* determined person
who opens developer tools could technically find ways around the PIN check if they went looking.
Hashing the PIN means it's not sitting there in plain text for casual snooping — which is the
realistic threat here — but it isn't bank-grade security. That would need a real backend, which is
overkill for a birthday surprise.

## 3. Add your photos

Drop image files into `/photos`, then list their filenames in `config.js` under `photos:`.
Any number works — the collage adjusts automatically.

## 4. Fill in the rest of `config.js`

Every section is commented — quiz questions, sudoku teasing lines, her name, your message, and
an optional overall date-lock if you still want the whole thing to stay closed until a specific
moment (e.g. midnight on her birthday) regardless of the PIN. Leave `lockUntil: null` to skip that
and let the PIN be the only gate.

## 5. Share it with her

Once you're happy with it, you need to host it somewhere so you can send her a link. A couple of
free, simple options:

- **GitHub Pages**: push the folder to a GitHub repo, enable Pages in repo settings → you get a
  free `https://yourname.github.io/reponame` link.
- **Netlify Drop**: go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the whole
  folder in — it gives you a live link in seconds, no account needed for a quick one-off.

Either way, only people with the link can find it (it won't show up in search), and it's still
PIN-protected on top of that.

## Customizing further

- **Colors/fonts**: all defined as CSS variables at the top of `styles.css` under `:root`.
- **Sudoku difficulty**: it's currently a 4×4 grid with ~7 starting numbers. To make it harder,
  open `script.js`, find `initSudoku()`, and reduce the `givens.size < 7` number (fewer givens =
  harder).
- **Quiz strictness**: set `requirePerfectScore: true` in `config.js` if she must get everything
  right to proceed (currently `false`, so wrong answers just get a playful reaction).
