---
name: publish-article
description: Use when publishing an article to a CRC content collection — news, event, media record, or idea — or when enriching an existing post's SEO tags.
---

# Publish an article

The body belongs to the author; the SEO belongs to you. Every tag a crawler or social card reads is generated from the **payload** — the YAML front matter — so the prose stays **verbatim** and the payload gets filled to the last key.

Enriching an existing post: do the payload in step 2, then step 4.

## 1. Place it

`_news/` announcements · `_events/` events · `_records/` third-party coverage · `_ideas/` essays and notes.

Date it by CRC's engagement — the day CRC announced, ran, or shared the thing — not the source's own publish date. `_events/` uses `start_date`.

**Done when** the filename matches `YYYY-MM-DD-lowercase-slug.md` and neither the collection nor its `_en` twin already holds that name.

## 2. Write the Chinese file

Body **verbatim**: same paragraphs, punctuation, numbers, claims. Exactly two edits are welcome — turn bare URLs into titled Markdown links, and link the first mention of any CRC page to its root-relative URL.

Fill every payload key:

| key | fill with |
|---|---|
| `summary` | 80–110 zh characters — it becomes `<meta name="description">`, `og:description`, and the listing excerpt |
| `tags` | 8–12 terms a reader would actually search |
| `about` | 3–5 topics the piece is about |
| `mentions` | organisations named in the body, with URLs |
| `citations` | every source in the reference list: `name` copied from its visible link text, plus `url` and `publisher` |
| `author` + `author_slug` | the slug must match a `_team/<slug>.md` |
| `image` / `og_image` / `image_alt` | only when a real asset exists — otherwise the 1200×630 site cover fills in automatically |

`CLAUDE.md` holds the authoritative key catalogue; `_includes/head-seo.html` is what consumes them.

**Done when** every key above is present, and a diff of the body against the author's text shows only link markup.

## 3. Write the English twin

Same filename under `_<collection>_en/`. Translate the title, summary, body, headings, image alt text and link labels yourself. Internal links gain the `/en` prefix.

**Done when** `date`, `category`, `source`, `external_url`, `image`, `start_date`, `end_date`, `author_slug`, `draft` and `canonical_url` are byte-equal across the twin; the English file carries `locale: en-US`; and every number, date and external URL matches the Chinese.

## 4. Verify

Ruby is absent locally, so `bundle exec jekyll build` and `tests/built-site-i18n.test.mjs` cannot run here — the Pages run is the build gate.

```sh
node --test tests/locale-controller.test.mjs tests/i18n-structure.test.mjs tests/translation-parity.test.mjs tests/home-i18n.test.mjs tests/readable-typography.test.mjs tests/mobile-cube-layout.test.mjs tests/surveillance-hud.test.mjs tests/ideas-collection.test.mjs tests/team-collection.test.mjs
```

`translation-parity.test.mjs` aborts on its first mismatch, so one bad pair masks every later one — when it fails, compare all pairs yourself before concluding your files are clean.

After pushing, `gh run watch` the Pages deploy, then fetch the live URL and parse each `application/ld+json` block.

**Done when** the node suite shows no failure that was absent beforehand, the Pages run is green, and every JSON-LD block on the live page parses.

## Source every value

Citation names, publisher names, image dimensions and social handles come from something you opened. Where no compliant asset exists, omit the field — a missing field costs one rich-result feature, a wrong one costs validity.

When a claim in the author's text disagrees with its own citation, report it and leave the text alone.
