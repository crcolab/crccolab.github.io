import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { assertApprovedHeadingScale } from './helpers/heading-scale-css.mjs';

const [css, sections, consent, hackathonCss, hackathonPage] = await Promise.all([
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../sections.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/consent.js', import.meta.url), 'utf8'),
  readFile(new URL('../events/hackathon-2026/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../events/hackathon-2026/index.html', import.meta.url), 'utf8'),
]);

function runConsent(dataset = {}) {
  const makeElement = tagName => ({
    tagName,
    children: [],
    attributes: {},
    listeners: {},
    style: {},
    appendChild(child) { this.children.push(child); },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(type, listener) { this.listeners[type] = listener; },
    remove() { this.removed = true; },
  });
  const document = {
    currentScript: { dataset },
    head: makeElement('head'),
    body: makeElement('body'),
    createElement: makeElement,
  };
  const writes = [];
  const updates = [];
  const localStorage = {
    getItem: () => null,
    setItem: (key, value) => writes.push([key, value]),
  };
  const gtag = (...args) => updates.push(args);

  runInNewContext(consent, { document, localStorage, gtag });
  const banner = document.body.children[0];
  const message = banner.children[0];
  const [accept, reject] = banner.children[1].children;
  return { accept, banner, message, reject, updates, writes };
}

function canonicalHeadingFixture(extraCss = '') {
  return `
    :root{
      --fs-section-heading:clamp(2.5rem,5vw,4rem);
      --fs-subsection-heading:clamp(1.5rem,2vw,1.75rem)
    }
    .crc-heading__en,.crc-heading__zh,.crc-heading__title{
      font-size:var(--fs-section-heading);font-weight:700
    }
    .news__section-title{font-size:var(--fs-subsection-heading)}
    ${extraCss}
  `;
}

