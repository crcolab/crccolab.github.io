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

test('built item hero images and member photos reserve their size', async () => {
  const { readdir, readFile: readBinary } = await import('node:fs/promises');
  const skipDirs = new Set(['_site/ideas/household-digital-go-bag/assets']);
  const roots = ['news', 'events', 'records', 'ideas', 'team'].flatMap(s => [`_site/${s}`, `_site/en/${s}`]);
  const pages = [];
  const walk = async dir => {
    for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!skipDirs.has(path)) await walk(path);
      } else if (entry.name === 'index.html') {
        pages.push(path);
      }
    }
  };
  for (const dir of roots) await walk(dir);

  const imageSize = bytes => {
    if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
      if (bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error('PNG does not start with IHDR');
      return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
    }
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a PNG or JPEG');
    for (let i = 2; i + 9 < bytes.length;) {
      if (bytes[i] !== 0xff) { i += 1; continue; }
      const marker = bytes[i + 1];
      if (marker === 0xff) { i += 1; continue; }
      if (marker === 0xc0 || marker === 0xc2) {
        return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
      }
      if (marker === 0x01 || marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      i += 2 + bytes.readUInt16BE(i + 2);
    }
    throw new Error('no SOF0 or SOF2 marker');
  };

  const problems = [];
  const sizes = new Map();
  let itemChecked = 0;
  let memberChecked = 0;
  for (const page of pages.sort()) {
    const html = await read(page);
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      const classes = tag.match(/\sclass="([^"]*)"/)?.[1].split(/\s+/) ?? [];
      if (classes.includes('item__image')) itemChecked += 1;
      else if (classes.includes('member-profile__photo')) memberChecked += 1;
      else continue;
      const src = tag.match(/\ssrc="([^"]*)"/)?.[1] ?? '(no src)';
      const where = `${page} <img src="${src}">`;
      const width = tag.match(/\swidth="([^"]*)"/)?.[1];
      const height = tag.match(/\sheight="([^"]*)"/)?.[1];
      if (!/^[1-9]\d*$/.test(width ?? '') || !/^[1-9]\d*$/.test(height ?? '')) {
        problems.push(`${where}: width/height must be positive integers (width=${width ?? 'none'}, height=${height ?? 'none'})`);
        continue;
      }
      if (!src.startsWith('/')) {
        problems.push(`${where}: src must be root-absolute so the file can be located`);
        continue;
      }
      const file = src.split(/[?#]/)[0].slice(1);
      try {
        if (!sizes.has(file)) sizes.set(file, imageSize(await readBinary(new URL(`../${file}`, import.meta.url))));
      } catch (error) {
        problems.push(`${where}: cannot measure ${file} (${error.message})`);
        continue;
      }
      const actual = sizes.get(file);
      if (Number(width) !== actual.width || Number(height) !== actual.height) {
        problems.push(`${where}: width=${width} height=${height} but ${file} is ${actual.width}x${actual.height}`);
      }
    }
  }
  assert.ok(problems.length === 0, `item and member images must reserve their real size:\n${problems.join('\n')}`);
  assert.ok(itemChecked >= 18, `checked ${itemChecked} item__image tags; expected at least 18`);
  assert.ok(memberChecked >= 10, `checked ${memberChecked} member-profile__photo tags; expected at least 10`);
  const sections = await read('_site/sections.css');
  assert.match(sections, /\.item__image\{[^}]*[{;]height:auto[;}]/, 'sections.css .item__image rule must contain height:auto');
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

