# Readable Typography and English i18n Design

## Summary

CRC will replace its current bilingual hierarchy with two complete, single-language experiences. Existing URLs remain Traditional Chinese (`zh-Hant`), and a static English (`en-US`) mirror is published under `/en/`. Meaningful English will no longer appear as small secondary copy beneath Chinese content.

All in-scope pages adopt an inclusive type scale based on the Hackathon 2026 page but adjusted for consistently readable supporting text. The Hackathon 2026 page itself is the typography reference and is excluded from modification and English mirroring.

## Goals

- Make all meaningful text comfortable to read for older visitors and visitors with low vision.
- Present one complete language at a time instead of treating English as fine print.
- Publish indexable, linkable, no-JavaScript English pages under `/en/`.
- Translate the homepage, News, Events, Records, and all associated item pages.
- Detect the browser's language automatically while remembering an explicit user choice.
- Preserve the existing static HTML, CSS, JavaScript, and GitHub Pages/Jekyll architecture.

## Non-goals

- Do not modify or duplicate `/events/hackathon-2026/`.
- Do not introduce runtime or machine translation.
- Do not add a framework, bundler, custom Jekyll plugin, or external translation service.
- Do not otherwise redesign the CRC visual identity or content hierarchy.

## Locale Architecture

### Routes

Traditional Chinese remains at the existing routes:

- `/`
- `/news/`, `/events/`, and `/records/`
- `/news/<slug>/`, `/events/<slug>/`, and `/records/<slug>/`

English uses matching routes under `/en/`:

- `/en/`
- `/en/news/`, `/en/events/`, and `/en/records/`
- `/en/news/<slug>/`, `/en/events/<slug>/`, and `/en/records/<slug>/`

English section feeds are published at `/en/news/feed.xml`, `/en/events/feed.xml`, and `/en/records/feed.xml`. English homepage data is published at `/en/api/latest.json` so its latest-content blocks do not depend on Chinese entries.

### Content storage

English long-form content is committed as normal, editable repository content in dedicated English Jekyll collections. The English collection for each section uses the same item slug as its Traditional Chinese counterpart. Shared metadata such as dates, external source URLs, images, and event dates stays aligned between each pair.

Interface strings shared by layouts and scripts live in one locale data file keyed by `zh-Hant` and `en-US`. Substantial page copy and article bodies remain in their locale-specific HTML or Markdown files rather than being embedded in a JavaScript dictionary.

Shared layouts accept a page locale and select the correct labels, collection, feed, and navigation URLs. This keeps the rendering structure consistent without coupling the two editorial bodies together.

Hackathon 2026 is the sole locale-parity exception. The English Events index links to its existing URL and labels it as a bilingual event page. No `/en/events/hackathon-2026/` route is created, and the event page itself receives neither the new locale controller nor typography changes.

### Page metadata

Every paired page declares the correct `<html lang>` value, locale-specific canonical URL, and reciprocal alternate links using `hreflang="zh-Hant"` and `hreflang="en-US"`. `x-default` points to the Traditional Chinese route. Open Graph locale values are `zh_TW` and `en_US` as appropriate.

The visible header provides a `繁中 / EN` switcher. Each option is an ordinary anchor to the paired static URL so it works without JavaScript.

## Typography and Components

The selected type scale is:

- Primary body copy: 18px (`1.125rem`) minimum.
- Supporting copy: 16px (`1rem`) minimum.
- Meaningful labels and metadata: 14px (`0.875rem`) minimum.
- Interactive controls: 16px minimum text with at least a 44 by 44px target.

Headings remain responsive and retain the existing CRC display hierarchy. Article bodies use generous line height and a readable measure of approximately 65 characters. Narrow layouts reflow rather than reducing meaningful copy below these baselines.

The scale applies to the homepage, section indexes, item pages, navigation, buttons, cards, news metadata, team cards and overlays, modals, footer, consent banner, and other in-scope interfaces. It does not apply to Hackathon 2026.

