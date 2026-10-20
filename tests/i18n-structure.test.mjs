import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [config, copy] = await Promise.all([
  read('_config.yml'),
  read('_data/i18n.yml').catch(() => ''),
]);

function localeBlock(yaml, locale) {
  const startMarker = `${locale}:\n`;
  const start = yaml.indexOf(startMarker);
  assert.notEqual(start, -1, `missing ${locale} dictionary`);
  const remainder = yaml.slice(start + startMarker.length);
  const nextLocale = remainder.search(/^\S[^\n]*:\s*$/m);
  return nextLocale === -1 ? remainder : remainder.slice(0, nextLocale);
}

test('Jekyll declares parallel English collections and locale defaults', () => {
  for (const collection of ['news_en', 'events_en', 'records_en', 'ideas_en', 'team_en']) {
    assert.match(config, new RegExp(`\\n  ${collection}:\\n    output: true`));
    assert.match(config, new RegExp(`permalink: /en/${collection.replace('_en', '')}/:name/`));
    assert.match(config, new RegExp(`scope: \\{ type: ${collection} \\}`));
  }
  assert.match(config, /scope: \{ type: news \}[\s\S]*locale: zh-Hant/);
  assert.match(config, /scope: \{ type: news_en \}[\s\S]*locale: en-US/);
});

test('both locale dictionaries expose the shared interface contract', () => {
  for (const locale of ['zh-Hant', 'en-US']) {
    const dictionary = localeBlock(copy, locale);
    for (const key of [
      'language_switcher_label', 'navigation', 'sections', 'view_source',
      'back_to', 'feed', 'footer', 'consent', 'locale_suggest',
    ]) {
      assert.match(dictionary, new RegExp(`^  ${key}:`, 'm'), `${locale} is missing ${key}`);
    }
    for (const nested of [
      ['navigation', 'ideas'], ['sections', 'ideas'], ['sections', 'team'],
      ['back_to', 'ideas'], ['back_to', 'team'], ['feed', 'ideas'],
      ['member', 'ideas_by'],
      ['locale_suggest', 'message'], ['locale_suggest', 'switch'], ['locale_suggest', 'dismiss'],
    ]) {
      const [outer, inner] = nested;
      // Note: `$` under the /m flag matches end-of-LINE, which is trivially true
      // right after "<outer>:" itself (immediately before its own newline) — that
      // made the lazy quantifier stop with zero characters consumed every time,
      // so the block never actually reached nested keys. `(?![\s\S])` asserts
      // true end-of-string instead, so the block only closes at the next
      // top-level key or the real end of the dictionary.
      const outerBlock = dictionary.match(new RegExp(`^  ${outer}:[\\s\\S]*?(?=^  \\S|(?![\\s\\S]))`, 'm'))?.[0] ?? '';
      assert.match(outerBlock, new RegExp(`^    ${inner}:`, 'm'), `${locale}.${outer}.${inner} missing`);
    }
  }
});

test('shared shell advertises reciprocal locales and uses normal switcher links', async () => {
  const [head, switcher, layout] = await Promise.all([
    read('_includes/head-seo.html'), read('_includes/locale-switcher.html'), read('_layouts/default.html'),
  ]);
  assert.match(head, /hreflang="zh-Hant"/);
  assert.match(head, /hreflang="en-US"/);
  assert.match(head, /hreflang="x-default"/);
  assert.match(head, /inLanguage/);
  assert.match(switcher, /data-locale-option="zh-Hant"/);
  assert.match(switcher, /data-locale-option="en-US"/);
  assert.match(layout, /src="\/assets\/locale\.js"/);
  assert.match(layout, /translation_exempt/);
});

test('English indexes, feeds, and latest API declare exact routes and collections', async () => {
  const cases = [
    ['en/news/index.html', '/en/news/', 'news_en'],
    ['en/events/index.html', '/en/events/', 'events_en'],
    ['en/records/index.html', '/en/records/', 'records_en'],
    ['en/feed.xml', '/en/feed.xml', 'site.news_en'],
    ['en/news/feed.xml', '/en/news/feed.xml', 'site.news_en'],
    ['en/events/feed.xml', '/en/events/feed.xml', 'site.events_en'],
    ['en/records/feed.xml', '/en/records/feed.xml', 'site.records_en'],
    ['en/ideas/index.html', '/en/ideas/', 'ideas_en'],
    ['en/ideas/feed.xml', '/en/ideas/feed.xml', 'site.ideas_en'],
    ['en/team/index.html', '/en/team/', 'team_en'],
    ['en/api/latest.json', '/en/api/latest.json', 'news_en,events_en,records_en,ideas_en'],
  ];
  for (const [path, permalink, source] of cases) {
    const content = await read(path).catch(() => '');
    assert.match(content, new RegExp(`permalink: ${permalink.replaceAll('/', '\\/')}`));
    assert.match(content, new RegExp(source));
  }
});