test('item hero images serve WebP with a JPEG/PNG fallback and keep social cards on the original', async () => {
  const { readdir, readFile: readBytes, stat } = await import('node:fs/promises');
  const repoFile = path => new URL(`../${path}`, import.meta.url);
  const exists = path => stat(repoFile(path)).then(() => true, () => false);
  const sizes = new Map();
  const sizeOf = async path => {
    if (!sizes.has(path)) sizes.set(path, (await stat(repoFile(path))).size);
    return sizes.get(path);
  };
  const imageSize = bytes => {
    if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
      if (bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error('PNG does not start with IHDR');
      return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
    }
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a PNG or JPEG');
    for (let i = 2; i + 9 < bytes.length;) {
      if (bytes[i] !== 0xff) { i += 1; continue; }
      const marker = bytes[i + 1];
      if (marker === 0xff) { i += 1; continue; }
      if (marker === 0xc0 || marker === 0xc2) {
        return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
      }
      if (marker === 0x01 || marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      i += 2 + bytes.readUInt16BE(i + 2);
    }
    throw new Error('no SOF0 or SOF2 marker');
  };
  // [start, end) offsets of each <div class="item__body"> content, found by balancing nested divs.
  const bodyRanges = html => {
    const ranges = [];
    for (const open of html.matchAll(/<div class="item__body">/g)) {
      const start = open.index + open[0].length;
      const divs = /<(\/?)div\b[^>]*>/g;
      divs.lastIndex = start;
      let depth = 1;
      for (let tag = divs.exec(html); tag; tag = divs.exec(html)) {
        depth += tag[1] ? -1 : 1;
        if (depth === 0) {
          ranges.push([start, tag.index]);
          break;
        }
      }
    }
    return ranges;
  };
  const skipDirs = new Set(['_site/ideas/household-digital-go-bag/assets']);
  const pages = [];
  const walk = async dir => {
    for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!skipDirs.has(path)) await walk(path);
      } else if (entry.name.endsWith('.html')) {
        pages.push(path);
      }
    }
  };
  await walk('_site');

  const problems = [];
  const standsFor = new Map(); // assets/*.webp -> the JPEG/PNG it stands in for, as the built pages use it
  let pictures = 0;
  let bodyPictures = 0;
  for (const page of pages.sort()) {
    const html = await read(page);
    const isItemPage = /^_site\/(en\/)?(news|events|records|ideas)\//.test(page);
    let heroSrc = null;
    for (const match of isItemPage ? html.matchAll(/<img\b[^>]*>/g) : []) {
      const tag = match[0];
      const classes = tag.match(/\sclass="([^"]*)"/)?.[1].split(/\s+/) ?? [];
      if (!classes.includes('item__image')) continue;
      const src = tag.match(/\ssrc="([^"]*)"/)?.[1] ?? '(no src)';
      const where = `${page} <img src="${src}">`;
      heroSrc = src;
      if (!/^\/[^?#]+\.(jpe?g|png)$/i.test(src)) {
        problems.push(`${where}: hero src must stay a root-absolute JPEG or PNG`);
        continue;
      }
      const file = src.slice(1);
      const before = html.slice(0, match.index);
      const pictureOpen = before.lastIndexOf('<picture');
      const inPicture = pictureOpen > before.lastIndexOf('</picture>');
      const sourceTags = inPicture ? html.slice(pictureOpen, match.index).match(/<source\b[^>]*>/g) ?? [] : [];
      // The hero's WebP is its <picture> source: page.image_webp when set, else the .webp sibling.
      const webpSrcset = sourceTags
        .filter(source => /\stype="image\/webp"/.test(source))
        .map(source => source.match(/\ssrcset="([^"]*)"/)?.[1])
        .find(Boolean);
      const webp = webpSrcset ? webpSrcset.slice(1) : file.replace(/\.(jpe?g|png)$/i, '.webp');
      if (src === '/ideas/household-digital-go-bag/og-image.png'
        && webpSrcset !== '/assets/2026-AUG-30-household-digital-go-bag.webp') {
        problems.push(`${where}: must source its WebP from image_webp (got ${webpSrcset ?? 'none'})`);
      }
      if (!(await exists(webp))) {
        if (inPicture) problems.push(`${where}: wrapped in <picture> although ${webp} does not exist`);
        continue;
      }
      const hasWebpSource = sourceTags.some(source => /\stype="image\/webp"/.test(source)
        && source.match(/\ssrcset="([^"]*)"/)?.[1] === `/${webp}`);
      const closeAt = html.indexOf('</picture>', match.index + tag.length);
      if (!inPicture || !hasWebpSource || closeAt < 0 || html.slice(match.index + tag.length, closeAt).trim() !== '') {
        problems.push(`${where}: must sit inside <picture> preceded by <source type="image/webp" srcset="/${webp}">`);
      }
      const width = tag.match(/\swidth="([^"]*)"/)?.[1];
      const height = tag.match(/\sheight="([^"]*)"/)?.[1];
      if (!/^[1-9]\d*$/.test(width ?? '') || !/^[1-9]\d*$/.test(height ?? '')) {
        problems.push(`${where}: lost its width/height`);
      }
      if ((await sizeOf(webp)) >= (await sizeOf(file))) problems.push(`${where}: /${webp} is not smaller than ${src}`);
      standsFor.set(webp, file);
      pictures += 1;
    }
    let socialSeen = 0;
    for (const [tag] of html.matchAll(/<meta\b[^>]*>/g)) {
      const key = tag.match(/\s(?:property|name)="([^"]*)"/)?.[1];
      if (key !== 'og:image' && key !== 'twitter:image') continue;
      socialSeen += 1;
      const content = tag.match(/\scontent="([^"]*)"/)?.[1] ?? '';
      if (/\.webp(?:[?#]|$)/i.test(content)) problems.push(`${page}: ${key} must not point at a WebP (${content})`);
      if (heroSrc && !content.endsWith(heroSrc)) problems.push(`${page}: ${key} must keep the original ${heroSrc} (got ${content})`);
    }
    if (heroSrc && socialSeen < 2) problems.push(`${page}: hero page is missing og:image or twitter:image`);

    // Body images: real width/height on every <img> in item__body; a WebP sibling wraps it in <picture>.
    for (const [start, end] of isItemPage ? bodyRanges(html) : []) {
      for (const match of html.slice(start, end).matchAll(/<img\b[^>]*>/g)) {
        const at = start + match.index;
        const tag = match[0];
        const src = tag.match(/\ssrc="([^"]*)"/)?.[1] ?? '(no src)';
        const where = `${page} <img src="${src}">`;
        if (!/^\/[^?#]+\.(jpe?g|png)$/i.test(src)) {
          problems.push(`${where}: body image must be a root-absolute JPEG or PNG`);
          continue;
        }
        const file = src.slice(1);
        const width = tag.match(/\swidth="([^"]*)"/)?.[1];
        const height = tag.match(/\sheight="([^"]*)"/)?.[1];
        const real = imageSize(await readBytes(repoFile(file)));
        if (width !== String(real.width) || height !== String(real.height)) {
          problems.push(`${where}: width/height must be the file's ${real.width}x${real.height} (got ${width ?? 'none'}x${height ?? 'none'})`);
        }
        const webp = file.replace(/\.(jpe?g|png)$/i, '.webp');
        if (!(await exists(webp))) continue;
        const before = html.slice(0, at);
        const pictureOpen = before.lastIndexOf('<picture');
        const inPicture = pictureOpen > before.lastIndexOf('</picture>');
        const sourceTags = inPicture ? html.slice(pictureOpen, at).match(/<source\b[^>]*>/g) ?? [] : [];
        const hasWebpSource = sourceTags.some(source => /\stype="image\/webp"/.test(source)
          && source.match(/\ssrcset="([^"]*)"/)?.[1] === `/${webp}`);
        const closeAt = html.indexOf('</picture>', at + tag.length);
        if (!inPicture || !hasWebpSource || closeAt < 0 || html.slice(at + tag.length, closeAt).trim() !== '') {
          problems.push(`${where}: must sit inside <picture> preceded by <source type="image/webp" srcset="/${webp}">`);
        }
        standsFor.set(webp, file);
        bodyPictures += 1;
      }
    }
  }

  if (await exists('ideas/household-digital-go-bag/og-image.webp')) {
    problems.push('ideas/household-digital-go-bag/og-image.webp must be moved to assets/ (image_webp)');
  }
  for (const dir of ['assets', 'ideas/household-digital-go-bag']) {
    for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.webp')) continue;
      const webp = `${dir}/${entry.name}`;
      const stem = `${dir}/${entry.name.replace(/\.webp$/, '')}`;
      let original = null;
      for (const ext of ['jpg', 'jpeg', 'png']) {
        if (await exists(`${stem}.${ext}`)) {
          original = `${stem}.${ext}`;
          break;
        }
      }
      original ??= standsFor.get(webp) ?? null;
      if (!original) continue;
      if ((await sizeOf(webp)) >= (await sizeOf(original))) problems.push(`${webp} is not smaller than ${original}`);
    }
  }
  assert.ok(problems.length === 0, `hero and body images must serve WebP with a JPEG/PNG fallback and keep social cards on the original:\n${problems.join('\n')}`);
  assert.ok(pictures >= 15, `checked ${pictures} <picture> hero images; expected at least 15`);
  assert.ok(pictures + bodyPictures >= 35, `checked ${pictures + bodyPictures} <picture> images (${pictures} heroes, ${bodyPictures} body); expected at least 35`);
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

