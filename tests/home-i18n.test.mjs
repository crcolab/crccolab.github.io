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
});
