import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [css, sections, consent, hackathon] = await Promise.all([
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../sections.css', import.meta.url), 'utf8'),
  readFile(new URL('../assets/consent.js', import.meta.url), 'utf8'),
  readFile(new URL('../events/hackathon-2026/styles.css', import.meta.url), 'utf8'),
]);

test('shared CSS defines the approved readable hierarchy', () => {
  assert.match(css, /--fs-body:1\.125rem/);
  assert.match(css, /--fs-supporting:1rem/);
  assert.match(css, /--fs-label:\.875rem/);
  assert.match(css, /--control-min:44px/);
  assert.match(css, /body\{[\s\S]*font-size:var\(--fs-body\)/);
});

test('meaningful shared components consume readable tokens', () => {
  for (const selector of ['crc-btn', 'site-nav__link', 'crc-news__excerpt', 'footer__col a', 'team-member-panel__role']) {
    assert.match(css, new RegExp(`\\.${selector.replace(' ', '\\s+')}[^}]*font-size:var\\(--fs-(?:body|supporting|label)\\)`));
  }
  assert.match(sections, /\.item__body[^}]*font-size:var\(--fs-body\)/);
  assert.match(sections, /\.item__body[^}]*max-width:65ch/);
  assert.match(css, /min-height:var\(--control-min\)/);
});

test('consent receives one locale and uses readable control sizes', () => {
  assert.match(consent, /currentScript\.dataset/);
  assert.match(consent, /font-size:16px/);
  assert.match(consent, /min-height:44px/);
  assert.doesNotMatch(consent, /class="en"|font-size:12px|font-size:13px/);
});

test('Hackathon 2026 stylesheet stays outside the shared token rollout', () => {
  assert.doesNotMatch(hackathon, /--fs-body|--control-min/);
});
