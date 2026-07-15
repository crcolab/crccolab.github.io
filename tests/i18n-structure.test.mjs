import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [config, copy] = await Promise.all([
  read('_config.yml'),
  read('_data/i18n.yml').catch(() => ''),
]);

test('Jekyll declares parallel English collections and locale defaults', () => {
  for (const collection of ['news_en', 'events_en', 'records_en']) {
    assert.match(config, new RegExp(`\\n  ${collection}:\\n    output: true`));
    assert.match(config, new RegExp(`permalink: /en/${collection.replace('_en', '')}/:name/`));
    assert.match(config, new RegExp(`scope: \\{ type: ${collection} \\}`));
  }
  assert.match(config, /scope: \{ type: news \}[\s\S]*locale: zh-Hant/);
  assert.match(config, /scope: \{ type: news_en \}[\s\S]*locale: en-US/);
});

test('both locale dictionaries expose the shared interface contract', () => {
  for (const locale of ['zh-Hant', 'en-US']) {
    assert.match(copy, new RegExp(`^${locale}:`, 'm'));
  }
  for (const key of [
    'language_switcher_label', 'navigation', 'sections', 'view_source',
    'back_to', 'footer', 'consent',
  ]) {
    assert.match(copy, new RegExp(`  ${key}:`));
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
