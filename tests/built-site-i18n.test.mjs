import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

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
