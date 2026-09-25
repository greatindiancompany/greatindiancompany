import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  assertSafeMarkdownWrite,
  assertSitemapOmitsGeneratedTranslations,
  defaultLanguageConfigPath,
  isGeneratedTranslationPath,
  languageSuffixOfSlug,
  loadLanguageCodes,
} from './publish-guard.mjs';

const ROOT = process.cwd();
const LANGUAGE_CODES = loadLanguageCodes(defaultLanguageConfigPath(ROOT));

const ENGLISH_BRIEF = `---
id: "gic-test"
lang: "en"
translationOf: null
title: "English brief"
description: "English brief"
slug: "credit-growth-what-changed-20260330-005"
publishDate: "2026-03-30"
updatedDate: "2026-03-30"
---
`;

test('languages.json codes are the template suffixes', () => {
  assert.equal(LANGUAGE_CODES.includes('hi'), true);
  assert.equal(LANGUAGE_CODES.includes('ur'), true);
  assert.equal(languageSuffixOfSlug('rbi-monetary-policy-risk-watch-20260330-071-hi', LANGUAGE_CODES), 'hi');
  assert.equal(languageSuffixOfSlug('credit-growth-what-changed-20260330-005', LANGUAGE_CODES), null);
  assert.equal(languageSuffixOfSlug('ports-and-shipping-state-wise-patterns-sat', LANGUAGE_CODES), 'sat');
});

test('generated-translations paths and non-English briefs are refused', () => {
  const templatePath = path.join(
    ROOT,
    'content-automation/generated-translations/hi/2026-03-30-rbi-monetary-policy-risk-watch-20260330-071-hi.md',
  );
  assert.equal(isGeneratedTranslationPath(templatePath), true);
  assert.throws(
    () => assertSafeMarkdownWrite(templatePath, ENGLISH_BRIEF, LANGUAGE_CODES),
    /cannot re-enter the site or the sitemap/,
  );

  const hindiCopy = path.join(ROOT, 'src/content/blog/hi/example.md');
  assert.throws(() => assertSafeMarkdownWrite(hindiCopy, ENGLISH_BRIEF, LANGUAGE_CODES), /src\/content\/blog\/en/);

  const copiedIntoEnglish = path.join(ROOT, 'src/content/blog/en/example-hi.md');
  const tagged = ENGLISH_BRIEF.replace('lang: "en"', 'lang: "hi"').replace(
    'slug: "credit-growth-what-changed-20260330-005"',
    'slug: "rbi-monetary-policy-risk-watch-20260330-071-hi"',
  );
  assert.throws(() => assertSafeMarkdownWrite(copiedIntoEnglish, tagged, LANGUAGE_CODES), /lang "hi"/);

  const suffixed = ENGLISH_BRIEF.replace(
    'slug: "credit-growth-what-changed-20260330-005"',
    'slug: "rbi-monetary-policy-risk-watch-20260330-071-hi"',
  );
  assert.throws(() => assertSafeMarkdownWrite(copiedIntoEnglish, suffixed, LANGUAGE_CODES), /-hi suffix/);

  assert.doesNotThrow(() =>
    assertSafeMarkdownWrite(path.join(ROOT, 'src/content/blog/en/example.md'), ENGLISH_BRIEF, LANGUAGE_CODES),
  );
});

test('sitemap URL lists cannot contain a generated-translation slug', () => {
  const blocked = new Set(['rbi-monetary-policy-risk-watch-20260330-071-hi']);
  assert.doesNotThrow(() =>
    assertSitemapOmitsGeneratedTranslations(
      ['https://greatindiancompany.com/', 'https://greatindiancompany.com/blog/credit-growth-what-changed-20260330-005'],
      blocked,
      LANGUAGE_CODES,
    ),
  );
  assert.throws(
    () =>
      assertSitemapOmitsGeneratedTranslations(
        ['https://greatindiancompany.com/blog/rbi-monetary-policy-risk-watch-20260330-071-hi'],
        blocked,
        LANGUAGE_CODES,
      ),
    /Refusing to write the sitemap/,
  );
  assert.throws(
    () =>
      assertSitemapOmitsGeneratedTranslations(
        ['https://greatindiancompany.com/blog/some-new-template-ur'],
        new Set(),
        LANGUAGE_CODES,
      ),
    /language-code suffix/,
  );
});

test('reviewed translation slugs can be indexed and other language suffixes cannot', () => {
  const reviewed = new Set([
    'healthcare-access-for-policy-teams-education-gov-20260330-753-hi',
    'healthcare-access-for-policy-teams-education-gov-20260330-753-ur',
  ]);
  assert.doesNotThrow(() =>
    assertSitemapOmitsGeneratedTranslations(
      [
        'https://greatindiancompany.com/blog/healthcare-access-for-policy-teams-education-gov-20260330-753-hi',
        'https://greatindiancompany.com/blog/healthcare-access-for-policy-teams-education-gov-20260330-753-ur',
      ],
      reviewed,
      LANGUAGE_CODES,
      reviewed,
    ),
  );
  assert.throws(
    () =>
      assertSitemapOmitsGeneratedTranslations(
        ['https://greatindiancompany.com/blog/some-new-template-bn'],
        new Set(),
        LANGUAGE_CODES,
        reviewed,
      ),
    /language-code suffix/,
  );
  assert.throws(
    () =>
      assertSitemapOmitsGeneratedTranslations(
        ['https://greatindiancompany.com/blog/rbi-monetary-policy-risk-watch-20260330-071-hi'],
        new Set(['rbi-monetary-policy-risk-watch-20260330-071-hi']),
        LANGUAGE_CODES,
        reviewed,
      ),
    /Refusing to write the sitemap/,
  );
});

test('content scripts and the sitemap call the guard', () => {
  const pipeline = readFileSync(path.join(ROOT, 'content-automation/scripts/run-content-pipeline.mjs'), 'utf8');
  const expansion = readFileSync(path.join(ROOT, 'content-automation/scripts/expand-to-800-diverse.mjs'), 'utf8');
  const sitemap = readFileSync(path.join(ROOT, 'scripts/generate-sitemap.mjs'), 'utf8');

  for (const source of [pipeline, expansion]) {
    assert.match(source, /writeEnglishBrief/);
    assert.doesNotMatch(source, /makeTranslationMarkdown/);
    assert.doesNotMatch(source, /generated-translations/);
  }

  assert.match(sitemap, /assertSitemapOmitsGeneratedTranslations/);

  const contentConfig = readFileSync(path.join(ROOT, 'src/content/config.ts'), 'utf8');
  const unusedConfig = readFileSync(path.join(ROOT, 'src/content.config.ts'), 'utf8');
  assert.match(contentConfig, /lang: z\.literal\('en'\)/);
  assert.match(contentConfig, /translationOf: z\.null\(\)/);
  assert.match(unusedConfig, /export \{ collections \} from '\.\/content\/config'/);
  assert.doesNotMatch(unusedConfig, /z\.string\(\)/);
});
