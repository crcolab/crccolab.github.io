import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const EXEMPT_EVENTS = new Set(['2026-05-23-hackathon-2026.md']);
const pairs = [
  ['_news', '_news_en', new Set()],
  ['_events', '_events_en', EXEMPT_EVENTS],
  ['_records', '_records_en', new Set()],
  ['_ideas', '_ideas_en', new Set()],
];

function parseDocument(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, 'document must contain YAML front matter');
  const metadata = Object.fromEntries(match[1].split('\n').filter(line => /^[a-z_]+:/.test(line)).map(line => {
    const separator = line.indexOf(':');
    return [line.slice(0, separator), line.slice(separator + 1).trim().replace(/^[\'\"]|[\'\"]$/g, '')];
  }));
  return { metadata, body: match[2].trim() };
}

test('every in-scope Chinese document has one English document with the same slug', async () => {
  for (const [zhDir, enDir, exemptions] of pairs) {
    const zh = (await readdir(zhDir)).filter(name => name.endsWith('.md') && !exemptions.has(name)).sort();
    const en = (await readdir(enDir).catch(() => [])).filter(name => name.endsWith('.md')).sort();
    assert.deepEqual(en, zh, `${enDir} must exactly mirror ${zhDir}`);
  }
});

test('locale pairs preserve shared metadata and contain finished English copy', async () => {
  for (const [zhDir, enDir, exemptions] of pairs) {
    const names = (await readdir(zhDir)).filter(name => name.endsWith('.md') && !exemptions.has(name));
    for (const name of names) {
      const [zh, en] = await Promise.all([
        readFile(`${zhDir}/${name}`, 'utf8').then(parseDocument),
        readFile(`${enDir}/${name}`, 'utf8').then(parseDocument),
      ]);
      for (const key of ['date', 'category', 'source', 'external_url', 'image', 'start_date', 'end_date', 'author_slug', 'draft', 'canonical_url']) {
        assert.equal(en.metadata[key] || '', zh.metadata[key] || '', `${name}: ${key}`);
      }
      assert.equal(en.metadata.locale, 'en-US', `${name}: locale`);
      assert.ok(en.metadata.title?.length >= 4, `${name}: title`);
      assert.ok(en.metadata.summary?.length >= 30, `${name}: summary`);
      assert.ok(en.body.length >= 40, `${name}: body`);
      assert.doesNotMatch(`${en.metadata.title}\n${en.metadata.summary}\n${en.body}`, /\b(?:TODO|TBD|FIXME)\b|\[placeholder\]/i, `${name}: unfinished copy`);
    }
  }
});

test('reviewed translations preserve specific source claims', async () => {
  const residency = await readFile('_news_en/2026-06-29-c-lab-residency.md', 'utf8');
  assert.equal((residency.match(/state of war preparedness/g) || []).length, 2);

  const offlineMission = await readFile('_records_en/2026-05-24-offline-mission-recap.md', 'utf8').then(parseDocument);
  assert.match(offlineMission.metadata.summary, /More than 180 participant turns/);
  assert.match(offlineMission.body, /More than \*\*180 participant turns\*\*/);

  const vulnerability = 'Surrounded by sea, Taiwan is especially sensitive and vulnerable to changes affecting subsea cables, and this vulnerability is even more pronounced amid unstable geopolitics.';
  for (const file of ['_news_en/2026-02-10-open-register.md', '_news_en/2026-03-25-past-events.md']) {
    assert.match(await readFile(file, 'utf8'), new RegExp(vulnerability.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const hackathon = await readFile('_news_en/2026-05-02-hackathon-2026-upcoming.md', 'utf8');
  assert.match(hackathon, /war zones, jungles, outlying islands, and remote rural communities/);
});
