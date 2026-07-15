# Jekyll Content Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give CRC three crawlable content sections — News, Events, Media — each with an index page, per-item pages, Atom feeds, and homepage "latest 3" blocks, powered by Jekyll on GitHub Pages.

**Architecture:** Jekyll is adopted incrementally: the existing landing page, `styles.css`, `script.js`, and `events/hackathon-2026/` pass through the build untouched. Three collections (`_news/`, `_events/`, `_media/`) hold Markdown items; shared layouts render item pages and section indexes reusing the main `styles.css` design system plus a new `sections.css`. Liquid templates generate four Atom feeds and `/api/latest.json`, which the homepage fetches to render latest-3 blocks. Spec: `docs/superpowers/specs/2026-07-15-content-sections-jekyll-design.md`.

**Tech Stack:** Jekyll via the `github-pages` gem (matches GitHub Pages' build), Liquid, kramdown Markdown, plain CSS/JS. No bundlers, no frameworks.

## Global Constraints

- All work on branch `jekyll-sections`; never `git push` or open PRs (user pushes manually).
- Site URL is `https://crcolab.art`; all asset/link paths root-absolute (`/styles.css`, `/assets/...`).
- Bilingual pattern: zh-Hant primary, English secondary; root `lang="zh-Hant"`, English spans `lang="en"`.
- Reuse design tokens from `/styles.css` (`--crc-purple:#46288B`, `--crc-lime:#B7D32D`, `--font-display`, `--font-body`, `--radius-lg`); do not invent new colors or fonts.
- External links: `target="_blank" rel="noopener"`.
- Footer year: `<span id="y"></span>` filled by inline script.
- `index.html`, `styles.css` (except one small addition in Task 7), `script.js` news-loader (rewritten in Task 7 only), and `events/hackathon-2026/` must not otherwise change; `_site/index.html` must stay byte-identical to `index.html`.
- Verify with `bundle exec jekyll build` before every commit; the generated `_site/` and `Gemfile.lock` are never committed.
- Item content migrates verbatim — do not rewrite or "improve" the zh-Hant/English copy (including existing typos like "Licsense").

---

### Task 1: Branch + Jekyll scaffold

**Files:**
- Create: `Gemfile`
- Create: `_config.yml`
- Create: `.gitignore`

**Interfaces:**
- Produces: a working `bundle exec jekyll build`; collections `site.news`, `site.events`, `site.media` (empty for now) with defaults `layout: item`, `section: <name>`; every later task depends on this config.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b jekyll-sections
```

- [ ] **Step 2: Check Ruby**

Run: `ruby -v`
Expected: 3.x. If it prints 2.x (macOS system Ruby), install a modern one first: `brew install ruby`, then use the brew Ruby's `gem`/`bundle` (e.g. `export PATH="$(brew --prefix ruby)/bin:$PATH"`). Then `gem install bundler` if `bundle -v` fails.

- [ ] **Step 3: Write `Gemfile`**

```ruby
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins
```

- [ ] **Step 4: Write `_config.yml`**

```yaml
title: Cyborg Resilience Co-lab
description: >-
  研究 × 科技 × 藝術的跨域行動平台。探索戰爭、災難與科技風險交疊下的數位韌性。
  Cyborg Resilience Co-lab (CRC) — civic hackers, digital-rights activists,
  researchers and artists working on digital resilience in Taiwan.
url: "https://crcolab.art"
lang: zh-Hant
timezone: Asia/Taipei

plugins:
  - jekyll-sitemap

collections:
  news:
    output: true
    permalink: /news/:name/
  events:
    output: true
    permalink: /events/:name/
  media:
    output: true
    permalink: /media/:name/

defaults:
  - scope: { type: news }
    values: { layout: item, section: news }
  - scope: { type: events }
    values: { layout: item, section: events }
  - scope: { type: media }
    values: { layout: item, section: media }

exclude:
  - README.md
  - LICENSE
  - CLAUDE.md
  - docs/
  - .superpowers/
  - Gemfile
  - Gemfile.lock
  - vendor/
```

- [ ] **Step 5: Write `.gitignore`**

```gitignore
_site/
.jekyll-cache/
.jekyll-metadata
Gemfile.lock
vendor/
.DS_Store
```

- [ ] **Step 6: Install and build**

Run: `bundle install && bundle exec jekyll build`
Expected: `done in X.XXX seconds.` with no errors.

- [ ] **Step 7: Verify pass-through**

Run: `diff _site/index.html index.html && diff -r _site/events/hackathon-2026 events/hackathon-2026 && ls _site/sitemap.xml`
Expected: no diff output (byte-identical pass-through); `_site/sitemap.xml` exists. Note: the hand-written `sitemap.xml` in the repo root still wins over the plugin for now; it is deleted in Task 8.

- [ ] **Step 8: Commit**

```bash
git add Gemfile _config.yml .gitignore
git commit -m "feat: scaffold Jekyll (github-pages) with news/events/media collections"
```

---

### Task 2: Layouts, SEO head include, sections.css

**Files:**
- Create: `_layouts/default.html`
- Create: `_layouts/item.html`
- Create: `_layouts/section-index.html`
- Create: `_includes/head-seo.html`
- Create: `sections.css`

**Interfaces:**
- Consumes: collection defaults from Task 1 (`page.section` is `news` / `events` / `media`).
- Produces: layouts `item` and `section-index` used by every content file in Tasks 3–5. Front-matter contract for items: `title` (string), `date` (YYYY-MM-DD), `category` (uppercase tag string), `summary` (string), optional `image` (root-absolute path), optional `external_url` + `source` (media), optional `start_date`/`end_date`/`location_name` (events), optional `link` (root-absolute URL a listing card should point at instead of `page.url`). Front-matter contract for index pages: `layout: section-index`, `section`, `title` (zh), `title_en`, `description`, `permalink`.

- [ ] **Step 1: Write `_layouts/default.html`**

```html
<!doctype html>
<html lang="zh-Hant">
<head>
{% include head-seo.html %}
</head>
<body>
  <header class="topbar">
    <div class="topbar__inner">
      <a class="topbar__home" href="/">
        <span class="topbar__back">←</span>
        <span>Cyborg Resilience Co-lab</span>
      </a>
      <div class="topbar__crumb" lang="en">
        {% if page.section %}<a href="/{{ page.section }}/">{{ page.section }}</a>{% endif %}{% if page.collection %} / <b>{{ page.slug | default: page.url | split: "/" | last }}</b>{% endif %}
      </div>
    </div>
  </header>

  {{ content }}

  <footer class="sections-footer">
    <div class="sections-footer__inner">
      <span>© <span id="y"></span> CRC · Cyborg Resilience Co-lab · 賽伯格韌性實驗室</span>
      <nav lang="en">
        <a href="/news/">News</a>
        <a href="/events/">Events</a>
        <a href="/media/">Media</a>
        <a href="/feed.xml">Atom</a>
      </nav>
    </div>
  </footer>
  <script>document.getElementById('y').textContent = new Date().getFullYear();</script>
</body>
</html>
```

- [ ] **Step 2: Write `_includes/head-seo.html`**

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{% assign page_title = page.title | default: site.title %}
<title>{{ page_title }}｜Cyborg Resilience Co-lab</title>
<link rel="icon" type="image/png" href="/favicon.png">
{% assign desc = page.summary | default: page.description | default: site.description | strip_newlines | truncate: 300 %}
<meta name="description" content="{{ desc | escape }}">
<link rel="canonical" href="{{ page.url | absolute_url }}">
<link rel="alternate" hreflang="zh-Hant" href="{{ page.url | absolute_url }}">
<link rel="alternate" hreflang="x-default" href="{{ page.url | absolute_url }}">
<meta property="og:site_name" content="Cyborg Resilience Co-lab">
<meta property="og:type" content="{% if page.collection %}article{% else %}website{% endif %}">
<meta property="og:url" content="{{ page.url | absolute_url }}">
<meta property="og:title" content="{{ page_title | escape }}">
<meta property="og:description" content="{{ desc | escape }}">
<meta property="og:locale" content="zh_TW">
{% if page.image and page.image != "" %}<meta property="og:image" content="{{ page.image | absolute_url }}">{% endif %}
<meta name="twitter:card" content="{% if page.image and page.image != '' %}summary_large_image{% else %}summary{% endif %}">
<meta name="twitter:title" content="{{ page_title | escape }}">
<meta name="twitter:description" content="{{ desc | escape }}">
{% if page.image and page.image != "" %}<meta name="twitter:image" content="{{ page.image | absolute_url }}">{% endif %}
<link rel="alternate" type="application/atom+xml" title="CRC — All updates" href="/feed.xml">
<link rel="alternate" type="application/atom+xml" title="CRC — News" href="/news/feed.xml">
<link rel="alternate" type="application/atom+xml" title="CRC — Events" href="/events/feed.xml">
<link rel="alternate" type="application/atom+xml" title="CRC — Media" href="/media/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&family=Noto+Sans+TC:wght@400;500;700;900&family=Press+Start+2P&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/sections.css">
{% if page.collection %}
<script type="application/ld+json">
{% if page.section == "events" %}
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": {{ page.title | jsonify }},
  "startDate": "{{ page.start_date | default: page.date | date: '%Y-%m-%d' }}",
  {% if page.end_date %}"endDate": "{{ page.end_date | date: '%Y-%m-%d' }}",{% endif %}
  {% if page.location_name %}"location": { "@type": "Place", "name": {{ page.location_name | jsonify }} },{% endif %}
  "eventStatus": "https://schema.org/EventScheduled",
  "description": {{ desc | jsonify }},
  "url": "{{ page.url | absolute_url }}",
  "organizer": { "@type": "Organization", "name": "Cyborg Resilience Co-lab", "url": "{{ site.url }}" }
}
{% else %}
{
  "@context": "https://schema.org",
  "@type": "{% if page.section == 'news' %}NewsArticle{% else %}Article{% endif %}",
  "headline": {{ page.title | jsonify }},
  "datePublished": "{{ page.date | date: '%Y-%m-%d' }}",
  "inLanguage": "zh-Hant",
  "url": "{{ page.url | absolute_url }}",
  {% if page.image and page.image != "" %}"image": "{{ page.image | absolute_url }}",{% endif %}
  "publisher": { "@type": "Organization", "name": "Cyborg Resilience Co-lab", "url": "{{ site.url }}" },
  "description": {{ desc | jsonify }}
}
{% endif %}
</script>
{% endif %}
```

- [ ] **Step 3: Write `_layouts/item.html`**

```html
---
layout: default
---
<main class="item-page">
  <article class="item container">
    <div class="crc-news__meta">
      <span class="crc-news__date">{{ page.date | date: "%Y-%b-%d" | upcase }}</span>
      <span class="crc-news__cat">{{ page.category }}</span>
      {% if page.source %}<span class="crc-news__cat" lang="en">{{ page.source }}</span>{% endif %}
    </div>
    <h1 class="item__title">{{ page.title }}</h1>
    {% if page.image and page.image != "" %}
    <img class="item__image" src="{{ page.image }}" alt="{{ page.title | escape }}">
    {% endif %}
    <div class="item__body">
      {{ content }}
    </div>
    {% if page.external_url %}
    <p><a class="crc-btn crc-btn--primary crc-btn--md" href="{{ page.external_url }}" target="_blank" rel="noopener">閱讀原文 View source<span class="crc-btn__arrow" aria-hidden="true">↗</span></a></p>
    {% endif %}
    <p class="item__backlink"><a href="/{{ page.section }}/">← {% if page.section == "news" %}所有訊息 All news{% elsif page.section == "events" %}所有活動 All events{% else %}所有媒體報導 All media{% endif %}</a></p>
  </article>
</main>
```

- [ ] **Step 4: Write `_layouts/section-index.html`**

```html
---
layout: default
---
{% assign items = site[page.section] | sort: "date" | reverse %}
<main class="index-page">
  <div class="container">
    <div class="section__head">
      <h1 class="crc-heading">
        <span class="crc-heading__en" lang="en">{{ page.title_en }}</span>
        <span class="crc-heading__zh">{{ page.title }}</span>
      </h1>
      <p class="index-page__desc">{{ page.description }}</p>
      <p class="index-page__feed" lang="en"><a href="/{{ page.section }}/feed.xml">Atom feed ↗</a></p>
    </div>

    {{ content }}

    <div class="index-page__list">
      {% for item in items %}
      <a class="crc-news crc-news--link{% if forloop.index <= 3 %} crc-news--featured{% endif %}" href="{{ item.link | default: item.url }}">
        <div class="crc-news__meta">
          <span class="crc-news__date">{{ item.date | date: "%Y-%b-%d" | upcase }}</span>
          <span class="crc-news__cat">{{ item.category }}</span>
          {% if item.source %}<span class="crc-news__cat" lang="en">{{ item.source }}</span>{% endif %}
        </div>
        <div class="crc-news__row">
          <div>
            <h2 class="crc-news__title">{{ item.title }}</h2>
            <p class="crc-news__excerpt">{{ item.summary | strip_newlines | truncate: 160 }}</p>
          </div>
          <span class="crc-news__arrow" aria-hidden="true">↗</span>
        </div>
      </a>
      {% endfor %}
    </div>
  </div>
</main>
```

- [ ] **Step 5: Write `sections.css`**

```css
/* ============================================================
   CRC — shared styles for Jekyll section pages
   (/news/, /events/, /media/ indexes + item pages)
   Loads after /styles.css and reuses its tokens.
   ============================================================ */

/* ---------- top bar ---------- */
.topbar{position:sticky;top:0;z-index:50;background:var(--surface-page);
  border-bottom:1px solid var(--ink-100)}
.topbar__inner{max-width:1100px;margin:0 auto;padding:14px 24px;
  display:flex;align-items:center;justify-content:space-between;gap:16px}
.topbar__home{display:inline-flex;align-items:center;gap:10px;text-decoration:none;
  font-family:var(--font-display);font-weight:600;font-size:14px;color:var(--text-primary)}
.topbar__back{display:inline-block;transition:transform .18s ease}
.topbar__home:hover .topbar__back{transform:translateX(-3px)}
.topbar__crumb{font-family:var(--font-display);font-size:12px;letter-spacing:.08em;
  text-transform:lowercase;color:var(--text-secondary)}
.topbar__crumb a{color:inherit;text-decoration:none}
.topbar__crumb b{color:var(--crc-purple)}

/* ---------- shared page shell ---------- */
.item-page,.index-page{padding:56px 0 80px}
.item-page .container,.index-page .container{max-width:1100px;margin:0 auto;padding:0 24px}

/* ---------- item page ---------- */
.item{max-width:760px}
.item__title{font-family:var(--font-body);font-weight:900;
  font-size:clamp(26px,4vw,40px);line-height:1.3;color:var(--text-primary);margin:14px 0 24px}
.item__image{max-width:100%;border-radius:var(--radius-lg);margin:0 0 24px}
.item__body{font-size:16px;line-height:1.9;color:var(--text-primary)}
.item__body p{margin:0 0 1.2em}
.item__body a{color:var(--crc-purple);word-break:break-all}
.item__body blockquote{margin:0 0 1.2em;padding:12px 18px;border-left:4px solid var(--crc-lime);
  background:var(--surface-muted);border-radius:0 var(--radius-lg) var(--radius-lg) 0}
.item__backlink{margin-top:48px;font-family:var(--font-display);font-size:14px}
.item__backlink a{color:var(--crc-purple);text-decoration:none}
.item__backlink a:hover{text-decoration:underline}

/* ---------- section index ---------- */
.index-page__desc{margin:10px 0 0;font-size:15px;line-height:1.7;color:var(--text-secondary);max-width:60ch}
.index-page__feed{margin:8px 0 0;font-family:var(--font-display);font-size:12px;letter-spacing:.08em}
.index-page__feed a{color:var(--crc-purple);text-decoration:none}
.index-page__list{margin-top:36px;display:flex;flex-direction:column}
.crc-news--link{display:block;text-decoration:none;padding:22px 0;border-top:1px solid var(--ink-100)}
.crc-news--link:first-child{border-top:0}
.crc-news--featured .crc-news__title{font-size:23px}
.crc-news--link:hover .crc-news__title{color:var(--text-brand)}
.crc-news--link:hover .crc-news__arrow{transform:translate(2px,-2px)}

/* ---------- footer ---------- */
.sections-footer{border-top:1px solid var(--ink-100);margin-top:40px}
.sections-footer__inner{max-width:1100px;margin:0 auto;padding:22px 24px;
  display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;justify-content:space-between;
  font-family:var(--font-display);font-size:12px;letter-spacing:.05em;color:var(--text-secondary)}
.sections-footer__inner nav{display:flex;gap:16px}
.sections-footer__inner a{color:var(--crc-purple);text-decoration:none;text-transform:uppercase}
.sections-footer__inner a:hover{text-decoration:underline}

@media (max-width:640px){
  .topbar__crumb{display:none}
}
```

- [ ] **Step 6: Build to verify templates parse**

Run: `bundle exec jekyll build`
Expected: builds cleanly (layouts are unused until Task 3, but Liquid syntax errors surface now).

- [ ] **Step 7: Commit**

```bash
git add _layouts _includes sections.css
git commit -m "feat: add item/section-index layouts, SEO head include, sections.css"
```

---

### Task 3: News collection — migrate items + index page

**Files:**
- Create: `_news/2026-02-10-open-register.md`
- Create: `_news/2026-03-25-past-events.md`
- Create: `_news/2026-05-02-hackathon-2026-upcoming.md`
- Create: `news/index.html`

Note: `news/*.js` stays in place until Task 7 (the live homepage still imports it). The two remaining JS items (`2026-05-06-panel-invited-by-rsf.js`, `2026-05-24-after-hackathon.js`) migrate to `_media/` in Task 5, not here — they are external appearances.

**Interfaces:**
- Consumes: `item` / `section-index` layouts and front-matter contract from Task 2.
- Produces: `site.news` with 3 documents at `/news/2026-02-10-open-register/`, `/news/2026-03-25-past-events/`, `/news/2026-05-02-hackathon-2026-upcoming/`; index at `/news/`. Tasks 6–7 iterate `site.news`.

- [ ] **Step 1: Write `_news/2026-02-10-open-register.md`**

````markdown
---
title: 報名開始：【數位韌性論壇】地緣政治下海纜與網路基礎設施
date: 2026-02-10
category: RELEASE
summary: 數位韌性論壇第一場，將好好來檢視海纜議題的各個面向，除了有「台灣海纜動態地圖」和「數位服務韌性檢測」兩個技術專案的分享，讓大家實際了解我們到底要擔心海纜什麼？還將從政策、社會安全、公民參與的角度來檢視海纜的影響層面。
image: /assets/2026-FEB-10-open-register-for-forum.jpg
---

海纜斷光怎麼辦？海纜是不是假議題？

連結網路的海底纜線，近期成為熱門焦點，因為被海圍繞的台灣，對於海纜的各種變化更是格外敏感、易受影響。在不穩定的地緣政治下更顯脆弱。

報名連結：<https://forms.gle/ThgUp5aVk9iiUv5u7>

只是擔心，不如來了解更多！！
{ 數位韌性論壇 } 第一場，將好好來檢視海纜議題的各個面向，除了有「台灣海纜動態地圖」和「數位服務韌性檢測」」兩個技術專案的分享，讓大家實際了解我們到底要擔心海纜什麼？還將從政策、社會安全、公民參與的角度來檢視海纜的影響層面。

CRC 團隊首次辦理的公開活動，歡迎立即報名，跟我們一起辨別問題所在，才能找到應對方式。

ℹ️日期：3月25日（三）
ℹ️時間：1:30 - 17:00（一點報到）
ℹ️地點：Impact Hub 2F （臺北市中正區重慶南路三段2 號）

> 座位有限，煩請登記報名：<https://forms.gle/ThgUp5aVk9iiUv5u7>
````

- [ ] **Step 2: Write `_news/2026-03-25-past-events.md`**

````markdown
---
title: 【簡報連結】數位韌性論壇：地緣政治下海纜與網路基礎設施
date: 2026-03-25
category: EVENT
summary: 數位韌性論壇第一場，將好好來檢視海纜議題的各個面向，除了有「台灣海纜動態地圖」和「數位服務韌性檢測」兩個技術專案的分享，讓大家實際了解我們到底要擔心海纜什麼？還將從政策、社會安全、公民參與的角度來檢視海纜的影響層面。
---

海纜斷光怎麼辦？海纜是不是假議題？

連結網路的海底纜線，近期成為熱門焦點，因為被海圍繞的台灣，對於海纜的各種變化更是格外敏感、易受影響。在不穩定的地緣政治下更顯脆弱。

{ 數位韌性論壇 } 第一場，檢視海纜議題的各個面向，除了有「台灣海纜動態地圖」和「數位服務韌性檢測」」兩個技術專案的分享，讓大家實際了解我們到底要擔心海纜什麼？還將從政策、社會安全、公民參與的角度來檢視海纜的影響層面。

- 彭宬簡報連結：<https://crcolab.github.io/crccolab-mar-25-2026-internetional-network-degraded-simulation/>
- 尤理衡簡報連結：<https://drive.google.com/file/d/1n9mbFNVeukMt3g_ywP8ne9366JWWhnT5/view>
- Irvin Chen 簡報連結：<http://poslab.info/slide/20260325>

ℹ️日期：3月25日（三）
ℹ️時間：1:30 - 17:00（一點報到）
ℹ️地點：Impact Hub 2F （臺北市中正區重慶南路三段2 號）
````

- [ ] **Step 3: Write `_news/2026-05-02-hackathon-2026-upcoming.md`**

````markdown
---
title: 即將登場：數位韌性國際黑客松 2026 · CRC × OpenFun
date: 2026-05-02
category: UPCOMING
summary: 5月23日暖身行動、5月24日一日黑客松。三場主題座談 + Off-the-grid 通訊突圍挑戰賽，中央研究院人文社會科學館。烏克蘭、緬甸與台灣實作者齊聚，探討斷網情境下的通訊韌性。
---

連結網路的海底纜線，近期成為熱門焦點。被海圍繞的台灣，對於海纜的各種變化更是格外敏感、易受影響，在不穩定的地緣政治下更顯脆弱。當網路真的消失，我們還能把訊息傳出去嗎？

CRC 與歐噴有限公司（OpenFun Inc.）共同主辦這場兩日活動，邀請來自烏克蘭（dComms）、緬甸（ASORCOM）與台灣的實作者，分享在戰區、叢林與離島偏鄉裡，如何用 Meshtastic、Reticulum、聯邦式協定、本地伺服器等替代方案建立 off-the-grid 通訊韌性。

日期：5月23日（六）暖身行動 · 5月24日（日）一日黑客松
地點：中央研究院 人文社會科學館（台北南港）
形式：主題講座 · 圓桌交流 · 場邊通訊挑戰賽

【座談場次｜5月24日（日）】

- 數位生命線：關於網路海纜你該知道的一切（10:30–12:00）
- 斷網之後：打造烏克蘭、緬甸與台灣的通訊韌性網絡（13:00–14:30）
- 數位韌性實驗室：Off-the-Grid Network 技術交流（15:30–16:30）

【場邊挑戰賽｜5月23日（六）及5月24日（日）】

橫跨整棟人文館的通訊突圍任務——操作 Meshtastic 留言板、Reticulum 跨媒介傳輸、「飛鴿傳書」，一關一關突破限制！

活動詳情：[crcolab.art/events/hackathon-2026/](/events/hackathon-2026/)
````

- [ ] **Step 4: Write `news/index.html`**

```html
---
layout: section-index
section: news
title: 最新訊息
title_en: Latest News
description: CRC 的公告與更新——論壇、報名、專案發布。Announcements and updates from Cyborg Resilience Co-lab.
permalink: /news/
---
```

- [ ] **Step 5: Build and verify**

Run: `bundle exec jekyll build && ls _site/news/ && grep -l "NewsArticle" _site/news/2026-02-10-open-register/index.html`
Expected: `_site/news/` contains `index.html`, `2026-02-10-open-register/`, `2026-03-25-past-events/`, `2026-05-02-hackathon-2026-upcoming/` (plus the legacy `.js` files — fine for now); grep prints the file path (JSON-LD present).

- [ ] **Step 6: Eyeball in browser**

Run: `bundle exec jekyll serve` and open `http://127.0.0.1:4000/news/` and one item page.
Expected: topbar with ← back-link and crumb, heading in site style, three items listed newest-first, item pages render body with clickable links.

- [ ] **Step 7: Commit**

```bash
git add _news news/index.html
git commit -m "feat: migrate news items to Jekyll collection with /news/ index"
```

---

### Task 4: Events collection + index page

**Files:**
- Create: `_events/2026-05-23-hackathon-2026.md`
- Create: `events/index.html`

**Interfaces:**
- Consumes: layouts from Task 2; `link` front-matter (listing cards point at the full static page instead of the collection page).
- Produces: `site.events` with 1 document at `/events/2026-05-23-hackathon-2026/`; index at `/events/`. The static `events/hackathon-2026/` is untouched and keeps its URL.

- [ ] **Step 1: Write `_events/2026-05-23-hackathon-2026.md`**

````markdown
---
title: 數位韌性國際黑客松 2026 · CRC × OpenFun
date: 2026-05-23
start_date: 2026-05-23
end_date: 2026-05-24
category: HACKATHON
location_name: 中央研究院 人文社會科學館（台北南港）
summary: 5月23日暖身行動、5月24日一日黑客松。三場主題座談 + Off-the-grid 通訊突圍挑戰賽。烏克蘭（dComms）、緬甸（ASORCOM）與台灣實作者齊聚，探討斷網情境下的通訊韌性。
link: /events/hackathon-2026/
external_url: /events/hackathon-2026/
---

CRC 與歐噴有限公司（OpenFun Inc.）共同主辦的兩日活動：5月23日（六）暖身行動、5月24日（日）一日黑客松，地點在中央研究院人文社會科學館。

三場主題座談——「數位生命線：關於網路海纜你該知道的一切」、「斷網之後：打造烏克蘭、緬甸與台灣的通訊韌性網絡」、「數位韌性實驗室：Off-the-Grid Network 技術交流」——加上橫跨整棟人文館的場邊通訊突圍挑戰賽（Meshtastic 留言板、Reticulum 跨媒介傳輸、飛鴿傳書）。

完整議程與活動紀錄請見活動頁：[數位韌性國際黑客松 2026](/events/hackathon-2026/)
````

- [ ] **Step 2: Write `events/index.html`**

```html
---
layout: section-index
section: events
title: 活動
title_en: Events
description: CRC 主辦與協辦的論壇、黑客松與工作坊。Forums, hackathons and workshops organized by CRC.
permalink: /events/
---
```

- [ ] **Step 3: Build and verify**

Run: `bundle exec jekyll build && grep -o 'href="/events/hackathon-2026/"' _site/events/index.html | head -1 && diff -r _site/events/hackathon-2026 events/hackathon-2026`
Expected: grep prints `href="/events/hackathon-2026/"` (listing card points at the static page via `link`); diff prints nothing (static event page still passes through byte-identical).

- [ ] **Step 4: Commit**

```bash
git add _events events/index.html
git commit -m "feat: add events collection and /events/ index"
```

---

### Task 5: Media collection ("As Seen on Media") + index page

**Files:**
- Create: `_media/2026-05-06-panel-invited-by-rsf.md`
- Create: `_media/2026-05-24-g0v-summit-panel-slides.md`
- Create: `media/index.html`

**Interfaces:**
- Consumes: layouts from Task 2; `source` front-matter renders as an extra tag on cards and item pages.
- Produces: `site.media` with 2 documents; index at `/media/`. Note these two items previously lived in `news/*.js`; the JS files are deleted in Task 7.

- [ ] **Step 1: Write `_media/2026-05-06-panel-invited-by-rsf.md`**

````markdown
---
title: Slides of Undersea Cable Issue and Introduction of Meshtastic Taiwan (invitation by RSF)
date: 2026-05-06
category: TALK
source: Reporters Without Borders (RSF)
summary: 「簡報連結」無國界記者邀請分享海纜議題與 Meshtastic 社群
---

Thanks to Reporters Without Borders (RSF) for inviting us to share about the undersea cable issue and the Meshtastic Taiwan community, the following are the slide decks of the presentation:

- CHENG PENG's Slide Decks: <https://paulpengtw.github.io/crccolab-May-6-2026-why-cable-cuts-matters/> (Licsense: CC BY-SA 4.0)
- Sean Ching's Slide Decks: <https://docs.google.com/presentation/d/12XXii10OHNy3xO8sI9PzjoscqG5FojyzFT7FaBgDScc/edit> (Licsense: Beerware)
````

- [ ] **Step 2: Write `_media/2026-05-24-g0v-summit-panel-slides.md`**

````markdown
---
title: Slide Decks of Our Panel Discussion (g0v Summit 2026)
date: 2026-05-24
category: PANEL
source: g0v Summit 2026
summary: 「簡報連結」數位韌性系列活動 (at) g0v Summit 2026
---

數位韌性系列活動 (at) g0v Summit 2026 的簡報連結：

**數位生命線：關於網路海纜你該知道的一切 Digital Lifeline: Everything You Need to Know About Subsea Cables**

- 周詳 Sean Chou: <https://docs.google.com/presentation/d/1Pj9pSy5K9w1ehX5dsC7cOoDFwmkwbCS2cEdn2K981sc/edit> (All rights reserved)
- 唐若凌 Athena Tong: <https://drive.google.com/file/d/1X0F9t83NNC7mw5-82mB0jen2mLDl2EdU/view> (All rights reserved)
- 彭宬 CHENG PENG: <https://paulpengtw.github.io/crccolab-implications-of-internet-traffics-drop-to-50-percent-and-what-to-do/> (Licsense: CC BY-SA 4.0)

**斷網之後：打造烏克蘭、緬甸與台灣的通訊韌性網絡 After the Blackout: Off-the-grid Communication Solutions in Ukraine, Myanmar and Taiwan**

- Sean Ching: <https://docs.google.com/presentation/d/1OhzajvjjwuUDTEJsLs23il_z6JHUp86_YGE6GeM3hGY/edit> (Licsense: Beerware)
- Aidan: <https://drive.google.com/file/d/1Kf45_w129YS3GOH7H_hPnFn-o1cOOsyC/view>
- Michael Suantak: <https://drive.google.com/file/d/1GSPfOFlLUVFZg3a49uUmzgSovpkLntdc/view>
````

- [ ] **Step 3: Write `media/index.html`**

```html
---
layout: section-index
section: media
title: 媒體報導
title_en: As Seen on Media
description: 媒體報導與對外分享——訪談、座談、演講與簡報。Press coverage, panels, talks and appearances by CRC members.
permalink: /media/
---
```

- [ ] **Step 4: Build and verify**

Run: `bundle exec jekyll build && ls _site/media/ && grep -o '"@type": "Article"' _site/media/2026-05-06-panel-invited-by-rsf/index.html`
Expected: `_site/media/` has `index.html` + two item directories; grep prints `"@type": "Article"`.

- [ ] **Step 5: Commit**

```bash
git add _media media/index.html
git commit -m "feat: add media collection (As Seen on Media) and /media/ index"
```

---

### Task 6: Atom feeds (combined + per-section)

**Files:**
- Create: `feed.xml`
- Create: `news/feed.xml`
- Create: `events/feed.xml`
- Create: `media/feed.xml`
- Create: `_includes/atom-entries.html`

**Interfaces:**
- Consumes: `site.news`, `site.events`, `site.media` (Tasks 3–5).
- Produces: valid Atom 1.0 at `/feed.xml`, `/news/feed.xml`, `/events/feed.xml`, `/media/feed.xml` (already advertised by `head-seo.html` from Task 2). `_includes/atom-entries.html` takes a Liquid variable `entries` (sorted docs array).

- [ ] **Step 1: Write `_includes/atom-entries.html`**

```xml
{% for item in include.entries limit: 20 %}
  <entry>
    <title>{{ item.title | xml_escape }}</title>
    <link href="{{ item.url | absolute_url }}"/>
    <id>{{ item.url | absolute_url }}</id>
    <updated>{{ item.date | date_to_xmlschema }}</updated>
    <category term="{{ item.category | xml_escape }}"/>
    <summary type="text">{{ item.summary | strip_newlines | xml_escape }}</summary>
    <content type="html">{{ item.content | markdownify | xml_escape }}</content>
    <author><name>Cyborg Resilience Co-lab</name></author>
  </entry>
{% endfor %}
```

- [ ] **Step 2: Write `feed.xml` (repo root)**

```xml
---
permalink: /feed.xml
---
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-Hant">
  <title>Cyborg Resilience Co-lab — All updates</title>
  <subtitle>News, events and media appearances from CRC 賽伯格韌性實驗室</subtitle>
  <link href="{{ '/' | absolute_url }}"/>
  <link rel="self" href="{{ '/feed.xml' | absolute_url }}"/>
  <id>{{ '/' | absolute_url }}</id>
  {% assign all = site.news | concat: site.events | concat: site.media | sort: "date" | reverse %}
  <updated>{{ all.first.date | date_to_xmlschema }}</updated>
  {% include atom-entries.html entries=all %}
</feed>
```

- [ ] **Step 3: Write `news/feed.xml`**

```xml
---
permalink: /news/feed.xml
---
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-Hant">
  <title>Cyborg Resilience Co-lab — News</title>
  <link href="{{ '/news/' | absolute_url }}"/>
  <link rel="self" href="{{ '/news/feed.xml' | absolute_url }}"/>
  <id>{{ '/news/' | absolute_url }}</id>
  {% assign entries = site.news | sort: "date" | reverse %}
  <updated>{{ entries.first.date | date_to_xmlschema }}</updated>
  {% include atom-entries.html entries=entries %}
</feed>
```

- [ ] **Step 4: Write `events/feed.xml`**

```xml
---
permalink: /events/feed.xml
---
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-Hant">
  <title>Cyborg Resilience Co-lab — Events</title>
  <link href="{{ '/events/' | absolute_url }}"/>
  <link rel="self" href="{{ '/events/feed.xml' | absolute_url }}"/>
  <id>{{ '/events/' | absolute_url }}</id>
  {% assign entries = site.events | sort: "date" | reverse %}
  <updated>{{ entries.first.date | date_to_xmlschema }}</updated>
  {% include atom-entries.html entries=entries %}
</feed>
```

- [ ] **Step 5: Write `media/feed.xml`**

```xml
---
permalink: /media/feed.xml
---
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-Hant">
  <title>Cyborg Resilience Co-lab — As Seen on Media</title>
  <link href="{{ '/media/' | absolute_url }}"/>
  <link rel="self" href="{{ '/media/feed.xml' | absolute_url }}"/>
  <id>{{ '/media/' | absolute_url }}</id>
  {% assign entries = site.media | sort: "date" | reverse %}
  <updated>{{ entries.first.date | date_to_xmlschema }}</updated>
  {% include atom-entries.html entries=entries %}
</feed>
```

- [ ] **Step 6: Build and validate**

Run: `bundle exec jekyll build && xmllint --noout _site/feed.xml _site/news/feed.xml _site/events/feed.xml _site/media/feed.xml && grep -c "<entry>" _site/feed.xml`
Expected: xmllint silent (well-formed); combined feed has `6` entries (3 news + 1 event + 2 media). Optionally paste `_site/feed.xml` into https://validator.w3.org/feed/ for full Atom validation.

- [ ] **Step 7: Commit**

```bash
git add feed.xml news/feed.xml events/feed.xml media/feed.xml _includes/atom-entries.html
git commit -m "feat: add Atom feeds (combined + per-section)"
```

---

### Task 7: Homepage integration — latest-3 blocks, retire JS news modules + modal

**Files:**
- Create: `api/latest.json`
- Modify: `script.js` (rewrite `loadNews`, drop modal import)
- Modify: `index.html` (nav/footer links, feed `<link>` tags, remove modal markup)
- Modify: `styles.css` (append small block for linked cards/section heads)
- Delete: `news/index.js`, `news/2026-02-10-open-register.js`, `news/2026-03-25-past-events.js`, `news/2026-05-02-hackathon-2026-upcoming.js`, `news/2026-05-06-panel-invited-by-rsf.js`, `news/2026-05-24-after-hackathon.js`, `animations/news-modal.js`

**Interfaces:**
- Consumes: `site.news` / `site.events` / `site.media`; `link` front-matter override (Task 4).
- Produces: `/api/latest.json` with shape `{ "news": [ { "title", "date", "category", "summary", "url" } × ≤3 ], "events": [...], "media": [...] }` — dates preformatted as `YYYY-MON-DD` uppercase; `url` already honors `link` overrides. Consumed only by `script.js`.

- [ ] **Step 1: Write `api/latest.json`**

```json
---
permalink: /api/latest.json
---
{% assign sections = "news,events,media" | split: "," %}
{
{% for name in sections %}
  "{{ name }}": [
    {% assign docs = site[name] | sort: "date" | reverse %}
    {% for item in docs limit: 3 %}
    {
      "title": {{ item.title | jsonify }},
      "date": {{ item.date | date: "%Y-%b-%d" | upcase | jsonify }},
      "category": {{ item.category | jsonify }},
      "summary": {{ item.summary | strip_newlines | truncate: 160 | jsonify }},
      "url": {{ item.link | default: item.url | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]{% unless forloop.last %},{% endunless %}
{% endfor %}
}
```

- [ ] **Step 2: Verify the JSON builds valid**

Run: `bundle exec jekyll build && python3 -m json.tool _site/api/latest.json`
Expected: pretty-printed JSON, 3 news / 1 event / 2 media entries; event url is `/events/hackathon-2026/`.

- [ ] **Step 3: Rewrite the news loader in `script.js`**

Replace lines 1–34 (the imports and `loadNews`) — keep `escapeHtml`, `initThemeToggle`, and the `DOMContentLoaded` block, but remove `openNewsModal, initNewsModal` from imports and `initNewsModal();` from the ready handler:

```js
import { initSurveillanceHUD } from './animations/surveillance-hud.js';
import { initCyborgGlitch } from './animations/cyborg-glitch.js';

const HOME_SECTIONS = [
  { key: 'news',   zh: '最新訊息', en: 'Latest News',      href: '/news/'   },
  { key: 'events', zh: '活動',     en: 'Events',           href: '/events/' },
  { key: 'media',  zh: '媒體報導', en: 'As Seen on Media', href: '/media/'  },
];

async function loadNews(){
  const container = document.getElementById('news-list');
  if(!container) return;

  let data;
  try {
    const res = await fetch('/api/latest.json');
    if(!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch(e){
    container.innerHTML = HOME_SECTIONS.map(s =>
      `<p class="news__fallback"><a href="${s.href}">${escapeHtml(s.zh)} ${escapeHtml(s.en)} →</a></p>`
    ).join('');
    return;
  }

  container.innerHTML = HOME_SECTIONS.map(s => {
    const items = (data[s.key] || []).map(item => `
      <a class="crc-news crc-news--link" href="${escapeHtml(item.url)}">
        <div class="crc-news__meta">
          <span class="crc-news__date">${escapeHtml(item.date)}</span>
          <span class="crc-news__cat">${escapeHtml(item.category)}</span>
        </div>
        <div class="crc-news__row">
          <div>
            <h4 class="crc-news__title">${escapeHtml(item.title)}</h4>
            <p class="crc-news__excerpt">${escapeHtml(item.summary)}</p>
          </div>
          <span class="crc-news__arrow" aria-hidden="true">↗</span>
        </div>
      </a>`).join('');
    return `
      <div class="news__section">
        <div class="news__section-head">
          <h3 class="news__section-title">${escapeHtml(s.zh)} <span lang="en">${escapeHtml(s.en)}</span></h3>
          <a class="news__section-more" href="${s.href}">全部 View all →</a>
        </div>
        ${items}
      </div>`;
  }).join('');
}
```

The `DOMContentLoaded` handler becomes:

```js
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  initSurveillanceHUD();
  initThemeToggle();
  initCyborgGlitch();
});
```

- [ ] **Step 4: Delete retired modules**

```bash
git rm news/index.js news/2026-02-10-open-register.js news/2026-03-25-past-events.js news/2026-05-02-hackathon-2026-upcoming.js news/2026-05-06-panel-invited-by-rsf.js news/2026-05-24-after-hackathon.js animations/news-modal.js
```

- [ ] **Step 5: Update `index.html`**

Four edits:

1. Nav (lines 121–122): point News/Events at the new indexes and add Media:

```html
      <a href="/news/" class="site-nav__link"><span class="zh">訊息</span><span class="en" lang="en">News</span></a>
      <a href="/events/" class="site-nav__link"><span class="zh">活動</span><span class="en" lang="en">Events</span></a>
      <a href="/media/" class="site-nav__link"><span class="zh">媒體</span><span class="en" lang="en">Media</span></a>
```

2. Footer nav (lines 382–383): same change plus Media:

```html
          <a href="/news/">訊息 News</a>
          <a href="/events/">活動 Events</a>
          <a href="/media/">媒體 Media</a>
```

3. In `<head>`, after the canonical/hreflang links, add feed discovery:

```html
  <link rel="alternate" type="application/atom+xml" title="CRC — All updates" href="/feed.xml">
  <link rel="alternate" type="application/atom+xml" title="CRC — News" href="/news/feed.xml">
  <link rel="alternate" type="application/atom+xml" title="CRC — Events" href="/events/feed.xml">
  <link rel="alternate" type="application/atom+xml" title="CRC — Media" href="/media/feed.xml">
```

4. Remove the modal markup (lines 399–408, the `<div id="news-modal">…</div>` block). The `#news` section, `#news-list` container, header CTA `href="#news"`, and partner card all stay — `/#news` keeps resolving.

- [ ] **Step 6: Append homepage-block styles to `styles.css`**

At the end of the file:

```css
/* ---------- homepage latest-3 section blocks ---------- */
.news__section{margin-bottom:34px}
.news__section:last-child{margin-bottom:0}
.news__section-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;
  border-bottom:2px solid var(--crc-lime);padding-bottom:8px;margin-bottom:6px}
.news__section-title{margin:0;font-family:var(--font-body);font-weight:700;font-size:17px;color:var(--text-primary)}
.news__section-title span{font-family:var(--font-display);font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--text-mono);margin-left:8px}
.news__section-more{font-family:var(--font-display);font-size:12px;letter-spacing:.06em;
  color:var(--crc-purple);text-decoration:none;white-space:nowrap}
.news__section-more:hover{text-decoration:underline}
.crc-news--link{display:block;text-decoration:none}
.crc-news--link:hover .crc-news__title{color:var(--text-brand)}
.crc-news--link:hover .crc-news__arrow{transform:translate(2px,-2px)}
.news__fallback a{font-family:var(--font-display);color:var(--crc-purple);text-decoration:none}
```

Note: `.crc-news--link` also appears in `sections.css` with index-page-specific extras (borders, padding); the three shared hover/display rules here are what the homepage needs since it loads only `styles.css`.

- [ ] **Step 7: Build and verify homepage**

Run: `bundle exec jekyll serve`, open `http://127.0.0.1:4000/`.
Expected: news section shows three titled blocks (最新訊息 / 活動 / 媒體報導), each with up to 3 cards linking to item pages (event card → `/events/hackathon-2026/`), "全部 View all →" links work, no console errors, no modal on click. Also verify `http://127.0.0.1:4000/#news` scrolls to the section.

- [ ] **Step 8: Commit**

```bash
git add api/latest.json script.js index.html styles.css
git commit -m "feat: homepage latest-3 blocks from /api/latest.json; retire JS news modules and modal"
```

---

### Task 8: Crawl infra — sitemap plugin, robots.txt, llms.txt

**Files:**
- Delete: `sitemap.xml` (hand-maintained; `jekyll-sitemap` from Task 1 takes over)
- Modify: `robots.txt`
- Create: `llms.txt`

**Interfaces:**
- Consumes: all pages from Tasks 3–7 (sitemap enumerates them).
- Produces: generated `/sitemap.xml`; `/robots.txt` allowing AI crawlers; `/llms.txt` describing the site.

- [ ] **Step 1: Delete the hand-maintained sitemap**

```bash
git rm sitemap.xml
```

- [ ] **Step 2: Rewrite `robots.txt`**

```
User-agent: *
Allow: /

# AI / LLM crawlers — explicitly welcome
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://crcolab.art/sitemap.xml
```

- [ ] **Step 3: Write `llms.txt`**

```markdown
# Cyborg Resilience Co-lab (CRC) · 賽伯格韌性實驗室

> 研究 × 科技 × 藝術的跨域行動平台，探索戰爭、災難與科技風險交疊下的數位韌性。
> A Taiwan-based initiative of civic hackers, digital-rights activists, researchers
> and artists working on digital resilience: subsea cables, off-the-grid
> communication (Meshtastic, Reticulum), and internet-shutdown preparedness.

Primary language is Traditional Chinese (zh-Hant) with English secondary.
All content pages are static HTML — no JavaScript required to read them.

## Sections

- [Latest News 最新訊息](https://crcolab.art/news/): announcements and updates
- [Events 活動](https://crcolab.art/events/): forums, hackathons, workshops
- [As Seen on Media 媒體報導](https://crcolab.art/media/): press coverage, panels, talks

## Feeds (Atom)

- [All updates](https://crcolab.art/feed.xml)
- [News](https://crcolab.art/news/feed.xml)
- [Events](https://crcolab.art/events/feed.xml)
- [Media](https://crcolab.art/media/feed.xml)

## Other

- [Sitemap](https://crcolab.art/sitemap.xml)
- Contact: mclee@gate.sinica.edu.tw · GitHub: https://github.com/crcolab/
```

- [ ] **Step 4: Build and verify**

Run: `bundle exec jekyll build && grep -c "<loc>" _site/sitemap.xml && grep "GPTBot" _site/robots.txt && cat _site/llms.txt >/dev/null && echo OK`
Expected: `<loc>` count ≥ 10 (homepage, 3 indexes, 6 items, static event page); `GPTBot` line prints; `OK`.

- [ ] **Step 5: Commit**

```bash
git add robots.txt llms.txt
git commit -m "feat: generated sitemap, AI-crawler robots.txt, llms.txt"
```

---

### Task 9: CLAUDE.md update + final verification

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: everything above; documents the new authoring flow for future sessions.

- [ ] **Step 1: Update CLAUDE.md**

Make these edits (keep the rest of the file intact):

1. In **What this is**, replace the first paragraph's "Plain HTML/CSS/JS, no build step, deployed via GitHub Pages from `main`." with:

```markdown
Static site for **Cyborg Resilience Co-lab (CRC)** at `crcolab.art`. Plain HTML/CSS/JS
plus Jekyll (built by GitHub Pages on push from `main`) for the content sections
(`/news/`, `/events/`, `/media/`), their item pages, Atom feeds, and sitemap.
```

2. In **Layout**, replace the `news/` bullet and add the Jekyll dirs:

```markdown
- `_news/`, `_events/`, `_media/` — content collections, one Markdown file per item
  (front-matter: `title`, `date`, `category`, `summary`, optional `image`,
  `source`/`external_url` for media, `start_date`/`end_date`/`location_name` for
  events, `link` to point listings at another URL)
- `_layouts/`, `_includes/` — Jekyll templates (item pages, section indexes, SEO head, Atom entries)
- `news/`, `events/`, `media/` — section index pages + per-section `feed.xml`
- `api/latest.json` — Liquid-generated JSON the homepage fetches for its latest-3 blocks
- `sections.css` — shared styles for section pages (loads after `styles.css`)
```

3. In **Conventions**, replace the "No build step." bullet with:

```markdown
- **No local build tooling beyond Jekyll-on-Pages.** GitHub Pages runs Jekyll on push;
  don't introduce bundlers, npm, or frameworks. `Gemfile` (github-pages gem) exists
  only for local preview; `_site/` and `Gemfile.lock` stay gitignored.
- **Adding a content item:** drop a Markdown file in `_news/`/`_events/`/`_media/`
  named `YYYY-MM-DD-slug.md` — indexes, feeds, sitemap, and homepage JSON update
  automatically on build. No registration file to edit.
```

and replace the "News items: ES modules…" bullet with:

```markdown
- **Homepage news blocks:** rendered by `script.js` from `/api/latest.json`; don't
  hard-code items into `index.html`.
```

4. Replace **Local preview** with:

```markdown
​```sh
bundle exec jekyll serve   # full site incl. generated sections (http://127.0.0.1:4000)
python3 -m http.server 8000  # static-only work (landing page, event sub-pages)
​```
```

(Write the fences as plain ``` — the `​` above only escapes nesting in this plan.)

5. Update the design-token table note: append one line under the table:

```markdown
The landing page's `styles.css` is the source of truth for tokens on generated
section pages too (`--crc-purple:#46288B`, `--crc-lime:#B7D32D`, Funnel Display);
the table above applies to the older event sub-pages.
```

- [ ] **Step 2: Full verification pass**

Run: `bundle exec jekyll build && diff _site/index.html index.html; diff -r _site/events/hackathon-2026 events/hackathon-2026 && xmllint --noout _site/feed.xml _site/news/feed.xml _site/events/feed.xml _site/media/feed.xml && python3 -m json.tool _site/api/latest.json > /dev/null && echo ALL-OK`

Expected: both diffs print nothing (`index.html` has no front matter, so the Task-7-edited version passes through byte-identical; the event page is untouched); feeds well-formed; JSON valid; `ALL-OK`.

- [ ] **Step 3: Manual browse checklist**

With `bundle exec jekyll serve` running, check: `/`, `/#news`, `/news/`, `/events/`, `/media/`, one item page per section, `/events/hackathon-2026/`, `/feed.xml`, `/llms.txt`. Landing page must look pixel-identical to `main` apart from the news area's new three-block layout.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document Jekyll authoring flow in CLAUDE.md"
```

Do NOT push. Report completion to the user; they review and push.
