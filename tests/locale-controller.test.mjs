import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOCALE_KEY,
  SUGGEST_DISMISSED_KEY,
  detectBrowserLocale,
  getRedirectTarget,
  initLocaleController,
  persistLocale,
  readStoredLocale,
  shouldSuggestLocale,
} from '../assets/locale.js';

function localeDocument(lang = 'zh-Hant', alternates = {}) {
  return {
    documentElement: { lang },
    querySelector: selector => {
      const hreflang = selector.match(/hreflang="([^"]+)"/)?.[1];
      return alternates[hreflang] ? { href: alternates[hreflang] } : null;
    },
    querySelectorAll: () => [],
  };
}

function withWindow(windowValue, callback) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: windowValue });
  try {
    return callback();
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else delete globalThis.window;
  }
}

test('stored preference accepts only supported locale values', () => {
  assert.equal(readStoredLocale({ getItem: () => 'en-US' }), 'en-US');
  assert.equal(readStoredLocale({ getItem: () => 'fr' }), null);
  assert.equal(readStoredLocale({ getItem: () => { throw new Error('blocked'); } }), null);
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
  assert.equal(getRedirectTarget({
    currentLocale: 'zh-Hant', preferredLocale: 'en-US',
    alternateHref: 'https://crcolab.art/en/',
    currentHref: 'http://127.0.0.1:4000/',
  }), 'http://127.0.0.1:4000/en/');
});

test('persisting a locale never throws when storage is blocked', () => {
  assert.equal(persistLocale({ setItem: () => {} }, 'en-US'), true);
  assert.equal(persistLocale({ setItem: () => { throw new Error('blocked'); } }, 'en-US'), false);
});

test('controller initialization survives a throwing window.localStorage getter on a static route', () => {
  const blockedWindow = {};
  Object.defineProperty(blockedWindow, 'localStorage', {
    get() { throw new Error('SecurityError: storage blocked'); },
  });

  const result = withWindow(blockedWindow, () => initLocaleController({
    document: localeDocument(),
    location: { href: 'https://crcolab.art/events/hackathon-2026/', replace: () => assert.fail('unexpected redirect') },
    navigator: { languages: ['zh-TW'], language: 'zh-TW' },
  }));

  assert.deepEqual(result, { currentLocale: 'zh-Hant', preferredLocale: null, target: null, suggested: false });
});

test('controller initialization preserves explicitly injected storage', () => {
  const result = withWindow({
    get localStorage() { throw new Error('must not read window storage'); },
  }, () => initLocaleController({
    document: localeDocument(),
    location: { href: 'https://crcolab.art/', replace: () => {} },
    navigator: { languages: ['zh-TW'], language: 'zh-TW' },
    storage: { getItem: () => 'en-US' },
  }));

  assert.equal(result.preferredLocale, 'en-US');
});

test('a stored switcher choice redirects to the advertised counterpart', () => {
  let redirectedTo = null;
  const result = initLocaleController({
    document: localeDocument('zh-Hant', { 'en-US': 'https://crcolab.art/en/' }),
    location: { href: 'https://crcolab.art/', replace: href => { redirectedTo = href; } },
    navigator: { languages: ['zh-TW'], language: 'zh-TW' },
    storage: { getItem: () => 'en-US' },
  });

  assert.equal(result.target, 'https://crcolab.art/en/');
  assert.equal(redirectedTo, 'https://crcolab.art/en/');
});

function suggestionDocument({ lang = 'zh-Hant', alternates = { 'en-US': 'https://crcolab.art/en/' }, template = true } = {}) {
  const appended = [];
  const listeners = {};
  const banner = {
    querySelector: selector => ({
      addEventListener: (type, handler) => { listeners[selector] = handler; },
      dataset: { localeOption: 'en-US' },
    }),
    remove: () => { banner.removed = true; },
  };
  const doc = localeDocument(lang, alternates);
  doc.getElementById = id => {
    if (id === 'crc-locale-suggest' && template) return { content: { firstElementChild: { cloneNode: () => banner } } };
    if (id === 'crc-dock') return { prepend: node => appended.push(node) };
    return null;
  };
  return { doc, appended, listeners, banner };
}

function memoryStorage(values = {}) {
  return {
    values,
    getItem: key => values[key] ?? null,
    setItem: (key, value) => { values[key] = value; },
  };
}

test('browser locale chooses Chinese for any zh variant and English otherwise', () => {
  assert.equal(detectBrowserLocale(['zh-TW', 'en-US'], ''), 'zh-Hant');
  assert.equal(detectBrowserLocale(['en-GB'], ''), 'en-US');
  assert.equal(detectBrowserLocale([], 'ja-JP'), 'en-US');
  assert.equal(detectBrowserLocale([], ''), null);
});

test('suggestion appears only for an unchosen, undismissed, advertised mismatch', () => {
  const base = { currentLocale: 'zh-Hant', browserLocale: 'en-US', storedLocale: null, dismissed: false, hasAlternate: true };
  assert.equal(shouldSuggestLocale(base), true);
  assert.equal(shouldSuggestLocale({ ...base, browserLocale: 'zh-Hant' }), false);
  assert.equal(shouldSuggestLocale({ ...base, browserLocale: null }), false);
  assert.equal(shouldSuggestLocale({ ...base, storedLocale: 'zh-Hant' }), false);
  assert.equal(shouldSuggestLocale({ ...base, dismissed: true }), false);
  assert.equal(shouldSuggestLocale({ ...base, hasAlternate: false }), false);
});

test('an English browser on a zh-Hant page gets the banner instead of a redirect', () => {
  const { doc, appended } = suggestionDocument();
  const result = initLocaleController({
    document: doc,
    location: { href: 'https://crcolab.art/', replace: () => assert.fail('unexpected redirect') },
    navigator: { languages: ['en-US'], language: 'en-US' },
    storage: memoryStorage(),
  });

  assert.equal(result.suggested, true);
  assert.equal(appended.length, 1);
});

test('dismissing the banner removes it and keeps it away on later pages', () => {
  const storage = memoryStorage();
  const { doc, listeners, banner } = suggestionDocument();
  initLocaleController({
    document: doc,
    location: { href: 'https://crcolab.art/', replace: () => {} },
    navigator: { languages: ['en-US'], language: 'en-US' },
    storage,
  });
  listeners['[data-locale-dismiss]']();

  assert.equal(banner.removed, true);
  assert.equal(storage.values[SUGGEST_DISMISSED_KEY], '1');

  const later = suggestionDocument();
  const result = initLocaleController({
    document: later.doc,
    location: { href: 'https://crcolab.art/news/', replace: () => {} },
    navigator: { languages: ['en-US'], language: 'en-US' },
    storage,
  });
  assert.equal(result.suggested, false);
  assert.equal(later.appended.length, 0);
});

test('accepting the banner stores the choice like the switcher does', () => {
  const storage = memoryStorage();
  const { doc, listeners } = suggestionDocument();
  initLocaleController({
    document: doc,
    location: { href: 'https://crcolab.art/', replace: () => {} },
    navigator: { languages: ['en-US'], language: 'en-US' },
    storage,
  });
  listeners['[data-locale-option]']();

  assert.equal(storage.values[LOCALE_KEY], 'en-US');
});

test('pages without the banner template still initialize', () => {
  const { doc } = suggestionDocument({ template: false });
  const result = initLocaleController({
    document: doc,
    location: { href: 'https://crcolab.art/', replace: () => {} },
    navigator: { languages: ['en-US'], language: 'en-US' },
    storage: memoryStorage(),
  });
  assert.equal(result.suggested, false);
});
