# Content Sections via Jekyll — Design

**Date:** 2026-07-15
**Status:** Approved
**Branch:** `jekyll-sections` (single feature branch, staged commits)

## Goal

Give CRC's three content types — Latest News, Events, and a new "As Seen on Media"
section — real, crawlable pages: a section index each, an independent page per item,
Atom feeds, and homepage "latest 3" blocks. Content must be maximally visible to
search engines and LLM chatbot crawlers (static HTML, structured data, feeds,
`llms.txt`), replacing today's client-side-rendered news that crawlers can't see.

## Approach

Adopt **Jekyll via GitHub Pages** incrementally. GitHub Pages builds Jekyll
server-side on push, so deployment stays "push to `main`" with no local build
tooling committed. Jekyll passes plain HTML through untouched, so the existing
landing page and event page are not converted.

Alternatives considered and rejected:

- **Local generator script** (committed output): keeps the deployed site plain but
  adds a manual sync step per item and committed generated files.
- **Hand-authored pages:** 4–5 files to touch per item; feeds/sitemap drift.

## Architecture

### Unchanged (pass-through)

- `index.html` (except the homepage integration in §Homepage), `styles.css`,
  `script.js`, `animations/`, `assets/`, `events/hackathon-2026/`, `CNAME`,
  favicons.

### New Jekyll structure

- `_config.yml` — declares three collections, all `output: true`:
  - `news` → permalink `/news/:slug/`, index at `/news/`
  - `events` → permalink `/events/:slug/`, index at `/events/`
  - `media` → permalink `/media/:slug/`, index at `/media/`
- `_news/`, `_events/`, `_media/` — one Markdown file per item with front-matter:
  `title`, `date`, `category`, `summary`, optional `image`, and for media items
  `source` and `external_url`. Body is the full content, zh-Hant primary with
  English in mono as secondary, matching the site's bilingual pattern.
- `_layouts/item.html` — single-item page: sticky top bar with `←` back-link to
  the section index and a mono breadcrumb; reuses design tokens.
- `_layouts/section-index.html` — latest 3 featured on top, full chronological
  archive below.
- `sections.css` — shared styles for the new pages, built from the design tokens
  in CLAUDE.md (`--lime`, `--purple`, `--ink`, `--bg-blue`, `--max`, `--radius`).
  No new fonts, no JS frameworks.

### Content definitions

- **News** — CRC announcements and updates (migrated from the five existing
  `news/*.js` modules, which are then deleted along with `news/index.js`).
- **Events** — CRC-run events. The existing `events/hackathon-2026/` page keeps
  its URL as static HTML; the `/events/` index links to it alongside collection
  items.
- **Media ("As Seen on Media")** — external press coverage AND talks/podcast/panel
  appearances, combined in one chronological list. Items with `external_url`
  render a prominent outbound link (`target="_blank" rel="noopener"`).

## Homepage integration

- Jekyll generates `/api/latest.json`: the latest 3 items per section (title,
  date, summary, url, category, image).
- The homepage news area is re-pointed to render from that JSON and gains two
  sibling blocks (Events, Media), each with a "view all →" link to its index.
- Item cards link to their permanent pages. The news modal
  (`animations/news-modal.js` and its markup in `index.html`) is retired.
- Old anchor `/#news` must continue to resolve to the homepage section.

## SEO / LLM-crawler / feeds

- **Per page:** unique `<title>`, meta description, canonical URL, Open Graph +
  Twitter card tags, JSON-LD (`NewsArticle` for news, `Event` for events,
  `Article` for media), `lang="zh-Hant"` at the root with English spans marked
  `lang="en"`.
- **Atom feeds** (Liquid templates, valid Atom 1.0):
  `/feed.xml` (combined), `/news/feed.xml`, `/events/feed.xml`,
  `/media/feed.xml` — advertised via `<link rel="alternate"
  type="application/atom+xml">` on every generated page and the homepage.
- **Sitemap:** replace the hand-maintained `sitemap.xml` with the
  `jekyll-sitemap` plugin (GitHub Pages whitelisted).
- **robots.txt:** explicitly allow major AI crawlers (GPTBot, ClaudeBot,
  Claude-Web, PerplexityBot, Google-Extended, CCBot, etc.) and reference the
  sitemap.
- **llms.txt** at root: short description of CRC, links to the three section
  indexes and the four feeds.

## Process

1. Branch `jekyll-sections` off `main`; staged commits:
   scaffold → news migration → events → media → homepage integration →
   feeds/SEO/llms.txt → CLAUDE.md update.
2. CLAUDE.md update: document the Markdown authoring flow for each section and
   amend the "no build step" rule to "no local build tooling beyond
   Jekyll-on-Pages; preview with `bundle exec jekyll serve`, or
   `python3 -m http.server` for static-only work". A `Gemfile` with the
   `github-pages` gem is allowed for local preview; `Gemfile.lock` and `_site/`
   are gitignored.
3. No `git push` and no PR without explicit user request.

## Testing / verification

- `bundle exec jekyll build` (github-pages gem, matching Pages' environment)
  passes before each commit.
- Every migrated news item renders at its new URL; `/news/`, `/events/`,
  `/media/`, and `/api/latest.json` resolve; `/#news` still works.
- Feeds pass an Atom validator; JSON-LD checked against schema.org expectations.
- Visual check: new pages match design tokens and bilingual pattern; landing
  page pixel-identical to before.
