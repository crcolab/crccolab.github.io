import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { assertApprovedHeadingScale } from './helpers/heading-scale-css.mjs';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('built locale routes expose correct metadata and no Hackathon duplicate', async () => {
  const [zhHome, enHome, zhArticle, enArticle] = await Promise.all([
    read('_site/index.html'),
    read('_site/en/index.html'),
    read('_site/news/2026-06-29-c-lab-residency/index.html'),
    read('_site/en/news/2026-06-29-c-lab-residency/index.html'),
  ]);
  assert.match(zhHome, /<html lang="zh-Hant">/);
  assert.match(enHome, /<html lang="en-US">/);
  assert.match(zhArticle, /hreflang="en-US"[^>]+\/en\/news\/2026-06-29-c-lab-residency\//);
  assert.match(enArticle, /hreflang="zh-Hant"[^>]+\/news\/2026-06-29-c-lab-residency\//);
  await assert.rejects(read('_site/en/events/hackathon-2026/index.html'), error => error?.code === 'ENOENT');
  await assert.rejects(read('_site/en/events/2026-05-23-hackathon-2026/index.html'), error => error?.code === 'ENOENT');
});

test('built home and section headers retain narrow-viewport reflow rules in both locales', async () => {
  const [zhHome, enHome, zhSection, enSection, css, sections] = await Promise.all([
    read('_site/index.html'), read('_site/en/index.html'),
    read('_site/news/index.html'), read('_site/en/news/index.html'),
    read('_site/styles.css'), read('_site/sections.css'),
  ]);
  for (const home of [zhHome, enHome]) {
    assert.match(home, /class="crc-btn crc-btn--primary crc-btn--sm site-header__latest"/);
  }
  for (const section of [zhSection, enSection]) {
    assert.match(section, /<header class="topbar">[\s\S]*class="locale-switcher"/);
  }
  assert.match(css, /@media \(max-width:520px\)[\s\S]*\.site-header__latest\{display:none\}/);
  assert.match(css, /@media \(max-width:360px\)[\s\S]*\.site-header__actions\{[^}]*width:100%/);
  assert.match(sections, /@media \(max-width:360px\)[\s\S]*\.topbar__home\{[^}]*min-width:var\(--control-min\)/);
});

test('built locale homepages retain a 44px header-brand target', async () => {
  const [zhHome, enHome, css] = await Promise.all([
    read('_site/index.html'), read('_site/en/index.html'), read('_site/styles.css'),
  ]);
  for (const home of [zhHome, enHome]) assert.match(home, /class="site-header__brand"/);
  assert.match(css, /\.site-header__brand\{[^}]*min-height:var\(--control-min\)/);
});

test('built locale section footers retain 44px link targets', async () => {
  const [zhSection, enSection, sections] = await Promise.all([
    read('_site/news/index.html'), read('_site/en/news/index.html'), read('_site/sections.css'),
  ]);
  for (const section of [zhSection, enSection]) {
    assert.match(section, /<footer class="sections-footer">[\s\S]*<nav/);
  }
  assert.match(sections, /\.sections-footer__inner a\{[^}]*min-width:var\(--control-min\)[^}]*justify-content:center/);
});

test('built locale section navigation retains supporting text and standalone targets', async () => {
  const [zhIndex, enIndex, zhItem, enItem, sections] = await Promise.all([
    read('_site/news/index.html'), read('_site/en/news/index.html'),
    read('_site/news/2026-06-29-c-lab-residency/index.html'),
    read('_site/en/news/2026-06-29-c-lab-residency/index.html'),
    read('_site/sections.css'),
  ]);
  for (const index of [zhIndex, enIndex]) {
    assert.match(index, /class="topbar__home"/);
    assert.match(index, /class="topbar__crumb"/);
    assert.match(index, /class="index-page__feed"/);
    assert.match(index, /<footer class="sections-footer">/);
  }
  for (const item of [zhItem, enItem]) {
    assert.match(item, /class="topbar__crumb"/);
    assert.match(item, /class="item__backlink"/);
  }
  assert.match(
    sections,
    /\.topbar__home,\.topbar__crumb a,\.index-page__feed,\.index-page__feed a,\.sections-footer__inner a,\.item__backlink\{font-size:var\(--fs-supporting\)\}/,
  );
  assert.match(
    sections,
    /\.topbar__crumb a,\.index-page__feed a,\.item__backlink a\{display:inline-flex;align-items:center;min-height:var\(--control-min\)\}/,
  );
  assert.doesNotMatch(sections, /\.item__body a\{[^}]*min-height:var\(--control-min\)/);
});

test('built locale homepages retain the approved heading scale', async () => {
  const [zhHome, enHome, css] = await Promise.all([
    read('_site/index.html'), read('_site/en/index.html'), read('_site/styles.css'),
  ]);
  assert.match(zhHome, /class="crc-heading__zh"/);
  assert.match(enHome, /class="crc-heading__en"/);
  assertApprovedHeadingScale(css, 'generated _site/styles.css');
});

test('built feed UI and metadata are localized independently', async () => {
  const [zhNews, enNews, zhFeed, enFeed, zhNewsFeed, enNewsFeed] = await Promise.all([
    read('_site/news/index.html'), read('_site/en/news/index.html'),
    read('_site/feed.xml'), read('_site/en/feed.xml'),
    read('_site/news/feed.xml'), read('_site/en/news/feed.xml'),
  ]);
  assert.match(zhNews, /<a href="\/news\/feed\.xml">Atom 訂閱 ↗<\/a>/);
  assert.match(enNews, /<a href="\/en\/news\/feed\.xml">Atom feed ↗<\/a>/);
  assert.match(zhNews, /title="CRC — 所有更新"/);
  assert.match(enNews, /title="CRC — All updates"/);
  assert.match(zhFeed, /<title>Cyborg Resilience Co-lab — 所有更新<\/title>/);
  assert.match(zhFeed, /<subtitle>CRC 賽伯格韌性實驗室的最新訊息、活動與媒體報導<\/subtitle>/);
  assert.match(enFeed, /<title>Cyborg Resilience Co-lab — All updates<\/title>/);
  assert.match(enFeed, /<subtitle>News, events, and media appearances from Cyborg Resilience Co-lab<\/subtitle>/);
  assert.match(zhNewsFeed, /<title>Cyborg Resilience Co-lab — 最新訊息<\/title>/);
  assert.match(enNewsFeed, /<title>Cyborg Resilience Co-lab — News<\/title>/);
});

test('idea pages resolve author_slug to a linked team profile', async () => {
  const [zh, en] = await Promise.all([
    read('_site/ideas/2026-03-25-crc-march-25-decks/index.html'),
    read('_site/en/ideas/2026-03-25-crc-march-25-decks/index.html'),
  ]);
  assert.match(zh, /<p class="item__byline"><a href="\/team\/cheng\/">彭宬<\/a><\/p>/);
  assert.match(en, /<p class="item__byline"><a href="\/en\/team\/cheng\/">CHENG PENG<\/a><\/p>/);
});

test('root feeds and latest-json include ideas entries', async () => {
  const [zhFeed, enFeed, zhLatest, enLatest] = await Promise.all([
    read('_site/feed.xml'),
    read('_site/en/feed.xml'),
    read('_site/api/latest.json').then(JSON.parse),
    read('_site/en/api/latest.json').then(JSON.parse),
  ]);
  assert.match(zhFeed, /\/ideas\/2026-03-25-crc-march-25-decks\//);
  assert.match(enFeed, /\/en\/ideas\/2026-03-25-crc-march-25-decks\//);
  assert.ok(Array.isArray(zhLatest.ideas) && zhLatest.ideas.length >= 1, 'zh latest.json missing ideas[]');
  assert.ok(Array.isArray(enLatest.ideas) && enLatest.ideas.length >= 1, 'en latest.json missing ideas[]');
});

test('idea pages carry Article JSON-LD with resolved author', async () => {
  const zh = await read('_site/ideas/2026-03-25-crc-march-25-decks/index.html');
  assert.match(zh, /"@type"\s*:\s*"Article"/);
  assert.match(zh, /"author"\s*:\s*\{\s*"@type"\s*:\s*"Person"[\s\S]*?"name"\s*:\s*"彭宬"/);
  assert.match(zh, /"inLanguage"\s*:\s*"zh-Hant"/);
});

test('team profile pages carry Person JSON-LD', async () => {
  const zh = await read('_site/team/cheng/index.html');
  assert.match(zh, /"@type"\s*:\s*"Person"/);
  assert.match(zh, /"name"\s*:\s*"彭宬"/);
  assert.match(zh, /"sameAs"\s*:\s*\[[\s\S]*?"https:\/\/github\.com\/paulpengtw"/);
});

test('every built page advertises the ideas Atom feed', async () => {
  const [home, section, item] = await Promise.all([
    read('_site/index.html'),
    read('_site/news/index.html'),
    read('_site/records/2026-05-24-g0v-summit-panel-slides/index.html'),
  ]);
  for (const html of [home, section, item]) {
    assert.match(html, /rel="alternate" type="application\/atom\+xml" title="CRC — 提點子" href="\/ideas\/feed\.xml"/);
  }
});

test('every built subpage footer nav includes Ideas and Team', async () => {
  const section = await read('_site/news/index.html');
  assert.match(section, /<footer class="sections-footer">[\s\S]*href="\/ideas\/"[\s\S]*href="\/team\/"[\s\S]*<\/footer>/);
});

test('llms.txt documents ideas and team', async () => {
  const llms = await read('llms.txt');
  assert.match(llms, /\/ideas\//);
  assert.match(llms, /\/team\//);
  assert.match(llms, /\/ideas\/feed\.xml/);
});

test('team profile pages use the member name in <title>, not the humanized slug', async () => {
  const [zh, en] = await Promise.all([
    read('_site/team/cheng/index.html'),
    read('_site/en/team/cheng/index.html'),
  ]);
  assert.match(zh, /<title>彭宬｜Cyborg Resilience Co-lab<\/title>/);
  assert.match(en, /<title>CHENG PENG｜Cyborg Resilience Co-lab<\/title>/);
});

test('team INDEX pages use the page.title, not Jekyll built-in page.name (filename)', async () => {
  const [zh, en] = await Promise.all([
    read('_site/team/index.html'),
    read('_site/en/team/index.html'),
  ]);
  assert.match(zh, /<title>團隊｜Cyborg Resilience Co-lab<\/title>/);
  assert.match(en, /<title>Team｜Cyborg Resilience Co-lab<\/title>/);
  assert.doesNotMatch(zh, /<title>index\.html/);
  assert.doesNotMatch(en, /<title>index\.html/);
});

test('member Person JSON-LD sameAs carries only the http(s) links from front matter, in source order', async () => {
  const { readdir } = await import('node:fs/promises');
  const webLinks = source => {
    const block = (source.split(/^---$/m)[1] ?? '').match(/^links:\n((?:[ \t]+.*\n?)*)/m)?.[1] ?? '';
    return [...block.matchAll(/^[ \t]+[a-z_]+:[ \t]*(.*?)[ \t]*$/gm)]
      .map(([, value]) => value.replace(/^(["'])(.*)\1$/, '$2'))
      .filter(href => /^https?:\/\//.test(href));
  };
  let checked = 0;
  for (const [dir, route] of [['_team', 'team'], ['_team_en', 'en/team']]) {
    for (const name of (await readdir(new URL(`../${dir}/`, import.meta.url))).filter(file => file.endsWith('.md'))) {
      const path = `_site/${route}/${name.replace(/\.md$/, '')}/index.html`;
      const person = [...(await read(path)).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map(([, json]) => JSON.parse(json))
        .find(entry => entry['@type'] === 'Person');
      assert.ok(person, `${path} lacks a Person JSON-LD block`);
      const expected = webLinks(await read(`${dir}/${name}`));
      if (expected.length) {
        assert.deepEqual(person.sameAs, expected, `${path} sameAs must list its http(s) links in source order`);
      } else {
        assert.ok(!('sameAs' in person), `${path} has no web links, so sameAs must be omitted`);
      }
      assert.doesNotMatch(JSON.stringify(person.sameAs ?? []), /mailto:/, `${path} sameAs must not carry email`);
      checked += 1;
    }
  }
  assert.ok(checked >= 2, 'expected member pages in both locales');
});

test('idea pages without tags omit the keywords JSON-LD field', async () => {
  const zh = await read('_site/ideas/2026-03-25-crc-march-25-decks/index.html');
  assert.doesNotMatch(zh, /"keywords"\s*:\s*""/);
});

test('indexable built pages have unique meta descriptions', async () => {
  const { readdir } = await import('node:fs/promises');
  const skipped = '_site/ideas/household-digital-go-bag/assets';
  const htmlPaths = [];
  const walk = async dir => {
    for (const entry of await readdir(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (path !== skipped) await walk(path);
      } else if (entry.name.endsWith('.html')) {
        htmlPaths.push(path);
      }
    }
  };
  await walk('_site');
  const pathsByDescription = new Map();
  for (const path of htmlPaths) {
    const html = await read(path);
    if (/<meta\s+name="robots"\s+content="[^"]*noindex/.test(html)) continue;
    const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1];
    if (description === undefined) continue;
    pathsByDescription.set(description, [...(pathsByDescription.get(description) ?? []), path]);
  }
  const duplicates = [...pathsByDescription].filter(([, paths]) => paths.length > 1);
  assert.equal(
    duplicates.length,
    0,
    duplicates.map(([description, paths]) => `meta description shared by ${paths.length} pages: ${description}\n  ${paths.join('\n  ')}`).join('\n'),
  );
});

test('built event pages only nest a superEvent that Google can validate as an Event', async () => {
  const { readdir } = await import('node:fs/promises');
  const pages = [];
  for (const prefix of ['_site/events', '_site/en/events']) {
    for (const slug of await readdir(new URL(`../${prefix}`, import.meta.url))) {
      const html = await read(`${prefix}/${slug}/index.html`).catch(() => null);
      if (html) pages.push([`${prefix}/${slug}`, html]);
    }
  }
  let nested = 0;
  for (const [path, html] of pages) {
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(json);
      if (!data.superEvent) continue;
      nested += 1;
      assert.ok(data.superEvent.startDate, `${path} superEvent lacks startDate`);
      assert.ok(data.superEvent.location?.name, `${path} superEvent lacks location`);
    }
  }
  assert.ok(nested >= 2, 'the AI for ALL exhibition pages should nest the festival');
});

test('page titles drop the suffix by display width, pinned by a fixture and every built content page', async t => {
  const { readdir } = await import('node:fs/promises');
  // Mirrors _includes/page-title.html: CJK and fullwidth code points count 2, every other code point 1.
  const wide = cp =>
    (cp >= 0x2E80 && cp <= 0xA4CF) || (cp >= 0xAC00 && cp <= 0xD7A3) || (cp >= 0xF900 && cp <= 0xFAFF) ||
    (cp >= 0xFE30 && cp <= 0xFE4F) || (cp >= 0xFF01 && cp <= 0xFF60) || (cp >= 0xFFE0 && cp <= 0xFFE6) ||
    (cp >= 0x20000 && cp <= 0x3FFFD);
  const width = s => [...s].reduce((sum, ch) => sum + (wide(ch.codePointAt(0)) ? 2 : 1), 0);
  const pageTitle = title => {
    if (width(title) + 26 <= 60) return { band: 'full', text: `${title}｜Cyborg Resilience Co-lab` };
    if (width(title) + 5 <= 60) return { band: 'short', text: `${title}｜CRC` };
    return { band: 'none', text: title };
  };
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  const decode = s => s.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (_, name) => {
    if (name[0] !== '#') return named[name.toLowerCase()];
    const hex = name[1] === 'x' || name[1] === 'X';
    return String.fromCodePoint(parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10));
  });

  // (a) Fixture: each <li> is rendered by the include; both its expectation and its text must match the rule.
  const fixture = await read('_site/tests/fixtures/title-suffix.html');
  const cases = [...fixture.matchAll(/<li data-expect="([^"]*)" data-title="([^"]*)">([\s\S]*?)<\/li>/g)]
    .map(([, expect, title, text]) => ({ expect, title: decode(title), text: decode(text) }));
  const fixtureMismatches = [];
  for (const { expect, title, text } of cases) {
    const want = pageTitle(title);
    if (expect !== want.band) fixtureMismatches.push(`${title}: data-expect ${expect}, width rule says ${want.band}`);
    if (text !== want.text) fixtureMismatches.push(`${title}: rendered ${text}, expected ${want.text}`);
  }
  assert.deepEqual(fixtureMismatches, []);
  for (const w of [34, 35, 55, 56]) assert.ok(cases.some(c => width(c.title) === w), `fixture has no width-${w} case`);

  // (b) Every built content item: its <title> is the front-matter title under the same rule.
  const collections = [
    ['_news', '/news/', 'zh-Hant'], ['_news_en', '/en/news/', 'en-US'],
    ['_events', '/events/', 'zh-Hant'], ['_events_en', '/en/events/', 'en-US'],
    ['_records', '/records/', 'zh-Hant'], ['_records_en', '/en/records/', 'en-US'],
    ['_ideas', '/ideas/', 'zh-Hant'], ['_ideas_en', '/en/ideas/', 'en-US'],
  ];
  const bands = {};
  const itemMismatches = [];
  for (const [dir, prefix, locale] of collections) {
    for (const file of (await readdir(new URL(`../${dir}/`, import.meta.url))).filter(name => name.endsWith('.md'))) {
      const source = await read(`${dir}/${file}`);
      const frontMatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      if (/^draft:\s*true\s*$/m.test(frontMatter)) continue;
      // The prebuilt household route hard-codes its <title> in layouts/household-digital-go-bag.html; head-seo never renders it.
      if (/^layout:\s*household-digital-go-bag\s*$/m.test(frontMatter)) continue;
      const url = frontMatter.match(/^permalink:\s*(\S+)\s*$/m)?.[1] ?? `${prefix}${file.replace(/\.md$/, '')}/`;
      const built = await read(`_site${url}index.html`).catch(error => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (built === null) continue;
      const titleLine = frontMatter.match(/^title:[ \t]*(.+?)[ \t]*$/m)?.[1];
      assert.ok(titleLine, `${dir}/${file} has no title`);
      assert.doesNotMatch(titleLine, /\\|^'| #/, `${dir}/${file}: title scalar form this check does not parse`);
      const title = titleLine.startsWith('"') ? titleLine.slice(1, titleLine.lastIndexOf('"')) : titleLine;
      const want = pageTitle(title);
      const rendered = decode(built.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
      if (rendered !== want.text) itemMismatches.push(`${dir}/${file}: <title> ${rendered}, expected ${want.text}`);
      bands[`${locale} ${want.band}`] = (bands[`${locale} ${want.band}`] ?? 0) + 1;
    }
  }
  t.diagnostic(`band counts ${JSON.stringify(bands)}`);
  assert.deepEqual(itemMismatches, []);
  for (const band of ['full', 'short', 'none']) assert.ok(bands[`en-US ${band}`] > 0, `no en-US item lands in the ${band} band`);

  // (c) A long en-US page (none band): <title> is bare, while og:title and twitter:title keep the full suffix.
  const longPage = await read('_site/en/news/2026-02-10-open-register/index.html');
  assert.doesNotMatch(longPage, /<title>[^<]*｜Cyborg Resilience Co-lab<\/title>/);
  for (const name of ['og:title', 'twitter:title']) {
    const content = decode(longPage.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]*)"`))?.[1] ?? '');
    assert.ok(content.endsWith('｜Cyborg Resilience Co-lab'), `${name} lost the full suffix: ${content}`);
  }
});

test('built pages carry a banner template offering the other locale', async () => {
  const pairs = [
    ['index.html', 'en-US', '/en/'],
    ['en/index.html', 'zh-Hant', '/'],
    ['news/index.html', 'en-US', '/en/news/'],
    ['en/news/index.html', 'zh-Hant', '/news/'],
  ];
  for (const [path, suggestLocale, href] of pairs) {
    const html = await readFile(new URL(`../_site/${path}`, import.meta.url), 'utf8');
    const template = html.match(/<template id="crc-locale-suggest">([\s\S]*?)<\/template>/)?.[1] ?? '';
    assert.match(template, new RegExp(`lang="${suggestLocale}"`), `${path} suggests the wrong locale`);
    assert.match(template, new RegExp(`href="${href}"[^>]*data-locale-option="${suggestLocale}"`), `${path} suggest link`);
    assert.match(template, /data-locale-dismiss/);
    assert.ok(html.indexOf('id="crc-dock"') < html.indexOf('/assets/consent.js'), `${path} dock must precede consent.js`);
  }
});

test('built hackathon listing entry defers to the event page for canonical, sitemap and Event JSON-LD', async () => {
  const { readdir } = await import('node:fs/promises');
  const target = 'https://crcolab.art/events/hackathon-2026/';
  const listing = await read('_site/events/2026-05-23-hackathon-2026/index.html');
  assert.equal(listing.match(/<link rel="canonical" href="([^"]*)"/)?.[1], target);
  assert.equal(listing.match(/<meta property="og:url" content="([^"]*)"/)?.[1], target);
  const robots = listing.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  assert.ok(robots, 'the listing entry carries a robots meta');
  assert.doesNotMatch(robots, /noindex/);
  const sitemap = await read('_site/sitemap.xml');
  assert.match(sitemap, /<loc>https:\/\/crcolab\.art\/events\/hackathon-2026\/<\/loc>/, 'the event page stays in the sitemap');
  assert.doesNotMatch(sitemap, /2026-05-23-hackathon-2026/);
  assert.match(await read('_site/events/index.html'), /href="\/events\/hackathon-2026\/"/);

  const htmlPaths = [];
  const walk = async dir => {
    for (const dirent of await readdir(new URL(`../${dir}`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${dirent.name}`;
      if (dirent.isDirectory()) {
        if (path !== '_site/ideas/household-digital-go-bag/assets') await walk(path);
      } else if (dirent.name.endsWith('.html')) {
        htmlPaths.push(path);
      }
    }
  };
  await walk('_site');
  const hackathonEvents = [];
  for (const path of htmlPaths) {
    const html = await read(path);
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      for (const item of [JSON.parse(json)].flat()) {
        const types = [item['@type']].flat();
        const isEvent = types.some(type => type === 'Hackathon' || /Event$/.test(type));
        if (isEvent && String(item.startDate ?? '').startsWith('2026-05-23')) hackathonEvents.push(path);
      }
    }
  }
  assert.deepEqual(hackathonEvents, ['_site/events/hackathon-2026/index.html']);
});
