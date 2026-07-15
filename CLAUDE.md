# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

Static site for **Cyborg Resilience Co-lab (CRC)** at `crcolab.art`. Plain HTML/CSS/JS
plus Jekyll (built by GitHub Pages on push from `main`) for the content sections
(`/news/`, `/events/`, `/media/`), their item pages, Atom feeds, and sitemap.

## Layout

- `index.html`, `styles.css`, `script.js` — landing page
- `animations/` — vanilla JS modules: `cyborg-toggle.js`, `news-modal.js`, `surveillance-hud.js`
- `events/<slug>/` — self-contained event sub-pages with their own `index.html` + `styles.css`
- `assets/` — shared images / SVGs / video
- `_news/`, `_events/`, `_media/` — content collections, one Markdown file per item
  (front-matter: `title`, `date`, `category`, `summary`, optional `image`,
  `source`/`external_url` for media, `start_date`/`end_date`/`location_name` for
  events, `link` to point listings at another URL)
- `_layouts/`, `_includes/` — Jekyll templates (item pages, section indexes, SEO head, Atom entries)
- `news/`, `events/`, `media/` — section index pages + per-section `feed.xml`
- `api/latest.json` — Liquid-generated JSON the homepage fetches for its latest-3 blocks
- `sections.css` — shared styles for section pages (loads after `styles.css`)

## Design system (must match across pages)

| Token       | Value       |
|-------------|-------------|
| `--lime`    | `#c1ff72`   |
| `--purple`  | `#5e17eb`   |
| `--ink`     | `#1a2123`   |
| `--bg-blue` | `#7b87f3`   |
| `--max`     | `1100px`    |
| `--radius`  | `18px`      |

The landing page's `styles.css` is the source of truth for tokens on generated
section pages too (`--crc-purple:#46288B`, `--crc-lime:#B7D32D`, Funnel Display);
the table above applies to the older event sub-pages.

Fonts (Google Fonts): Space Grotesk (UI), Press Start 2P (pixel accents), Noto Sans TC (zh). Use a monospace stack for English secondary text.

Bilingual pattern: **zh-Hant primary**, English in mono as secondary. Headings purple on white/lime, white on blue/purple bands. Section bands alternate white → blue → purple.

## Conventions

- **No local build tooling beyond Jekyll-on-Pages.** GitHub Pages runs Jekyll on push;
  don't introduce bundlers, npm, or frameworks. `Gemfile` (github-pages gem) exists
  only for local preview; `_site/` and `Gemfile.lock` stay gitignored.
- **Adding a content item:** drop a Markdown file in `_news/`/`_events/`/`_media/`
  named `YYYY-MM-DD-slug.md` — indexes, feeds, sitemap, and homepage JSON update
  automatically on build. No registration file to edit.
- **Asset paths:** use root-absolute (`/assets/cube.svg`, `/favicon.png`) so they resolve from any sub-page.
- **Sub-pages:** put under `events/<slug>/` with their own `index.html` + `styles.css`. Reuse the design tokens above; deviate only when the layout demands it (e.g. schedule cards).
- **Top bar on sub-pages:** sticky, with a `←` back-link to `/` and a breadcrumb in mono.
- **External CTAs** (e.g. registration forms): `target="_blank" rel="noopener"`.
- **Footer year:** `<span id="y"></span>` filled by inline script — keep that pattern.
- **Homepage news blocks:** rendered by `script.js` from `/api/latest.json`; don't
  hard-code items into `index.html`.

## Local preview

```sh
bundle exec jekyll serve   # full site incl. generated sections (http://127.0.0.1:4000)
python3 -m http.server 8000  # static-only work (landing page, event sub-pages)
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
