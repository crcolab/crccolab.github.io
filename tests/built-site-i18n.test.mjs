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
  await assert.rejects(read('_site/en/events/hackathon-2026/index.html'));
  await assert.rejects(read('_site/en/events/2026-05-23-hackathon-2026/index.html'));
});