test('shared CSS defines the approved readable hierarchy', () => {
  assert.match(css, /--fs-body:1\.125rem/);
  assert.match(css, /--fs-supporting:1rem/);
  assert.match(css, /--fs-label:\.875rem/);
  assert.match(css, /--control-min:44px/);
  assert.match(css, /body\{[\s\S]*font-size:var\(--fs-body\)/);
});

test('shared headings use the approved elderly-friendly responsive scale', () => {
  assertApprovedHeadingScale(css, 'source styles.css');
});

test('heading scale guard catches max-width overrides outside the comment-delimited slice', () => {
  const fixture = `
    :root{
      --fs-section-heading:clamp(2.5rem,5vw,4rem);
      --fs-subsection-heading:clamp(1.5rem,2vw,1.75rem)
    }
    .crc-heading__en,.crc-heading__zh,.crc-heading__title{
      font-size:var(--fs-section-heading);font-weight:700
    }
    .news__section-title{font-size:var(--fs-subsection-heading)}
    /* ---------- Responsive ---------- */
    @media (max-width:900px){.unrelated{margin:0}}
    /* ---------- homepage latest-3 section blocks ---------- */
    @media (max-width:480px){
      .unrelated{display:grid}
      .crc-heading__en,.crc-heading__zh,.crc-heading__title{font-size:1rem}
    }
  `;

  assert.throws(
    () => assertApprovedHeadingScale(fixture, 'late media fixture'),
    /max-width media: \.crc-heading__en font-size 1rem falls below 2\.5rem/,
  );
});

test('heading scale guard allows harmless responsive changes and safe font-size minima', () => {
  const fixture = `
    :root{
      --fs-section-heading:clamp(2.5rem,5vw,4rem);
      --fs-subsection-heading:clamp(1.5rem,2vw,1.75rem)
    }
    .crc-heading__en,.crc-heading__zh,.crc-heading__title{
      font-size:var(--fs-section-heading);font-weight:700
    }
    .news__section-title{font-size:var(--fs-subsection-heading)}
    @media (max-width:600px){
      .crc-heading__en{margin-block:1rem;line-height:1.1}
      .news__section-title{margin:0;line-height:1.2}
    }
    @media (max-width:480px){
      .crc-heading__en,.crc-heading__zh,.crc-heading__title{font-size:2.75rem}
      .news__section-title{font-size:clamp(1.5rem,4vw,2rem)}
    }
  `;

  assert.doesNotThrow(() => assertApprovedHeadingScale(fixture, 'safe media fixture'));
});

test('heading scale guard rejects later locale-specific size or weight declarations', () => {
  for (const override of [
    '.crc-heading__en{font-size:3rem}',
    '.crc-heading__title{font-weight:600}',
  ]) {
    assert.throws(
      () => assertApprovedHeadingScale(canonicalHeadingFixture(override), 'divergent cascade fixture'),
      /later font-size\/font-weight rule must treat locale\/title headings equally/,
    );
  }
});

test('heading scale guard rejects a bad later grouped section-heading override', () => {
  const override = `
    .crc-heading__en,.crc-heading__zh,.crc-heading__title{
      font-size:1rem;font-weight:400
    }
  `;

  assert.throws(
    () => assertApprovedHeadingScale(canonicalHeadingFixture(override), 'grouped cascade fixture'),
    /later section heading font-size must consume var\(--fs-section-heading\)/,
  );
});

test('heading scale guard rejects a bad later non-media news-title override', () => {
  assert.throws(
    () => assertApprovedHeadingScale(
      canonicalHeadingFixture('.news__section-title{font-size:1rem}'),
      'news cascade fixture',
    ),
    /later news title font-size must consume var\(--fs-subsection-heading\)/,
  );
});

test('heading scale guard requires the exact canonical token and selector contracts', () => {
  const fixedMinimumFixture = `
    :root{
      --fs-section-heading:2.5rem;
      --fs-subsection-heading:1.5rem
    }
    .crc-heading__en,.crc-heading__zh,.crc-heading__title{
      font-size:2.5rem;font-weight:400
    }
    .news__section-title{font-size:1.5rem}
  `;

  assert.throws(
    () => assertApprovedHeadingScale(fixedMinimumFixture, 'fixed minimum fixture'),
    /canonical/,
  );

  for (const [label, fixture, expected] of [
    [
      'subsection token',
      canonicalHeadingFixture().replace('clamp(1.5rem,2vw,1.75rem)', '1.5rem'),
      /canonical --fs-subsection-heading/,
    ],
    [
      'grouped heading size',
      canonicalHeadingFixture().replace('font-size:var(--fs-section-heading)', 'font-size:2.5rem'),
      /canonical grouped heading font-size/,
    ],
    [
      'grouped heading weight',
      canonicalHeadingFixture().replace('font-weight:700', 'font-weight:400'),
      /canonical grouped heading font-weight/,
    ],
    [
      'news title size',
      canonicalHeadingFixture().replace('font-size:var(--fs-subsection-heading)', 'font-size:1.5rem'),
      /canonical \.news__section-title font-size/,
    ],
  ]) {
    assert.throws(
      () => assertApprovedHeadingScale(fixture, `${label} fixture`),
      expected,
    );
  }
});

test('heading scale guard catches contextual and compound heading overrides', () => {
  for (const override of [
    '.theme .crc-heading__en{font-size:1rem}',
    '.crc-heading__title.featured{font-weight:400}',
  ]) {
    assert.throws(
      () => assertApprovedHeadingScale(canonicalHeadingFixture(override), 'compound selector fixture'),
      /later font-size\/font-weight rule must treat locale\/title headings equally/,
    );
  }
});

test('heading scale guard catches responsive token overrides in inherited and target scopes', () => {
  for (const override of [
    '@media (max-width:480px){:root{--fs-section-heading:1rem}}',
    '@media (max-width:480px){html.theme{--fs-subsection-heading:1rem}}',
    '@media (max-width:480px){body{--fs-section-heading:1rem}}',
    '@media (max-width:480px){.theme .crc-heading__en{--fs-section-heading:1rem}}',
    '@media (max-width:480px){.theme .news__section-title{--fs-subsection-heading:1rem}}',
  ]) {
    assert.throws(
      () => assertApprovedHeadingScale(canonicalHeadingFixture(override), 'responsive token fixture'),
      /max-width media.*falls below/,
    );
  }
});

for (const [label, override] of [
  ['40px section size', '@media (max-width:480px){.crc-heading__en,.crc-heading__zh,.crc-heading__title{font-size:40px}}'],
  ['24px subsection size', '@media (max-width:480px){.news__section-title{font-size:24px}}'],
  ['max() floor', '@media (max-width:480px){.crc-heading__en,.crc-heading__zh,.crc-heading__title{font-size:max(2.5rem,5vw)}}'],
  ['positive calc() floor', '@media (max-width:480px){.crc-heading__en,.crc-heading__zh,.crc-heading__title{font-size:calc(2.5rem + 1vw)}}'],
]) {
  test(`heading scale guard accepts a demonstrably safe ${label}`, () => {
    assert.doesNotThrow(
      () => assertApprovedHeadingScale(canonicalHeadingFixture(override), `${label} fixture`),
    );
  });
}

test('heading scale guard still rejects undersized or non-demonstrable responsive values', () => {
  for (const override of [
    '@media (max-width:480px){.news__section-title{font-size:23px}}',
    '@media (max-width:480px){.news__section-title{font-size:min(1.5rem,5vw)}}',
    '@media (max-width:480px){.crc-heading__en,.crc-heading__zh,.crc-heading__title{font-size:calc(2rem + 1rem)}}',
    '@media (max-width:480px){.crc-heading__en,.crc-heading__zh,.crc-heading__title{font-size:calc(2.5rem - 1vw)}}',
  ]) {
    assert.throws(
      () => assertApprovedHeadingScale(canonicalHeadingFixture(override), 'unsafe value fixture'),
      /falls below|no demonstrable/,
    );
  }
});

test('heading scale guard keeps responsive section-heading weight at 700', () => {
  const override = `
    @media (max-width:480px){
      .crc-heading__en,.crc-heading__zh,.crc-heading__title{
        font-size:40px;font-weight:400
      }
    }
  `;

  assert.throws(
    () => assertApprovedHeadingScale(canonicalHeadingFixture(override), 'responsive weight fixture'),
    /later section heading font-weight must remain 700/,
  );
});

test('meaningful shared components consume readable tokens', () => {
  for (const selector of ['crc-btn', 'site-nav__link', 'crc-news__excerpt', 'footer__col a', 'team-member-panel__role']) {
    assert.match(css, new RegExp(`\\.${selector.replace(' ', '\\s+')}[^}]*font-size:var\\(--fs-(?:body|supporting|label)\\)`));
  }
  assert.match(sections, /\.item__body[^}]*font-size:var\(--fs-body\)/);
  assert.match(sections, /\.item__body[^}]*max-width:65ch/);
  assert.match(css, /button\.team-card__names\{[^}]*min-height:var\(--control-min\)[^}]*min-width:var\(--control-min\)/);
});

