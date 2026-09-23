import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  assertWithinWorkersFreeAssetBudget,
  isPublishableLocalization,
  PUBLISHABLE_LOCALIZATION_SLUGS,
  STATIC_ASSET_FILE_BUDGET,
  textDirection,
  WORKERS_FREE_STATIC_ASSET_LIMIT,
} from './localization-policy.mjs';

const HINDI_STUB = path.join(
  process.cwd(),
  'content-automation/generated-translations/hi/2026-03-30-rbi-monetary-policy-risk-watch-20260330-071-hi.md',
);

function bodyOf(raw) {
  const match = raw.match(/^---\n[\s\S]*?\n---\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

test('language-tagged English templates are not publishable localizations', () => {
  const raw = readFileSync(HINDI_STUB, 'utf8');
  const body = bodyOf(raw);

  assert.equal(raw.includes('lang: "hi"'), true);
  assert.equal(body.includes('preserves the meaning'), true);
  assert.equal(
    isPublishableLocalization({ lang: 'hi', localized: 'true', draft: 'false', body }),
    false,
  );
  assert.equal(
    isPublishableLocalization({ lang: 'hi', localized: 'false', draft: 'false', body }),
    false,
  );
});

test('a real non-English article can pass the text check', () => {
  assert.equal(
    isPublishableLocalization({
      lang: 'hi',
      localized: 'true',
      draft: 'false',
      body: 'भारतीय रिज़र्व बैंक ने नीतिगत दर में बदलाव किया। यह सारांश हिंदी में लिखा गया है।',
    }),
    true,
  );
});

test('English, drafts, and missing opt-in stay unpublished', () => {
  const body = 'यह लेख हिंदी में है और किसी टेम्पलेट वाक्य का उपयोग नहीं करता।';

  assert.equal(isPublishableLocalization({ lang: 'en', localized: 'true', draft: 'false', body }), false);
  assert.equal(isPublishableLocalization({ lang: 'hi', localized: 'true', draft: 'true', body }), false);
  assert.equal(isPublishableLocalization({ lang: 'hi', localized: 'false', draft: 'false', body }), false);
  assert.equal(isPublishableLocalization({ lang: '', localized: 'true', draft: 'false', body }), false);
});

test('no localization slug is approved for publishing', () => {
  assert.equal(PUBLISHABLE_LOCALIZATION_SLUGS.length, 0);
});

test('text direction follows the language code', () => {
  assert.equal(textDirection('ur'), 'rtl');
  assert.equal(textDirection('ks'), 'rtl');
  assert.equal(textDirection('sd'), 'rtl');
  assert.equal(textDirection('hi'), 'ltr');
  assert.equal(textDirection('en'), 'ltr');
});

test('asset budget stays under the Workers Free cap and rejects a translation-sized dist', () => {
  assert.ok(STATIC_ASSET_FILE_BUDGET < WORKERS_FREE_STATIC_ASSET_LIMIT);
  assert.doesNotThrow(() => assertWithinWorkersFreeAssetBudget(1200));
  assert.doesNotThrow(() => assertWithinWorkersFreeAssetBudget(STATIC_ASSET_FILE_BUDGET));
  assert.throws(() => assertWithinWorkersFreeAssetBudget(STATIC_ASSET_FILE_BUDGET + 1), /above the budget/);
  assert.throws(
    () => assertWithinWorkersFreeAssetBudget(18402),
    /Workers Free allows 20000/,
  );
  assert.throws(
    () => assertWithinWorkersFreeAssetBudget(WORKERS_FREE_STATIC_ASSET_LIMIT),
    /above the budget/,
  );
});
