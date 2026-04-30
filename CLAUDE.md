# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

Static site for **Cyborg Resilience Co-lab (CRC)** at `crcolab.art`. Plain HTML/CSS/JS, no build step, deployed via GitHub Pages from `main`.

## Layout

- `index.html`, `styles.css`, `script.js` — landing page
- `animations/` — vanilla JS modules: `cyborg-toggle.js`, `news-modal.js`, `surveillance-hud.js`
- `news/` — news items as ES modules; `news/index.js` aggregates them in display order (newest last in the array shows first in the rendered list — match existing pattern when adding)
- `events/<slug>/` — self-contained event sub-pages with their own `index.html` + `styles.css`
- `assets/` — shared images / SVGs / video

## Design system (must match across pages)

| Token       | Value       |
|-------------|-------------|
| `--lime`    | `#c1ff72`   |
| `--purple`  | `#5e17eb`   |
| `--ink`     | `#1a2123`   |
| `--bg-blue` | `#7b87f3`   |
| `--max`     | `1100px`    |
| `--radius`  | `18px`      |

Fonts (Google Fonts): Space Grotesk (UI), Press Start 2P (pixel accents), Noto Sans TC (zh). Use a monospace stack for English secondary text.

Bilingual pattern: **zh-Hant primary**, English in mono as secondary. Headings purple on white/lime, white on blue/purple bands. Section bands alternate white → blue → purple.

## Conventions

- **No build step.** Don't introduce bundlers, frameworks, or package.json. If a design prototype hands off React/Babel scaffolding (e.g. tweaks panels), strip it before landing — keep clean HTML/CSS/JS.
- **Asset paths:** use root-absolute (`/assets/cube.svg`, `/favicon.png`) so they resolve from any sub-page.
- **Sub-pages:** put under `events/<slug>/` with their own `index.html` + `styles.css`. Reuse the design tokens above; deviate only when the layout demands it (e.g. schedule cards).
- **Top bar on sub-pages:** sticky, with a `←` back-link to `/` and a breadcrumb in mono.
- **External CTAs** (e.g. registration forms): `target="_blank" rel="noopener"`.
- **Footer year:** `<span id="y"></span>` filled by inline script — keep that pattern.
- **News items:** ES modules exporting an object; register in `news/index.js`.

## Local preview

```sh
python3 -m http.server 8000
```

## Deploy

`git push origin main` → GitHub Pages publishes. `CNAME` pins `crcolab.art`.

## When implementing design hand-offs

Designs may arrive as Claude Design bundles (HTML/CSS/JS prototypes). Treat them as visual reference, not literal source:

1. Read the chat transcript in the bundle — that's where the user's intent lives.
2. Recreate visually pixel-perfect, but drop prototype-only scaffolding (React tweaks panels, Babel, dev-mode CDNs).
3. Fix asset paths to root-absolute for the real deployed location.
4. Keep markup semantic and the page usable without JS where reasonable.

## Don't

- Don't commit secrets, large binaries beyond what's already in `assets/`, or generated files.
- Don't `git push` or open PRs without explicit user request.
- Don't add tracking/analytics without asking.
