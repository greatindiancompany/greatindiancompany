import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import {
  assertMasterAppendAllowed,
  assertSafeMarkdownWrite,
  assertSitemapOmitsGeneratedTranslations,
  CANONICAL_DBIE_URL,
  contentWriteAllowed,
  defaultLanguageConfigPath,
  isGeneratedTranslationPath,
  languageSuffixOfSlug,
  loadLanguageCodes,
  MASTER_COUNT_CAP,
  rollbackWrittenBriefs,
  selectAlignedSourceLinks,
  writeEnglishBrief,
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

test('content scripts and the sitemap call the guard', () => {
  const pipeline = readFileSync(path.join(ROOT, 'content-automation/scripts/run-content-pipeline.mjs'), 'utf8');
  const expansion = readFileSync(path.join(ROOT, 'content-automation/scripts/expand-to-800-diverse.mjs'), 'utf8');
  const sitemap = readFileSync(path.join(ROOT, 'scripts/generate-sitemap.mjs'), 'utf8');

  for (const source of [pipeline, expansion]) {
    assert.match(source, /writeEnglishBrief/);
    assert.doesNotMatch(source, /makeTranslationMarkdown/);
    assert.doesNotMatch(source, /generated-translations/);
  }

  assert.match(pipeline, /classifyMasterAppend/);
  assert.match(pipeline, /selectAlignedSourceLinks/);
  assert.doesNotMatch(pipeline, /masters\.length \* 2/);
  assert.match(expansion, /selectAlignedSourceLinks/);
  assert.doesNotMatch(expansion, /gov\[i % gov\.length\]/);

  assert.match(sitemap, /assertSitemapOmitsGeneratedTranslations/);

  const contentConfig = readFileSync(path.join(ROOT, 'src/content/config.ts'), 'utf8');
  const unusedConfig = readFileSync(path.join(ROOT, 'src/content.config.ts'), 'utf8');
  assert.match(contentConfig, /lang: z\.literal\('en'\)/);
  assert.match(contentConfig, /translationOf: z\.null\(\)/);
  assert.match(unusedConfig, /export \{ collections \} from '\.\/content\/config'/);
  assert.doesNotMatch(unusedConfig, /z\.string\(\)/);
});

test('appending English masters requires ALLOW_CONTENT_WRITE and stays within the ceiling', () => {
  assert.equal(MASTER_COUNT_CAP, 800);
  assert.equal(contentWriteAllowed({ ALLOW_CONTENT_WRITE: '1' }), true);
  assert.equal(contentWriteAllowed({}), false);
  assert.throws(
    () => assertMasterAppendAllowed({ existingCount: 800, additional: 1, allowWrite: false }),
    /ALLOW_CONTENT_WRITE=1/,
  );
  assert.throws(
    () => assertMasterAppendAllowed({ existingCount: 900, additional: 1, allowWrite: false }),
    /ceiling is 900/,
  );
  const allowed = assertMasterAppendAllowed({ existingCount: 800, additional: 1, allowWrite: true });
  assert.equal(allowed.action, 'commit');
});

test('source links follow the topic and keep DBIE.aspx', async () => {
  const registry = JSON.parse(
    readFileSync(path.join(ROOT, 'content-automation/config/source_registry.json'), 'utf8'),
  );
  assert.equal(registry.includes(CANONICAL_DBIE_URL), true);
  assert.equal(registry.some((url) => /DBIE\.spx/i.test(url)), false);

  const rotated = [registry[0], registry[1]];
  const selected = selectAlignedSourceLinks('credit-growth', [
    'https://www.mohfw.gov.in/',
    'https://www.rbi.org.in/Scripts/NotificationUser.aspx',
    'https://www.rbi.org.in/Scripts/DBIE.spx',
  ]);
  assert.deepEqual(selected, [CANONICAL_DBIE_URL]);
  assert.equal(selected.includes(rotated[0]), false);

  const pharma = selectAlignedSourceLinks('pharma-and-biotech', [
    'https://www.mnre.gov.in/',
    'https://www.mohfw.gov.in/',
  ]);
  assert.deepEqual(pharma, ['https://www.mohfw.gov.in/']);
});

test('writeEnglishBrief refuses without opt-in and rolls back a committed file', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gic-brief-'));
  const filePath = path.join(dir, 'src/content/blog/en/credit-growth-what-changed-guard.md');
  const fs = {
    async writeFile(target, body) {
      const { mkdir, writeFile } = await import('node:fs/promises');
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body, 'utf8');
    },
    async rm(target, options) {
      await rm(target, options);
    },
  };

  await assert.rejects(
    () => writeEnglishBrief(fs, filePath, ENGLISH_BRIEF, LANGUAGE_CODES, { allowWrite: false }),
    /ALLOW_CONTENT_WRITE=1/,
  );

  await writeEnglishBrief(fs, filePath, ENGLISH_BRIEF, LANGUAGE_CODES, { allowWrite: true });
  const body = await readFile(filePath, 'utf8');
  assert.match(body, /lang: "en"/);
  await rollbackWrittenBriefs(fs, [filePath]);
  await assert.rejects(() => readFile(filePath, 'utf8'));
  await rm(dir, { recursive: true, force: true });
});
