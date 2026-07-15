import assert from 'node:assert/strict';
import test from 'node:test';
import {
  detectBrowserLocale,
  getRedirectTarget,
  persistLocale,
  readStoredLocale,
  selectPreferredLocale,
} from '../assets/locale.js';

test('browser locale chooses Chinese for any zh variant and English otherwise', () => {
  assert.equal(detectBrowserLocale(['zh-TW', 'en-US'], ''), 'zh-Hant');
  assert.equal(detectBrowserLocale(['zh-Hant'], ''), 'zh-Hant');
  assert.equal(detectBrowserLocale(['en-GB'], ''), 'en-US');
  assert.equal(detectBrowserLocale([], 'ja-JP'), 'en-US');
  assert.equal(detectBrowserLocale([], ''), 'zh-Hant');
});

test('stored preference accepts only supported locale values', () => {
  assert.equal(readStoredLocale({ getItem: () => 'en-US' }), 'en-US');
  assert.equal(readStoredLocale({ getItem: () => 'fr' }), null);
  assert.equal(readStoredLocale({ getItem: () => { throw new Error('blocked'); } }), null);
});

test('a valid stored choice wins and invalid storage falls back to the browser', () => {
  assert.equal(selectPreferredLocale({ storage: { getItem: () => 'en-US' }, languages: ['zh-TW'], language: 'zh-TW' }), 'en-US');
  assert.equal(selectPreferredLocale({ storage: { getItem: () => 'invalid' }, languages: ['zh-TW'], language: 'zh-TW' }), 'zh-Hant');
});

test('redirect requires a different locale and an advertised counterpart', () => {
  assert.equal(getRedirectTarget({
    currentLocale: 'zh-Hant', preferredLocale: 'en-US',
    alternateHref: 'https://crcolab.art/en/news/',
    currentHref: 'https://crcolab.art/news/',
  }), 'https://crcolab.art/en/news/');
  assert.equal(getRedirectTarget({
    currentLocale: 'en-US', preferredLocale: 'en-US',
    alternateHref: 'https://crcolab.art/', currentHref: 'https://crcolab.art/en/',
  }), null);
  assert.equal(getRedirectTarget({
    currentLocale: 'zh-Hant', preferredLocale: 'en-US',
    alternateHref: '', currentHref: 'https://crcolab.art/events/hackathon-2026/',
  }), null);
  assert.equal(getRedirectTarget({
    currentLocale: 'zh-Hant', preferredLocale: 'en-US',
    alternateHref: 'https://crcolab.art/', currentHref: 'https://crcolab.art/',
  }), null);
});

test('persisting a locale never throws when storage is blocked', () => {
  assert.equal(persistLocale({ setItem: () => {} }, 'en-US'), true);
  assert.equal(persistLocale({ setItem: () => { throw new Error('blocked'); } }, 'en-US'), false);
});