test('March forum pages link to the event hub in the same locale, and internal links resolve', async () => {
  const { readdir } = await import('node:fs/promises');
  const hub = '/events/2026-03-25-digital-resilience-forum/';
  const forumPages = [
    '/news/2026-02-10-open-register/',
    '/news/2026-03-25-past-events/',
    '/ideas/2026-03-25-crc-march-25-decks/',
    '/records/2026-03-27-rti-forum-coverage/',
    '/records/2026-04-01-forum-recap-upper-half/',
    '/records/2026-04-10-dset-forum-coverage/',
  ];
  // a. the event hub lists the forum pages in its own locale
  const hubLinks = forumPages.slice(1);
  const [zhHub, enHub] = await Promise.all([
    read(`_site${hub}index.html`),
    read(`_site/en${hub}index.html`),
  ]);
  for (const path of hubLinks) {
    assert.ok(zhHub.includes(`href="${path}"`), `zh event hub lacks href="${path}"`);
    assert.ok(enHub.includes(`href="/en${path}"`), `en event hub lacks href="/en${path}"`);
  }
  // b. every spoke links back to the event hub in its own locale
  const spokes = await Promise.all(forumPages.flatMap(path => [
    read(`_site${path}index.html`).then(html => [path, html, `href="${hub}"`]),
    read(`_site/en${path}index.html`).then(html => [`/en${path}`, html, `href="/en${hub}"`]),
  ]));
  for (const [page, html, link] of spokes) {
    assert.ok(html.includes(link), `${page} does not link back to ${link}`);
  }
  // c. en-US forum pages never link to a zh-Hant forum page; the en decks list uses /en/ routes
  const zhForumPaths = new Set([hub, ...forumPages]);
  const enForumPages = [hub, ...forumPages].map(path => `/en${path}`);
  const articleOf = html => html.match(/<article[\s\S]*?<\/article>/)?.[0] ?? '';
  const enForumHtml = await Promise.all(enForumPages.map(page => read(`_site${page}index.html`)));
  enForumPages.forEach((page, i) => {
    const article = articleOf(enForumHtml[i]);
    assert.ok(article, `${page} has no article content`);
    for (const [, raw] of article.matchAll(/href="(\/(?!\/)[^"]*)"/g)) {
      const path = raw.split('#')[0].split('?')[0];
      assert.ok(!zhForumPaths.has(path), `${page} links to zh-Hant forum page ${raw}`);
    }
  });
  const enDecks = articleOf(await read('_site/en/ideas/2026-03-25-crc-march-25-decks/index.html'));
  assert.ok(enDecks.includes('href="/en/records/"'), 'en decks list lacks href="/en/records/"');
  assert.ok(enDecks.includes('href="/en/news/"'), 'en decks list lacks href="/en/news/"');
  // d. every internal href in the built HTML resolves to a file in _site
  const files = [];
  const walk = async rel => {
    for (const entry of await readdir(new URL(`../_site/${rel}`, import.meta.url), { withFileTypes: true })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(child);
      else files.push(child);
    }
  };
  await walk('');
  const known = new Set(files.map(file => `/${file}`));
  const resolves = path => [path, `${path}index.html`, `${path}/index.html`, `${path}.html`].some(candidate => known.has(candidate));
  const unescapeHtml = value => value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  const htmlPages = files.filter(file => file.endsWith('.html') && !file.startsWith('ideas/household-digital-go-bag/assets/'));
  const broken = new Map();
  for (const file of htmlPages) {
    const html = await read(`_site/${file}`);
    const page = `/${file.replace(/index\.html$/, '')}`;
    for (const [, raw] of html.matchAll(/href="(\/(?!\/)[^"]*)"/g)) {
      let path = unescapeHtml(raw).split('#')[0].split('?')[0] || '/';
      try {
        path = decodeURI(path);
      } catch {
        // keep the raw path when it is not valid percent-encoding
      }
      if (!resolves(path)) broken.set(path, [...(broken.get(path) ?? []), page]);
    }
  }
  assert.equal(
    broken.size,
    0,
    [...broken].map(([path, pages]) => `broken internal href ${path} on ${pages.join(', ')}`).join('\n'),
  );
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

