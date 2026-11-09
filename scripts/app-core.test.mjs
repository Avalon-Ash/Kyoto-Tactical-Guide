// Guards for the unified UI layer: one dictionary, one palette, no per-component styling drift.
import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {createServer} from 'vite';

let server, i18n;
before(async () => {
  server = await createServer({server: {middlewareMode: true, hmr: false}, appType: 'custom'});
  i18n = await server.ssrLoadModule('/src/data/i18n.ts');
});
after(async () => { await server?.close(); });

const components = readdirSync('src/components').filter(f => f.endsWith('.tsx')).map(f => [f, readFileSync(join('src/components', f), 'utf8')]);
const sources = [...components, ['App.tsx', readFileSync('src/App.tsx', 'utf8')]];

test('translate falls back to Chinese, then the key itself', () => {
  assert.equal(i18n.translate('btn_back', 'ja'), '帰る');
  assert.equal(i18n.translate('btn_back', 'zh'), '歸、');
  assert.equal(i18n.translate('only_zh', 'ja', {only_zh: {zh: '中'}}), '中');
  assert.equal(i18n.translate('missing_key', 'zh'), 'missing_key');
});

test('every interface key used by a component exists in both languages', () => {
  const used = new Set();
  for (const [, code] of sources) for (const m of code.matchAll(/\b(?:t|translate)\('([a-z_]+)'/g)) used.add(m[1]);
  assert.ok(used.size > 20, `found ${used.size} keys`);
  for (const key of used) {
    const entry = i18n.UI_DICT[key];
    assert.ok(entry?.zh && entry?.ja, `UI_DICT.${key} needs zh and ja`);
  }
});

test('components carry no inline zh/ja ternaries; strings belong in UI_DICT', () => {
  for (const [file, code] of components) {
    assert.doesNotMatch(code, /lang\s*===\s*'zh'\s*\?\s*'/, `${file} has an inline bilingual string`);
  }
});

test('component class names use theme tokens, not literal colours or Tailwind colour utilities', () => {
  for (const [file, code] of sources) {
    for (const m of code.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
      const value = m[1] ?? m[2];
      assert.doesNotMatch(value, /#[0-9a-f]{3,8}|\b(?:text|bg|border)-(?:gold|shuiro|\[)/i, `${file}: ${value}`);
    }
  }
});

test('theme.css defines every token for both moonlight and day', () => {
  const css = readFileSync('src/theme.css', 'utf8');
  const blocks = css.split('}').filter(b => b.includes('--entry-paper:'));
  assert.equal(blocks.length, 2);
  const names = b => [...b.matchAll(/(--[a-z-]+):/g)].map(m => m[1]).filter(n => !n.startsWith('--font') && n !== '--title-font');
  assert.deepEqual(names(blocks[1]).sort(), names(blocks[0]).sort());
});
