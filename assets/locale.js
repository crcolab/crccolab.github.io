export const LOCALE_KEY = 'crc-locale';
export const SUPPORTED_LOCALES = new Set(['zh-Hant', 'en-US']);

export function detectBrowserLocale(languages = [], language = '') {
  const values = [...languages, language].filter(value => typeof value === 'string' && value.trim());
  if (values.length === 0) return 'zh-Hant';
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

export function selectPreferredLocale({ storage, languages = [], language = '' }) {
  return readStoredLocale(storage) || detectBrowserLocale(languages, language);
}

export function getRedirectTarget({ currentLocale, preferredLocale, alternateHref, currentHref }) {
  if (!SUPPORTED_LOCALES.has(currentLocale) || !SUPPORTED_LOCALES.has(preferredLocale)) return null;
  if (currentLocale === preferredLocale || !alternateHref) return null;
  const target = new URL(alternateHref, currentHref).href;
  return target === new URL(currentHref).href ? null : target;
}

export function initLocaleController({
  document: doc = document,
  location: loc = window.location,
  navigator: nav = window.navigator,
  storage = window.localStorage,
} = {}) {
  const currentLocale = doc.documentElement.lang;
  const preferredLocale = selectPreferredLocale({ storage, languages: nav.languages, language: nav.language });
  const alternate = doc.querySelector(`link[rel="alternate"][hreflang="${preferredLocale}"]`);
  const target = getRedirectTarget({
    currentLocale,
    preferredLocale,
    alternateHref: alternate?.href || '',
    currentHref: loc.href,
  });

  doc.querySelectorAll('[data-locale-option]').forEach(link => {
    link.addEventListener('click', () => persistLocale(storage, link.dataset.localeOption));
  });

  if (target) loc.replace(target);
  return { currentLocale, preferredLocale, target };
}

if (typeof document !== 'undefined') initLocaleController();
