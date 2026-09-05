# Portfolio — Mohamed Riyaz M

Static one-page portfolio. No build step, no dependencies, no tracking.

```
index.html   markup and all copy
styles.css   design tokens + layout
script.js    theme toggle, scrollspy, hero reveal
assets/      resume PDF
.nojekyll    tells GitHub Pages to serve files as-is
```

## Preview locally

Open `index.html` in a browser — there is nothing to install or run.

```sh
python3 -m http.server 8000   # optional; only needed if fetch calls are added later
```

## Publish to GitHub Pages

1. Push to `main`.
2. Repo → **Settings** → **Pages**.
3. Source: **Deploy from a branch** → branch `main`, folder `/ (root)` → **Save**.
4. `CNAME` points at `riyaz.portfolio.codexbash.com`; delete it to serve from
   the default `github.io` address instead.

## Editing

All copy lives in `index.html`. Colors and type are CSS custom properties at the
top of `styles.css`: `--pine` (deep green, the primary) and `--plum` (used only
for marks totals and project subtitles).
