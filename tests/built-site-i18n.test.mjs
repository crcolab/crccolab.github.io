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