English is not visually subordinate on English pages. Paragraphs and essential information do not use tiny monospace, forced uppercase, or excessive letter spacing. Monospace and wide tracking remain available only for short visual labels that meet the 14px meaningful-text floor. Decorative telemetry may be hidden from assistive technology; if telemetry communicates information, it must meet the readable baseline.

Traditional Chinese pages remove duplicated English subtitles and fine print unless the English wording is a proper name, official title, source name, or other content that is meaningful in its original form. English pages follow the corresponding rule for Chinese wording.

## Locale Selection Data Flow

The locale controller is a progressive enhancement loaded only on paired, in-scope pages.

1. The controller reads the stored locale preference from `localStorage`.
2. If no valid preference exists, it examines `navigator.languages`, falling back to `navigator.language`.
3. The controller selects the first non-empty browser-language value. A value beginning with `zh` selects `zh-Hant`; any other non-empty value selects `en-US`. If neither browser-language API provides a non-empty value, the controller falls back to `zh-Hant`.
4. The controller reads the paired destination from the page's locale alternate link. It redirects with `location.replace()` only when the selected locale differs from the current locale and a counterpart exists.
5. Selecting `繁中` or `EN` saves that explicit preference to `localStorage` before following the normal anchor.
6. The controller compares the current and destination URLs before navigation to prevent redirect loops.

An explicit switcher choice therefore overrides future browser-language detection. The selected static page remains readable while the script runs, and the destination is also a complete static page.

## Failure Handling

- Storage reads and writes are wrapped so privacy settings or storage exceptions cannot break page rendering or navigation.
- Invalid stored locale values are ignored and replaced by browser-language selection.
- When browser-language information is unavailable, the stable fallback is `zh-Hant`.
- A redirect occurs only when the document advertises a valid counterpart; missing translations never generate a guessed or broken destination.
- If JavaScript is disabled, the requested page remains fully usable and the switcher continues to work as ordinary links.
- Locale-parity validation treats missing translations as build/test failures, with Hackathon 2026 recorded as the only allowed exception.
- Translation content must not contain empty bodies, placeholder markers, or untranslated interface strings.

## Verification Strategy

### Automated checks

- Verify every in-scope Traditional Chinese route has an English route with the same slug, and vice versa.
- Verify dates, images, external URLs, and other shared metadata stay aligned across locale pairs.
- Verify generated pages contain correct `lang`, canonical, Open Graph locale, reciprocal `hreflang`, navigation, feed, and switcher URLs.
- Verify English indexes and `/en/api/latest.json` consume English collections.
- Test locale selection for saved `zh-Hant` and `en-US` values, invalid values, Chinese and non-Chinese browser languages, unavailable browser-language APIs, storage exceptions, missing counterparts, and loop prevention.
- Assert the 18/16/14px typography tokens and 44px minimum interactive-target token are applied to all shared in-scope surfaces.
- Scan translations for empty content, `TODO`, `TBD`, placeholder copy, and bilingual interface leakage.

### Browser and accessibility checks

- Review representative homepage, section-index, article, modal, consent-banner, footer, and team-overlay states at desktop and mobile widths.
- Verify reflow at 200% browser zoom without clipped content or horizontal page scrolling.
- Verify keyboard navigation, visible focus states, logical language-switch labels, and reduced-motion behavior.
- Check text and control contrast in both the default and purple themes.
- Confirm that meaningful text never relies on decorative microcopy styling.
- Confirm Hackathon 2026 is visually and behaviorally unchanged.

## Acceptance Criteria

- Visitors see one complete locale at a time.
- `/en/` provides committed English translations for every public page except Hackathon 2026.
- The language switcher works with and without JavaScript.
- Browser language selects the initial locale, and an explicit selection persists through `localStorage`.
- No meaningful in-scope text is smaller than the approved 18/16/14px hierarchy.
- Static metadata and feeds expose both locales correctly.
- Automated parity, locale-controller, typography, and content checks pass.
- Manual desktop, mobile, zoom, keyboard, and contrast reviews pass.
