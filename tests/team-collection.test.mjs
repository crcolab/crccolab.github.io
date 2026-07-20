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

test('every _team file has a paired _team_en file with the same slug', async () => {
  const [zh, en] = await Promise.all([
    readdir('_team').then(list => list.filter(name => name.endsWith('.md')).sort()),
    readdir('_team_en').catch(() => []).then(list => list.filter(name => name.endsWith('.md')).sort()),
  ]);
  assert.deepEqual(en, zh, '_team_en must exactly mirror _team');
});

test('required front matter is present on every member', async () => {
  for (const dir of ['_team', '_team_en']) {
    const names = (await readdir(dir)).filter(name => name.endsWith('.md'));
    for (const name of names) {
      const doc = await readFile(`${dir}/${name}`, 'utf8').then(source => parseFrontMatter(source, `${dir}/${name}`));
      for (const key of ['name', 'role']) {
        assert.ok(doc.metadata[key], `${dir}/${name}: missing ${key}`);
      }
    }
  }
});

test('every landing-page data-member-id has a matching _team/<slug>.md and vice versa', async () => {
  const index = await read('index.html');
  const idMatches = [...index.matchAll(/data-member-id="([a-z0-9-]+)"/g)].map(m => m[1]);
  const landingSlugs = new Set(idMatches);
  const teamSlugs = new Set(
    (await readdir('_team')).filter(name => name.endsWith('.md')).map(name => name.replace(/\.md$/, '')),
  );
  const rosaSlug = 'rosa-kuo';
  const expectedLandingSlugs = new Set([...landingSlugs, rosaSlug]);
  assert.deepEqual([...teamSlugs].sort(), [...expectedLandingSlugs].sort(),
    '_team/<slug>.md filenames must equal landing-page data-member-id values + rosa-kuo');
});

test('photo_hud_target, when set, matches an existing landing-page data-member-id', async () => {
  const index = await read('index.html');
  const landingSlugs = new Set([...index.matchAll(/data-member-id="([a-z0-9-]+)"/g)].map(m => m[1]));
  for (const dir of ['_team', '_team_en']) {
    const names = (await readdir(dir)).filter(name => name.endsWith('.md'));
    for (const name of names) {
      const doc = await readFile(`${dir}/${name}`, 'utf8').then(source => parseFrontMatter(source, `${dir}/${name}`));
      if (doc.metadata.photo_hud_target) {
        assert.ok(landingSlugs.has(doc.metadata.photo_hud_target),
          `${dir}/${name}: photo_hud_target '${doc.metadata.photo_hud_target}' has no matching data-member-id`);
      }
    }
  }
});
