import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { playWhenVisible, readHomeConfig } from '../script.js';

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

test('team video waits until it nears the viewport, then plays once', () => {
  let plays = 0;
  const video = { play: async () => { plays++; } };
  let observer;
  class FakeObserver {
    constructor(callback, options) { this.callback = callback; this.options = options; observer = this; }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  }

  playWhenVisible(video, FakeObserver);
  assert.equal(observer.target, video);
  assert.equal(plays, 0);
  observer.callback([{ isIntersecting: false }]);
  assert.equal(plays, 0);
  observer.callback([{ isIntersecting: true }]);
  assert.equal(plays, 1);
  assert.equal(observer.disconnected, true);
});

test('team video plays straight away without IntersectionObserver', () => {
  let plays = 0;
  playWhenVisible({ play: async () => { plays++; } }, undefined);
  assert.equal(plays, 1);
});

test('homepages lazy-start a small team video and skip the poster-duplicate image', () => {
  for (const home of [zh, en]) {
    assert.match(home, /<video class="crc-hud__media team__video" muted loop playsinline preload="none"/);
    assert.doesNotMatch(home, /team__video[^>]*autoplay/);
    assert.ok(home.indexOf('team-video.webm') < home.indexOf('team-video.mp4'), 'WebM is listed before MP4');
    assert.doesNotMatch(home, /\/assets\/team\.jpg/);
    assert.match(home, /<script data-cfasync="false">\s*try \{\s*if \(localStorage\.getItem\('crc-theme'\)/);
  }
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
  assert.match(zh, /<source src="\/assets\/team-video\.mp4" type="video\/mp4">\s*團隊合照\s*<\/video>/);
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

test('homepage H1 names the organization once, as sr-only text', () => {
  const textOf = html => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  for (const [home, name] of [
    [zh, '賽伯格韌性實驗室 Cyborg Resilience Co-lab'],
    [en, 'Cyborg Resilience Co-lab'],
  ]) {
    const h1 = home.match(/<h1 class="hero__title">([\s\S]*?)<\/h1>/)?.[1] ?? '';
    const srOnly = h1.match(/<span class="sr-only">((?:[^<]|<span[^>]*>[^<]*<\/span>)*)<\/span>/)?.[1];
    assert.ok(srOnly !== undefined, 'H1 has an .sr-only name span');
    assert.equal(textOf(srOnly), name);
    assert.doesNotMatch(h1, /role="img"|aria-label=/, 'H1 must not announce the name a second time');
    const logotypes = h1.match(/<span class="logotype[^"]*"[^>]*>/g) ?? [];
    assert.ok(logotypes.length > 0, 'H1 logotype spans found');
    for (const tag of logotypes) assert.match(tag, /aria-hidden="true"/);
    const srOnlyElements = home.match(/<(\w+)[^>]*class="sr-only"[^>]*>(?:[^<]|<(\w+)[^>]*>[^<]*<\/\2>)*<\/\1>/g) ?? [];
    const repeats = srOnlyElements.filter(el => el.includes('Cyborg Resilience Co-lab'));
    assert.equal(repeats.length, 1, 'only the H1 .sr-only span may repeat the name on the page');
    assert.ok(h1.includes(repeats[0]), 'the .sr-only name repeat must be the H1 span');
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

test('header site-nav includes an Ideas link in both locales', () => {
  assert.match(zh, /<nav class="site-nav">[\s\S]*?<a href="\/ideas\/" class="site-nav__link">提點子<\/a>[\s\S]*?<\/nav>/);
  assert.match(en, /<nav class="site-nav">[\s\S]*?<a href="\/en\/ideas\/" class="site-nav__link">Ideas<\/a>[\s\S]*?<\/nav>/);
});

test('homepage Organization JSON-LD names a 112px+ square PNG logo and the footer Facebook page', async () => {
  const organizationOf = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json))
    .find(data => data['@type'] === 'Organization');
  const blocks = [];
  for (const [locale, html] of [['zh-Hant', zh], ['en-US', en]]) {
    const org = organizationOf(html);
    assert.ok(org, `${locale} homepage has an Organization block`);
    assert.ok(org.logo.startsWith('https://crcolab.art/'), `${locale} logo is on crcolab.art`);
    const png = await readFile(new URL(`../${org.logo.slice('https://crcolab.art/'.length)}`, import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], `${locale} logo is a PNG`);
    assert.equal(png.toString('ascii', 12, 16), 'IHDR');
    assert.equal(png.readUInt32BE(16), png.readUInt32BE(20), `${locale} logo is square`);
    assert.ok(png.readUInt32BE(16) >= 112, `${locale} logo is at least 112px`);
    const footerFacebook = html.match(/<footer[\s\S]*?<\/footer>/)[0].match(/<a href="(https:\/\/www\.facebook\.com\/[^"]+)"/)[1];
    assert.ok(Array.isArray(org.sameAs), `${locale} sameAs is a list`);
    assert.ok(org.sameAs.includes('https://github.com/crcolab/'), `${locale} sameAs keeps GitHub`);
    assert.ok(org.sameAs.includes(footerFacebook), `${locale} sameAs includes the footer Facebook page`);
    blocks.push(org);
  }
  // url and description are the only keys localized today; everything else must match across locales.
  const localized = new Set(['url', 'description']);
  const [zhShared, enShared] = blocks.map(org => Object.fromEntries(Object.entries(org).filter(([key]) => !localized.has(key))));
  assert.deepEqual(enShared, zhShared);
});
