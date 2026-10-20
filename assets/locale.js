export const LOCALE_KEY = 'crc-locale';
export const SUGGEST_DISMISSED_KEY = 'crc-locale-suggest-dismissed';
export const SUPPORTED_LOCALES = new Set(['zh-Hant', 'en-US']);

export function detectBrowserLocale(languages = [], language = '') {
  const values = [...languages, language].filter(value => typeof value === 'string' && value.trim());
  if (values.length === 0) return null;
  return values[0].toLowerCase().startsWith('zh') ? 'zh-Hant' : 'en-US';
}

export function readStoredLocale(storage) {
  try {
    const locale = storage?.getItem(LOCALE_KEY);
    return SUPPORTED_LOCALES.has(locale) ? locale : null;
  } catch {
    return null;
  }
}

export function persistLocale(storage, locale) {
  if (!SUPPORTED_LOCALES.has(locale)) return false;
  try {
    storage?.setItem(LOCALE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}

export function shouldSuggestLocale({ currentLocale, browserLocale, storedLocale, dismissed, hasAlternate }) {
  return Boolean(browserLocale && browserLocale !== currentLocale && !storedLocale && !dismissed && hasAlternate);
}

function readDismissed(storage) {
  try {
    return storage?.getItem(SUGGEST_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function showSuggestion(doc, storage) {
  const template = doc.getElementById('crc-locale-suggest');
  const banner = template?.content.firstElementChild?.cloneNode(true);
  if (!banner) return false;
  const accept = banner.querySelector('[data-locale-option]');
  accept.addEventListener('click', () => persistLocale(storage, accept.dataset.localeOption));
  banner.querySelector('[data-locale-dismiss]').addEventListener('click', () => {
    try { storage?.setItem(SUGGEST_DISMISSED_KEY, '1'); } catch {}
    banner.remove();
  });
  // Fixed dock at the bottom, so revealing it never shifts layout (CLS).
  (doc.getElementById('crc-dock') || doc.body).prepend(banner);
  return true;
}

export function getRedirectTarget({ currentLocale, preferredLocale, alternateHref, currentHref }) {
  if (!SUPPORTED_LOCALES.has(currentLocale) || !SUPPORTED_LOCALES.has(preferredLocale)) return null;
  if (currentLocale === preferredLocale || !alternateHref) return null;
  const current = new URL(currentHref);
  const alternate = new URL(alternateHref, currentHref);
  const target = new URL(alternate.pathname + alternate.search + alternate.hash, current.origin).href;
  return target === current.href ? null : target;
}

function resolveStorage(storage) {
  if (storage !== undefined) return storage;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function initLocaleController({
  document: doc = document,
  location: loc = window.location,
  navigator: nav = window.navigator,
  storage,
} = {}) {
  const resolvedStorage = resolveStorage(storage);
  const currentLocale = doc.documentElement.lang;
  // Only an explicit switcher choice redirects. Guessing from navigator.languages
  // bounced crawlers and Lighthouse (which report en-US) off every zh-Hant page,
  // so a browser-language mismatch only offers the counterpart in a banner.
  const preferredLocale = readStoredLocale(resolvedStorage);
  const browserLocale = detectBrowserLocale(nav.languages, nav.language);
  const alternate = doc.querySelector(`link[rel="alternate"][hreflang="${preferredLocale}"]`);
  const target = getRedirectTarget({
    currentLocale,
    preferredLocale,
    alternateHref: alternate?.href || '',
    currentHref: loc.href,
  });

  doc.querySelectorAll('[data-locale-option]').forEach(link => {
    link.addEventListener('click', () => persistLocale(resolvedStorage, link.dataset.localeOption));
  });

  if (target) {
    loc.replace(target);
    return { currentLocale, preferredLocale, target, suggested: false };
  }

  const suggested = shouldSuggestLocale({
    currentLocale,
    browserLocale,
    storedLocale: preferredLocale,
    dismissed: readDismissed(resolvedStorage),
    hasAlternate: Boolean(doc.querySelector(`link[rel="alternate"][hreflang="${browserLocale}"]`)),
  }) && showSuggestion(doc, resolvedStorage);
  return { currentLocale, preferredLocale, target, suggested };
}

if (typeof document !== 'undefined') initLocaleController();
