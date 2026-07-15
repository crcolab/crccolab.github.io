import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [html, css] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
]);

test('about cubes and copy share a positioning wrapper', () => {
  assert.match(
    html,
    /<div class="about__content">\s*<div class="about__cubes"[\s\S]*?<div class="about__body">[\s\S]*?<\/div>\s*<\/div>\s*<div class="about__cta">/,
  );
});

test('phone breakpoint keeps all hero cubes in one compact row', () => {
  assert.match(css, /@media \(max-width:520px\)[\s\S]*?\.hero__cubes\{flex-wrap:nowrap;gap:12px\}/);
  assert.match(css, /@media \(max-width:520px\)[\s\S]*?\.hero__cubes \.crc-cube\{width:72px;flex:none\}/);
});

test('phone breakpoint layers a faint cube band behind about copy', () => {
  assert.match(css, /@media \(max-width:520px\)[\s\S]*?\.about__content\{position:relative\}/);
  assert.match(
    css,
    /\.about__cubes\{position:absolute;top:50%;left:50%;z-index:0;width:max-content;margin:0;gap:12px;opacity:\.15;transform:translate\(-50%,-50%\);flex-wrap:nowrap;pointer-events:none\}/,
  );
  assert.match(css, /\.about__cubes \.crc-cube\{width:80px;flex:none\}/);
  assert.match(css, /\.about__body\{position:relative;z-index:1\}/);
});