test('shared headers reflow at narrow effective viewports without shrinking controls', () => {
  assert.match(css, /@media \(max-width:520px\)\{[\s\S]*?\.site-header\{[^}]*flex-wrap:wrap[^}]*\}[\s\S]*?\.site-header__latest\{display:none\}/);
  assert.match(css, /@media \(max-width:360px\)\{[\s\S]*?\.site-header\{[^}]*padding-inline:8px[^}]*\}[\s\S]*?\.site-header__actions\{[^}]*width:100%[^}]*\}/);
  assert.match(sections, /@media \(max-width:360px\)\{[\s\S]*?\.topbar__inner\{[^}]*padding-inline:8px[^}]*\}[\s\S]*?\.topbar__home\{[^}]*min-width:var\(--control-min\)[^}]*\}/);
  assert.match(sections, /\.topbar__home,\.locale-switcher a[^}]*min-height:var\(--control-min\)/);
});

test('homepage header brand retains a 44px minimum target height', () => {
  assert.match(css, /\.site-header__brand\{[^}]*min-height:var\(--control-min\)/);
});

test('section footer links retain 44px minimum target dimensions', () => {
  assert.match(sections, /\.sections-footer__inner a\{[^}]*min-width:var\(--control-min\)[^}]*justify-content:center/);
  assert.match(sections, /\.topbar__home,\.locale-switcher a,\.sections-footer a\{min-height:var\(--control-min\)\}/);
});

test('consent receives one locale and uses readable control sizes', () => {
  assert.match(consent, /currentScript\.dataset/);
  assert.match(consent, /font-size:16px/);
  assert.match(consent, /min-height:44px/);
  assert.doesNotMatch(consent, /class="en"|font-size:12px|font-size:13px/);
});

test('dataset-provided consent renders exactly the supplied locale', () => {
  const rendered = runConsent({ message: 'English message', accept: 'Accept', reject: 'Decline' });
  assert.equal(rendered.message.textContent, 'English message');
  assert.equal(rendered.accept.textContent, 'Accept');
  assert.equal(rendered.reject.textContent, 'Decline');
});

test('dataset-free consent renders meaningful legacy copy', () => {
  const rendered = runConsent();
  assert.equal(rendered.message.textContent, '本站使用 Cookie 進行匿名流量分析（Google Analytics）。 This site uses cookies for anonymous traffic analytics (Google Analytics).');
  assert.equal(rendered.accept.textContent, '接受 Accept');
  assert.equal(rendered.reject.textContent, '拒絕 Decline');
});

test('dataset-free consent actions preserve storage and Consent Mode behavior', () => {
  const accepted = runConsent();
  accepted.accept.listeners.click();
  assert.deepEqual(accepted.writes, [['crc-consent', 'granted']]);
  assert.deepEqual(JSON.parse(JSON.stringify(accepted.updates)), [[
    'consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'granted',
      ad_user_data: 'granted', ad_personalization: 'granted',
    },
  ]]);
  assert.equal(accepted.banner.removed, true);

  const rejected = runConsent();
  rejected.reject.listeners.click();
  assert.deepEqual(rejected.writes, [['crc-consent', 'denied']]);
  assert.deepEqual(JSON.parse(JSON.stringify(rejected.updates)), [[
    'consent', 'update', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    },
  ]]);
  assert.equal(rejected.banner.removed, true);
});

test('Hackathon 2026 stays outside the token rollout and uses legacy consent invocation', () => {
  assert.doesNotMatch(hackathonCss, /--fs-body|--control-min/);
  assert.match(hackathonPage, /<script src="\/assets\/consent\.js" defer><\/script>/);
});