test('built robots.txt names every documented answer-engine crawler and blocks none of them', async () => {
  const robots = await read('_site/robots.txt');
  assert.doesNotMatch(robots, /^Disallow:\s*\S/m, 'robots.txt must not disallow any path');
  const tokens = [
    'Googlebot', 'bingbot', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'Applebot', 'Amzn-SearchBot', 'MistralAI-Index', 'meta-webindexer',
    'PetalBot', 'Baiduspider', 'Terracotta', 'Terracotta-News',
    'ChatGPT-User', 'Claude-User', 'Perplexity-User', 'MistralAI-User', 'DuckAssistBot', 'Amzn-User', 'meta-externalfetcher',
    'Manus-User', 'Novellum', 'CloudflareBrowserRenderingCrawler', 'TikTokSpider',
    'GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'Amazonbot', 'MistralAI-Training', 'meta-externalagent', 'CCBot',
    'Google-CloudVertexBot', 'FacebookBot', 'Bytespider', 'ProRataInc', 'Timpibot',
    'archive.org_bot', 'Arquivo-web-crawler',
  ];
  for (const token of tokens) assert.match(robots, new RegExp(`^User-agent: ${token.replaceAll('.', '\\.')}$`, 'm'), `robots.txt lost ${token}`);
  // A crawler obeys only the most specific group naming it, so every group repeats the Content Signals line.
  const groups = robots.split(/\n\s*\n/).filter(group => /^User-agent:/m.test(group));
  for (const group of groups) {
    assert.match(group, /^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m, `group lacks Content-Signal: ${group.split('\n').find(line => line.startsWith('User-agent:'))}`);
  }
});

test('built hand-written pages allow full previews and keep page chrome out of snippets', async () => {
  for (const path of ['index.html', 'en/index.html', 'events/hackathon-2026/index.html']) {
    const html = await read(`_site/${path}`);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/, `${path} robots meta`);
  }
  for (const path of ['index.html', 'en/index.html', 'news/index.html']) {
    assert.match(await read(`_site/${path}`), /<div id="crc-dock" class="crc-dock" data-nosnippet>/, `${path} dock`);
  }
  for (const path of ['index.html', 'en/index.html']) {
    const bars = (await read(`_site/${path}`)).match(/<div class="crc-hud__bar [^"]*"[^>]*>/g) ?? [];
    assert.equal(bars.length, 2, `${path} HUD bars`);
    for (const bar of bars) assert.match(bar, /data-nosnippet/, `${path} HUD bar text must stay out of snippets`);
  }
  assert.match(await read('_site/assets/consent.js'), /banner\.setAttribute\('data-nosnippet', ''\)/);
});
