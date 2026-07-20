import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

function parseFrontMatter(source, name) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, `${name}: must contain YAML front matter`);
  const metadata = Object.fromEntries(
    match[1].split('\n')
      .filter(line => /^[a-z_]+:/.test(line))
      .map(line => {
        const separator = line.indexOf(':');
        return [line.slice(0, separator), line.slice(separator + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
  return { metadata, body: match[2].trim() };
}

test('every _ideas file has a paired _ideas_en file with the same slug', async () => {
  const [zh, en] = await Promise.all([
    readdir('_ideas').then(list => list.filter(name => name.endsWith('.md')).sort()),
    readdir('_ideas_en').catch(() => []).then(list => list.filter(name => name.endsWith('.md')).sort()),
  ]);
  assert.deepEqual(en, zh, '_ideas_en must exactly mirror _ideas');
});

test('every _ideas filename matches YYYY-MM-DD-<slug>.md', async () => {
  const names = (await readdir('_ideas')).filter(name => name.endsWith('.md'));
  for (const name of names) {
    assert.match(name, /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/, `${name}: bad slug`);
  }
});

test('required front matter is present on every idea', async () => {
  const names = (await readdir('_ideas')).filter(name => name.endsWith('.md'));
  for (const name of names) {
    const doc = await readFile(`_ideas/${name}`, 'utf8').then(source => parseFrontMatter(source, name));
    for (const key of ['title', 'date', 'category', 'summary']) {
      assert.ok(doc.metadata[key], `_ideas/${name}: missing ${key}`);
    }
    if (doc.metadata.draft === 'true') {
      assert.equal(doc.metadata.sitemap, 'false', `_ideas/${name}: draft must set sitemap: false`);
    }
  }
});

test('author_slug, when set, resolves to an existing _team profile', async () => {
  const [ideaNames, teamNames] = await Promise.all([
    readdir('_ideas').then(list => list.filter(name => name.endsWith('.md'))),
    readdir('_team').catch(() => []).then(list => list.filter(name => name.endsWith('.md')).map(name => name.replace(/\.md$/, ''))),
  ]);
  const teamSlugs = new Set(teamNames);
  // _team/ ships in Task 4; skip until it exists
  if (teamSlugs.size === 0) return;
  for (const name of ideaNames) {
    const doc = await readFile(`_ideas/${name}`, 'utf8').then(source => parseFrontMatter(source, name));
    if (doc.metadata.author_slug) {
      assert.ok(teamSlugs.has(doc.metadata.author_slug), `_ideas/${name}: author_slug '${doc.metadata.author_slug}' has no _team/<slug>.md`);
    }
  }
});

test('the seed idea has a real body (not the stub placeholder)', async () => {
  for (const path of ['_ideas/2026-03-25-crc-march-25-decks.md', '_ideas_en/2026-03-25-crc-march-25-decks.md']) {
    const source = await readFile(path, 'utf8');
    const body = source.split('\n---\n')[1] ?? '';
    assert.ok(body.length >= 600, `${path}: body too short (${body.length} chars) — expand from source repo`);
    assert.doesNotMatch(body, /暫存正文|Placeholder body|TODO|TBD/i, `${path}: still contains placeholder`);
  }
});
