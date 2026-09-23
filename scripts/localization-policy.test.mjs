import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  assertWithinWorkersFreeAssetBudget,
  NOINDEX_ROBOTS_META,
  slugFromTranslationFilename,
  STATIC_ASSET_FILE_BUDGET,
  withNoindex,
  WORKERS_FREE_STATIC_ASSET_LIMIT,
} from './localization-policy.mjs';

const HINDI_STUB = path.join(
  process.cwd(),
  'content-automation/generated-translations/hi/2026-03-30-rbi-monetary-policy-risk-watch-20260330-071-hi.md',
);

test('the Hindi template is an English body with a language label', () => {
  const raw = readFileSync(HINDI_STUB, 'utf8');
  assert.equal(raw.includes('lang: "hi"'), true);
  assert.equal(raw.includes('preserves the meaning of the English master'), true);
  assert.equal(
    slugFromTranslationFilename('2026-03-30-rbi-monetary-policy-risk-watch-20260330-071-hi.md'),
    'rbi-monetary-policy-risk-watch-20260330-071-hi',
  );
});

test('leftover translation HTML is marked noindex once', () => {
  const html = '<!doctype html>\n<html lang="hi">\n<head>\n<title>Stub</title>\n</head>\n<body></body>\n</html>';
  const once = withNoindex(html);
  assert.match(once, /name="robots" content="noindex, nofollow"/);
  assert.equal(once.includes(NOINDEX_ROBOTS_META), true);
  const twice = withNoindex(once);
  assert.equal(twice.split('noindex').length, once.split('noindex').length);
});

test('asset budget stays under the Workers Free cap and rejects a translation-sized dist', () => {
  assert.equal(STATIC_ASSET_FILE_BUDGET, 10000);
  assert.ok(STATIC_ASSET_FILE_BUDGET < WORKERS_FREE_STATIC_ASSET_LIMIT);
  assert.doesNotThrow(() => assertWithinWorkersFreeAssetBudget(1200));
  assert.doesNotThrow(() => assertWithinWorkersFreeAssetBudget(STATIC_ASSET_FILE_BUDGET));
  assert.throws(() => assertWithinWorkersFreeAssetBudget(STATIC_ASSET_FILE_BUDGET + 1), /above the budget/);
  assert.throws(() => assertWithinWorkersFreeAssetBudget(18402), /Workers Free allows 20000/);
  assert.throws(
    () => assertWithinWorkersFreeAssetBudget(WORKERS_FREE_STATIC_ASSET_LIMIT),
    /above the budget/,
  );
});
