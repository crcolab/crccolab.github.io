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
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Pushing to `main` deploys via GitHub Pages. Custom domain set in `CNAME`.

## License

See `LICENSE`.
