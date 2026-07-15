# crccolab.github.io

Static site for **Cyborg Resilience Co-lab (CRC)** — published at [crcolab.art](https://crcolab.art) via GitHub Pages.

CRC is a research and co-lab practice exploring digital resilience under contemporary conditions: subsea cables, off-grid communications, and civic-tech responses to network disruption.

## Structure

```
.
├── index.html               # Landing page (zh-Hant primary, EN mono secondary)
├── styles.css               # Site-wide styles
├── script.js                # Landing page interactions
├── animations/              # Visual modules (cyborg toggle, news modal, HUD)
├── assets/                  # Images, SVGs, video
├── news/                    # News items (ES modules; index.js aggregates)
├── events/                  # Event sub-pages
│   └── hackathon-2026/      # Digital Resilience Hackathon 2026
├── favicon.{ico,png}
├── CNAME                    # crcolab.art
└── LICENSE
```

## Design vocabulary

- **Colors:** Lime `#c1ff72`, Purple `#5e17eb`, Ink `#1a2123`, BG-Blue `#7b87f3`
- **Type:** Space Grotesk (body/headings), Press Start 2P (pixel accents), Noto Sans TC (Chinese), monospace for English subtitles
- **Patterns:** dotted dividers, cube SVG decorations, 2px purple-bordered cards (radius `18px`), bilingual zh/EN-mono pairing, surveillance-HUD aesthetic
- **Layout:** `--max: 1100px` container, section banding (white → blue → purple)

Sub-pages should reuse the same palette / type / vocabulary; see `events/hackathon-2026/styles.css` for an example that adapts the system to a schedule layout.

## Local preview

```sh
PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll serve --host 127.0.0.1 --port 4000
# open http://127.0.0.1:4000
```

## Locales

- Existing routes are `zh-Hant`; the static `en-US` mirror lives under `/en/`.
- Add paired content with the same filename to `_news`/`_news_en`, `_events`/`_events_en`, or `_records`/`_records_en`.
- Keep shared dates, categories, source URLs, external URLs, and image paths identical.
- Translate the full title, summary, body, headings, image alt text, and link labels; do not use runtime or machine translation.
- `/events/hackathon-2026/` is the only translation exception and must not receive an `/en/` duplicate.
- Preview locale work with Jekyll because locale pages use Liquid; `python3 -m http.server` is not sufficient.

Verify locale and typography work from the repository root:

```sh
node --test tests/locale-controller.test.mjs tests/i18n-structure.test.mjs tests/translation-parity.test.mjs tests/home-i18n.test.mjs tests/readable-typography.test.mjs tests/mobile-cube-layout.test.mjs tests/surveillance-hud.test.mjs
PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build
node --test tests/built-site-i18n.test.mjs
git diff --check
```

## Deploy

Pushing to `main` deploys via GitHub Pages. Custom domain set in `CNAME`.

## License

See `LICENSE`.
