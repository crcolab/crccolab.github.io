---
name: publish-article
description: Use when publishing an article to a CRC content collection — news, event, media record, or idea — or when enriching an existing post's SEO tags. Also use for anything about a post's Open Graph / social card — og:title, og:description, og:image, share previews on Facebook, LINE or X, making a card image from text, or refreshing a stale preview after an edit — even when the user only says "fix the preview" or "make an og image".
---

# Publish an article

The body belongs to the author; the SEO belongs to you. Every tag a crawler or social card reads is generated from the **payload** — the YAML front matter — so the prose stays **verbatim** and the payload gets filled to the last key.

Enriching an existing post: do the payload in step 2, then steps 4–5. Only touching the share preview: go straight to **Social card**.

## 1. Place it

`_news/` announcements · `_events/` events · `_records/` third-party coverage · `_ideas/` essays and notes.

Date it by CRC's engagement — the day CRC announced, ran, or shared the thing — not the source's own publish date. `_events/` uses `start_date`.

The filename date is the URL: `/ideas/<filename-without-.md>/`. Redating a published post therefore retires its live URL, so confirm that trade before renaming one. Pick a slug that will not go stale — if the author's own text disagrees about a title (two English names for one work), use a neutral slug rather than either name.

**Done when** the filename matches `YYYY-MM-DD-lowercase-slug.md` and neither the collection nor its `_en` twin already holds that name.

## 2. Write the Chinese file

Body **verbatim**: same paragraphs, punctuation, numbers, claims — typos included. Exactly two edits are welcome — turn bare URLs into titled Markdown links, and link the first mention of any CRC page (team members → `/team/<slug>/`, the lab → `/`) to its root-relative URL. Headings may be promoted to `##`/`###` when the author's structure is plainly a heading.

Fill every payload key:

| key | fill with |
|---|---|
| `summary` | 80–110 zh characters, under 300 characters in English (the template truncates there with "…") — it becomes `<meta name="description">`, `og:description` unless overridden, and the listing excerpt |
| `tags` | 8–12 terms a reader would actually search |
| `about` | 3–5 topics the piece is about (`_ideas/`) |
| `mentions` | organisations named in the body, with URLs (`_ideas/`) |
| `citations` | every source in the reference list: `name` copied from its visible link text, plus `url` and `publisher` (`_ideas/`) |
| `author` + `author_slug` | the slug must match a `_team/<slug>.md` |
| `image` / `og_image` + `image_alt` | see **Social card** below |
| `og_title`, `og_description` | see **Social card** below |
| events only | `event_type` (e.g. `ExhibitionEvent`), `location_address` {street_address, locality, region, postal_code, country}, `location_url`, `super_event` {name, url, start_date, end_date, location_name, location_address} (emitted only with `start_date` + `location_name` — Google validates it as its own Event), `creators` [{name, slug}] — these feed the Event JSON-LD; `external_url` adds the "view source ↗" button |

`CLAUDE.md` holds the authoritative key catalogue; `_includes/head-seo.html` is what consumes them.

Any date **you** write — summary, og copy, card text, alt text — spells the month: `十月 17–25 日`, `Oct 17–25`. `10/17` reads as 17 October to one reader and nonsense to another. The author's body keeps whatever format the author used; offer, don't change.

**Done when** every key above is present, and a diff of the body against the author's text shows only link and heading markup.

## 3. Write the English twin

Same filename under `_<collection>_en/`. Translate the title, summary, body, headings, image alt text and link labels yourself — or, when the author supplied English, use theirs verbatim under the same rules as the Chinese body. Internal links gain the `/en` prefix.

**Done when** `date`, `category`, `source`, `external_url`, `image`, `og_image`, `start_date`, `end_date`, `author_slug`, `draft` and `canonical_url` are byte-equal across the twin; the English file carries `locale: en-US`; and every number, date and external URL matches the Chinese.

## Social card

A share preview is what most people see of a post: title, description, picture, and the site's name. It has a lifecycle — written, rendered, verified, cached by every platform that sees it, and revised — and each stage has its own way to go wrong.

### Copy

- **`og:title`** — the template appends `｜Cyborg Resilience Co-lab` to every `og:title`/`twitter:title`, so a shared link always says whose site it is. Never type the site name into `og_title`. Set `og_title` only when the card needs more than the page title — for events, the month-spelled date and venue: `孤娘的無人機藝・十月 17–25 日 新北市美術館 B3`. Otherwise leave it out and the page title is used.
- **`og:description`** — defaults to `summary`. Set `og_description` when social copy should differ (front-load the hook, add date and venue for events). Do not repeat the site name in it — the title already carries it, and repeating it wastes the ~150 characters platforms show.
- Each locale writes its own copy; the keys are not parity-checked, but the facts in them are.