test('English feeds fall back to the build time when their collections are empty', async () => {
  const feeds = await Promise.all([
    read('en/feed.xml'),
    read('en/news/feed.xml'),
    read('en/events/feed.xml'),
    read('en/records/feed.xml'),
  ]);
  for (const feed of feeds) {
    assert.match(feed, /\.first\.date \| default: site\.time \| date_to_xmlschema/);
  }
});

test('section and item layouts use locale copy instead of bilingual labels', async () => {
  const [indexLayout, itemLayout] = await Promise.all([
    read('_layouts/section-index.html'), read('_layouts/item.html'),
  ]);
  assert.match(indexLayout, /site\[page\.collection_name\]/);
  assert.match(indexLayout, /item\.listing_title_en/);
  assert.match(indexLayout, /ui\.feed\.label/);
  assert.doesNotMatch(indexLayout, /page\.title_en|listing_title_key|crc-heading__en|crc-heading__zh/);
  assert.match(itemLayout, /ui\.view_source/);
  assert.match(itemLayout, /ui\.back_to\[page\.section\]/);
  assert.doesNotMatch(itemLayout, /閱讀原文 View source|所有訊息 All news/);
});

test('feed discovery and feed documents source locale-specific copy', async () => {
  const [head, ...feeds] = await Promise.all([
    read('_includes/head-seo.html'),
    read('feed.xml'), read('news/feed.xml'), read('events/feed.xml'), read('records/feed.xml'),
    read('en/feed.xml'), read('en/news/feed.xml'), read('en/events/feed.xml'), read('en/records/feed.xml'),
  ]);
  assert.match(head, /ui\.feed\.all/);
  assert.match(head, /ui\.feed\.news/);
  assert.match(head, /ui\.feed\.events/);
  assert.match(head, /ui\.feed\.records/);
  assert.match(head, /ui\.feed\.ideas/);
  for (const feed of feeds) assert.match(feed, /site\.data\.i18n/);
  for (const feed of feeds.slice(0, 4)) {
    assert.doesNotMatch(feed, />[^<{]*(?:All updates|News|Events|As Seen on Media)[^<{]*</);
  }
});

test('project guidance describes paired static locales and the readable type hierarchy', async () => {
  const [readme, claude] = await Promise.all([read('README.md'), read('CLAUDE.md')]);
  for (const doc of [readme, claude]) {
    assert.match(doc, /paired single-language static locales/i);
    assert.match(doc, /18px[^\n]*16px[^\n]*14px/);
    assert.doesNotMatch(doc, /zh-Hant primary[^\n]*EN mono secondary|bilingual zh\/EN-mono pairing|English secondary text/);
  }
});

test('section index descriptions come from i18n in both locales and stay out of front matter', async () => {
  const sections = ['news', 'events', 'records', 'ideas'];
  // Display width: CJK, Hangul and fullwidth code points take two columns, everything else one.
  const columns = text => [...text].reduce((total, char) => {
    const code = char.codePointAt(0);
    const wide = (code >= 0x2E80 && code <= 0xA4CF) || (code >= 0xAC00 && code <= 0xD7A3)
      || (code >= 0xF900 && code <= 0xFAFF) || (code >= 0xFE30 && code <= 0xFE4F)
      || (code >= 0xFF01 && code <= 0xFF60) || (code >= 0xFFE0 && code <= 0xFFE6)
      || (code >= 0x20000 && code <= 0x3FFFD);
    return total + (wide ? 2 : 1);
  }, 0);
  const values = [];
  for (const locale of ['zh-Hant', 'en-US']) {
    const lines = localeBlock(copy, locale).split('\n');
    const start = lines.indexOf('  section_descriptions:');
    assert.notEqual(start, -1, `${locale} is missing section_descriptions`);
    const entries = [];
    for (const line of lines.slice(start + 1)) {
      if (!/^    \S/.test(line)) break;
      const match = line.match(/^    (\w+): "([^"]*)"$/);
      assert.ok(match, `${locale} section_descriptions entry must be a double-quoted scalar: ${line}`);
      entries.push([match[1], match[2]]);
    }
    assert.deepEqual(entries.map(([key]) => key).sort(), [...sections].sort(), `${locale} section_descriptions keys`);
    for (const [key, text] of entries) {
      const width = columns(text);
      assert.ok(width >= 70 && width <= 160, `${locale}.section_descriptions.${key} is ${width} columns wide`);
      values.push(text);
    }
  }
  assert.equal(new Set(values).size, 8, 'section descriptions must be distinct across both locales');
  for (const section of sections) {
    for (const path of [`${section}/index.html`, `en/${section}/index.html`]) {
      const frontMatter = (await read(path)).match(/^---\n([\s\S]*?)\n---\n/)?.[1];
      assert.ok(frontMatter, `${path} has no front matter`);
      assert.doesNotMatch(frontMatter, /^description:/m, `${path} still declares a front-matter description`);
    }
  }
});
