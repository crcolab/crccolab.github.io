import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readHomeConfig } from '../script.js';

const [zh, en] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../en/index.html', import.meta.url), 'utf8').catch(() => ''),
]);

test('home config comes from the current page', () => {
  const config = readHomeConfig({ dataset: {
    apiUrl: '/en/api/latest.json',
    sections: '[{"key":"news","label":"Latest News","href":"/en/news/"}]',
  }});
  assert.deepEqual(config, { apiUrl: '/en/api/latest.json', sections: [{ key: 'news', label: 'Latest News', href: '/en/news/' }] });
});

test('homepages are reciprocal, single-language static pages', () => {
  assert.match(zh, /^---[\s\S]*locale: zh-Hant[\s\S]*---/);
  assert.match(en, /^---[\s\S]*locale: en-US[\s\S]*permalink: \/en\/[\s\S]*---/);
  assert.match(zh, /hreflang="en-US" href="https:\/\/crcolab\.art\/en\/"/);
  assert.match(en, /hreflang="zh-Hant" href="https:\/\/crcolab\.art\/"/);
  assert.match(zh, /data-api-url="\/api\/latest\.json"/);
  assert.match(en, /data-api-url="\/en\/api\/latest\.json"/);
  assert.doesNotMatch(zh, /class="(?:about__en|team-card__role-en|crc-heading__en)"/);
  assert.doesNotMatch(en, /class="(?:about__zh|team-card__role-zh|crc-heading__zh)"/);
  for (const home of [zh, en]) {
    assert.match(home, /class="crc-btn crc-btn--primary crc-btn--sm site-header__latest"/);
  }
});

test('Chinese homepage localizes generic interface copy', () => {
  assert.match(zh, /id="theme-toggle" aria-label="切換淺色／紫色主題" title="切換主題"/);
  assert.match(zh, /<img src="\/assets\/team\.jpg" alt="團隊合照">/);
  assert.match(zh, /<a href="mailto:mclee@gate\.sinica\.edu\.tw">電子郵件<\/a>/);
  assert.match(zh, />在台灣用心製作<\/span>/);
  assert.doesNotMatch(zh, /Switch light \/ purple theme|Switch theme|Team photo|>Email<|Made with ❤️ in Taiwan/);
});

test('Chinese homepage localizes its brand and feed labels', () => {
  assert.match(zh, /class="site-header__brand" aria-label="CRC 首頁"/);
  for (const [title, href] of [
    ['CRC — 所有更新', '/feed.xml'],
    ['CRC — 最新訊息', '/news/feed.xml'],
    ['CRC — 活動', '/events/feed.xml'],
    ['CRC — 記錄／報導', '/records/feed.xml'],
  ]) {
    assert.match(zh, new RegExp(`title="${title}" href="${href.replaceAll('.', '\\.')}"`));
  }
  assert.doesNotMatch(zh, /aria-label="CRC home"|title="CRC — (?:All updates|News|Events|Media)"/);
  assert.match(en, /aria-label="CRC home"/);
  assert.match(en, /title="CRC — All updates"/);
});

test('HUD target accessible names reference only the current locale', () => {
  for (const id of ['lulu', 'meichun', 'cheng', 'tzu-tung', 'sean']) {
    const zhTarget = zh.match(new RegExp(`<button[^>]*class="team-member-target"[^>]*data-member-id="${id}"[^>]*>`))?.[0];
    const enTarget = en.match(new RegExp(`<button[^>]*class="team-member-target"[^>]*data-member-id="${id}"[^>]*>`))?.[0];
    assert.ok(zhTarget, `missing Chinese target for ${id}`);
    assert.ok(enTarget, `missing English target for ${id}`);
    assert.match(zhTarget, new RegExp(`aria-labelledby="team-member-${id}-name-zh team-member-${id}-role-zh"`));
    assert.doesNotMatch(zhTarget, new RegExp(`team-member-${id}-(?:name|role)-en`));
    assert.match(enTarget, new RegExp(`aria-labelledby="team-member-${id}-name-en team-member-${id}-role-en"`));
    assert.doesNotMatch(enTarget, new RegExp(`team-member-${id}-(?:name|role)-zh`));
  }
});

test('home pages advertise a 4th latest block for ideas', () => {
  assert.match(zh, /"key":"ideas","label":"提點子"/);
  assert.match(en, /"key":"ideas","label":"Ideas"/);
});

test('every team card exposes a profile link to /team/<slug>/', () => {
  const slugs = ['lulu', 'meichun', 'cheng', 'tzu-tung', 'sean', 'rosa-kuo'];
  for (const slug of slugs) {
    assert.match(zh, new RegExp(`<a class="team-card__profile" href="/team/${slug}/"`), `zh missing profile link for ${slug}`);
    assert.match(en, new RegExp(`<a class="team-card__profile" href="/en/team/${slug}/"`), `en missing profile link for ${slug}`);
  }
});