### Image

`image` → `og_image` → site cover (`/assets/og-cover.png`), first one set wins.

- A real photograph or poster of the thing goes in `image`; it also shows at the top of the page.
- No photo? Make a **text card** and put it in `og_image`, not `image` — it only feeds the share preview, so the page does not show a banner that repeats its own headline.
- One card serves both locales (`og_image` must be byte-equal across the twin), so make it bilingual: zh title, English title beneath.
- `image_alt` describes the picture — every line of text on the card, in reading order — not the headline. Translate it per locale. The site cover carries its own fixed alt, so `image_alt` is ignored when nothing is set.

Render the card with the bundled script — it reproduces the cover's purple lattice, CRC logo and fonts, shrinks long titles to fit, and writes a progressive JPEG:

```sh
python3 .claude/skills/publish-article/scripts/render_og_card.py \
  --title 孤娘的無人機藝 --subtitle "Wandering Daughter’s Warfarring" \
  --when-zh 十月 --when "OCT 17 – 25" \
  --where-strong "新北市美術館 B3" --where "New Taipei City Art Museum" \
  --where-note "AI萬物：起鼓，2026臺灣嘉年華 特別展示" \
  --out assets/2026-OCT-17-<slug>.jpg --png <scratchpad>/card.png
```

Only `--title` and `--out` are required; news and ideas usually need just the two titles. Look at the `--png` preview before committing — the script checks size, not taste. Name assets `YYYY-MON-DD-slug.jpg` and keep them in the 75–400 KB band of their neighbours (the script warns). ImageMagick (`magick`) and Chrome are installed; the script falls back to PIL without ImageMagick.

### Verify

After a local build, read the tags the way a scraper will:

```sh
grep -E 'og:(title|description|image)|twitter:(title|image)' _site/<section>/<slug>/index.html _site/en/<section>/<slug>/index.html
grep -rhoE 'og:title" content="[^"]*"' _site | grep -E 'Co-lab.*Co-lab'   # must print nothing
```

Check: title ends in the site name exactly once; description has no site name and no numeric dates; image URL is the card, not `og-cover.png`.

### Ship and refresh

GitHub Pages serves assets with `cache-control: max-age=14400`, and Facebook, LINE and X keep their own copies of a preview far longer. So:

- **First publish**: nothing cached yet — just ship it.
- **Revising copy**: the HTML updates on deploy; ask the user to re-scrape in Facebook's Sharing Debugger (LINE: Page Poker) if the link was already shared.
- **Revising a card that may already have been shared**: write it to a new filename (`…-v2.jpg`) and point `og_image` at it. Overwriting the same path leaves the CDN and every platform serving the old picture for hours; a new URL forces a fresh fetch. Delete the superseded file in the same commit.
- Confirm the live card with a cache-busting fetch — `curl -s "<image-url>?v=$(date +%s)" | cmp - assets/<file>` — since the plain URL may still be the CDN's old copy.

### Revise

When dates, venue, or title change after publication, the card, `og_title`, `og_description`, `summary`, `image_alt`, and the event JSON-LD keys all carry those facts — update every one in both locales in the same commit, then re-render the card (new filename, per above).

## 4. Verify

```sh
node --test tests/locale-controller.test.mjs tests/i18n-structure.test.mjs tests/translation-parity.test.mjs tests/home-i18n.test.mjs tests/readable-typography.test.mjs tests/mobile-cube-layout.test.mjs tests/surveillance-hud.test.mjs tests/ideas-collection.test.mjs tests/team-collection.test.mjs
PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" bundle exec jekyll build
node --test tests/built-site-i18n.test.mjs
git diff --check
```

If Ruby 3.3 is missing, the Pages run is the build gate instead.

`translation-parity.test.mjs` aborts on its first mismatch, so one bad pair masks every later one — when it fails, compare all pairs yourself before concluding your files are clean, and report pre-existing mismatches separately from yours.

Parse every `application/ld+json` block in `_site` with a real JSON parser; a template edit can break pages you never opened.

**Done when** the node suite shows no failure that was absent beforehand, the build succeeds, and every JSON-LD block parses.

## 5. Ship

Push only when the user asks. Then `gh run watch` the Pages deploy, fetch the live URL, parse each `application/ld+json` block, and re-read the og tags as in **Social card → Verify**.

## Source every value

Citation names, publisher names, addresses, image dimensions and social handles come from something you opened. Where no compliant asset exists, omit the field — a missing field costs one rich-result feature, a wrong one costs validity.

When a claim in the author's text disagrees with its own citation — or with itself — report it and leave the text alone.
