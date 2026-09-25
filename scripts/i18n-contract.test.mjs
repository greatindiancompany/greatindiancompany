import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { chromeFor, englishChromeFallbackCodes } from '../src/lib/i18n-chrome.mjs';
import {
  assessReviewedTranslation,
  hreflangAlternates,
  languageSwitchLinks,
  reviewedSitemapDecision,
} from '../src/lib/i18n-contract.mjs';
import { pageLanguage, scheduledLanguages } from '../src/lib/i18n-languages.mjs';
import { STATIC_ASSET_FILE_BUDGET } from './localization-policy.mjs';

const ROOT = process.cwd();
const SITE = 'https://greatindiancompany.com';
const languages = scheduledLanguages();
const codes = languages.map((language) => language.code);

const english = {
  id: 'gic-20260330-753',
  slug: 'healthcare-access-for-policy-teams-education-gov-20260330-753',
  basename: '2026-03-30-healthcare-access-for-policy-teams-education-gov-20260330-753',
  draft: false,
};

function reviewed(lang, overrides = {}) {
  return {
    lang,
    folder: lang,
    filename: `${english.basename}-${lang}.md`,
    id: `${english.id}-${lang}`,
    slug: `${english.slug}-${lang}`,
    translationOf: english.id,
    draft: 'false',
    publishDate: '2026-03-30',
    ...overrides,
  };
}

test('the registry follows languages.json for all 22 codes', () => {
  const fromDisk = JSON.parse(
    readFileSync(path.join(ROOT, 'content-automation/config/languages.json'), 'utf8'),
  );
  assert.deepEqual(
    codes,
    fromDisk.map((entry) => entry.code),
  );
  assert.equal(codes.length, 22);
  assert.deepEqual(
    codes.filter((code) => pageLanguage(code).dir === 'rtl').sort(),
    ['ks', 'sd', 'ur'],
  );

  for (const language of languages) {
    assert.equal(language.hreflang, language.code);
    assert.equal(pageLanguage(language.code).dir, language.dir);
    assert.ok(language.fontFamilies.length > 0);
    assert.match(language.fontStylesheet, /^https:\/\/fonts\.googleapis\.com\/css2/);
    assert.equal(language.fontStylesheet.includes('family=Noto'), true);
  }

  assert.deepEqual(pageLanguage('hi').fontFamilies, ['Noto Sans Devanagari', 'Noto Serif Devanagari']);
  assert.equal(pageLanguage('hi').fontStylesheet.includes('Noto+Sans+Tamil'), false);
  assert.deepEqual(pageLanguage('ur').fontFamilies, ['Noto Nastaliq Urdu', 'Noto Naskh Arabic']);
  assert.deepEqual(pageLanguage('ks').fontFamilies, pageLanguage('ur').fontFamilies);
  assert.deepEqual(pageLanguage('sd').fontFamilies, pageLanguage('ur').fontFamilies);
  assert.deepEqual(pageLanguage('sat').fontFamilies, ['Noto Sans Ol Chiki']);
  assert.equal(pageLanguage('bn').script, 'Bengali');
  assert.equal(pageLanguage('mni').script, 'Bengali');
  assert.equal(pageLanguage('pa').script, 'Gurmukhi');
  assert.equal(pageLanguage('or').script, 'Oriya');
  assert.equal(pageLanguage('en').dir, 'ltr');
  assert.equal(pageLanguage('en').fontStylesheet, null);

  const strong = languages.filter((language) => language.quality === 'strong').map((language) => language.code);
  const weak = languages.filter((language) => language.quality === 'weak').map((language) => language.code);
  assert.deepEqual(strong.sort(), ['as', 'bn', 'gu', 'hi', 'kn', 'ml', 'mr', 'ne', 'or', 'pa', 'ta', 'te', 'ur']);
  assert.deepEqual(weak.sort(), ['brx', 'doi', 'kok', 'ks', 'mai', 'mni', 'sa', 'sat', 'sd']);
  assert.equal(STATIC_ASSET_FILE_BUDGET, 10000);
});

test('weak languages use English chrome and strong languages do not', () => {
  const fallback = englishChromeFallbackCodes();
  assert.deepEqual(
    fallback.sort(),
    languages
      .filter((language) => language.quality === 'weak')
      .map((language) => language.code)
      .sort(),
  );
  assert.equal(chromeFor('en').fallback, false);
  assert.equal(chromeFor('en').eyebrow, 'English template');
  assert.equal(chromeFor('sat').fallback, true);
  assert.equal(chromeFor('ks').fallback, true);
  assert.match(chromeFor('sat').machineNote, /machine-assisted translation/i);
  assert.equal(chromeFor('hi').fallback, false);
  assert.match(chromeFor('hi').machineNote, /मशीनी सहायता/);
  assert.match(chromeFor('ur').machineNote, /مشینی مدد/);
  assert.equal(chromeFor('ta').machineNote.includes('machine-assisted'), false);
});

test('naming refusals keep wrong lang, unknown codes, and wrong suffixes out', () => {
  const wrongLang = assessReviewedTranslation(reviewed('ur', { folder: 'hi' }), { english });
  assert.equal(wrongLang.ok, false);
  assert.match(wrongLang.errors.join(' '), /does not match folder/);

  const unknown = assessReviewedTranslation(reviewed('zz'), { english: null });
  assert.equal(unknown.ok, false);
  assert.match(unknown.errors.join(' '), /Unknown language code "zz"/);

  const wrongSuffix = assessReviewedTranslation(reviewed('hi', { slug: `${english.slug}-ur` }), { english: null });
  assert.equal(wrongSuffix.ok, false);
  assert.match(wrongSuffix.errors.join(' '), /Slug must end in -hi/);

  const taVersusSat = assessReviewedTranslation(
    reviewed('ta', {
      slug: 'note-sat',
      id: 'gic-note-ta',
      translationOf: 'gic-note',
      filename: 'note-ta.md',
    }),
    { english: null },
  );
  assert.equal(taVersusSat.ok, false);
  assert.match(taVersusSat.errors.join(' '), /Slug must end in -ta/);

  const wrongFile = assessReviewedTranslation(reviewed('hi', { filename: 'other-hi.md' }), { english });
  assert.equal(wrongFile.ok, false);
  assert.match(wrongFile.errors.join(' '), /Filename must be/);

  const wrongId = assessReviewedTranslation(reviewed('hi', { id: 'gic-20260330-753-ur' }), { english: null });
  assert.equal(wrongId.ok, false);
  assert.match(wrongId.errors.join(' '), /id must be/);
});

test('a missing English source warns and skips hreflang pairing', () => {
  const missing = assessReviewedTranslation(reviewed('ur'), { english: null });
  assert.equal(missing.ok, true);
  assert.equal(missing.pairHreflang, false);
  assert.match(missing.warnings.join(' '), /absent on this branch/);

  const present = assessReviewedTranslation(reviewed('hi'), { english });
  assert.equal(present.ok, true);
  assert.equal(present.pairHreflang, true);
  assert.deepEqual(present.warnings, []);
});

test('hreflang lists only languages that exist for the English id', () => {
  const translations = [
    { code: 'hi', slug: `${english.slug}-hi` },
    { code: 'ur', slug: `${english.slug}-ur` },
  ];
  const alternates = hreflangAlternates({
    english: { slug: english.slug },
    translations,
    siteUrl: SITE,
  });
  assert.deepEqual(
    alternates.map((link) => link.hreflang),
    ['en', 'hi', 'ur', 'x-default'],
  );
  assert.equal(alternates[0].href, `${SITE}/blog/${english.slug}`);
  assert.equal(alternates.at(-1).href, `${SITE}/blog/${english.slug}`);
  assert.equal(alternates.some((link) => link.hreflang === 'bn'), false);

  assert.deepEqual(hreflangAlternates({ english: { slug: english.slug }, translations: [], siteUrl: SITE }), []);
  assert.deepEqual(hreflangAlternates({ english: null, translations, siteUrl: SITE }), []);

  const links = languageSwitchLinks({
    currentCode: 'hi',
    english: { slug: english.slug },
    translations: [
      { code: 'hi', slug: `${english.slug}-hi`, nativeName: 'हिन्दी', dir: 'ltr' },
      { code: 'ur', slug: `${english.slug}-ur`, nativeName: 'اردو', dir: 'rtl' },
    ],
  });
  assert.deepEqual(
    links.map((link) => link.code),
    ['en', 'ur'],
  );
  assert.equal(links[1].dir, 'rtl');
});

test('the sitemap includes reviewed translations and still drops stubs and drafts', async () => {
  const built = new Set([`/blog/${english.slug}-hi`, `/blog/${english.slug}-ur`]);
  const hindi = await reviewedSitemapDecision(reviewed('hi'), {
    english,
    today: '2026-09-25',
    pageExists: (urlPath) => built.has(urlPath),
  });
  const urdu = await reviewedSitemapDecision(reviewed('ur'), {
    english,
    today: '2026-09-25',
    pageExists: (urlPath) => built.has(urlPath),
  });
  const draft = await reviewedSitemapDecision(reviewed('bn', { draft: 'true' }), {
    english,
    today: '2026-09-25',
    pageExists: () => true,
  });
  const future = await reviewedSitemapDecision(reviewed('ta', { publishDate: '2026-12-01' }), {
    english,
    today: '2026-09-25',
    pageExists: () => true,
  });
  const missingPage = await reviewedSitemapDecision(reviewed('ml'), {
    english,
    today: '2026-09-25',
    pageExists: () => false,
  });
  const absentEnglish = await reviewedSitemapDecision(reviewed('ur', {
    translationOf: 'gic-not-on-branch',
    id: 'gic-not-on-branch-ur',
    slug: 'missing-english-source-ur',
    filename: 'missing-english-source-ur.md',
  }), {
    english: null,
    today: '2026-09-25',
    pageExists: () => true,
  });

  assert.equal(hindi.include, true);
  assert.equal(urdu.include, true);
  assert.equal(urdu.assessment.pairHreflang, true);
  assert.equal(draft.include, false);
  assert.equal(draft.assessment.ok, true);
  assert.equal(future.include, false);
  assert.equal(missingPage.include, false);
  assert.equal(absentEnglish.include, true);
  assert.equal(absentEnglish.assessment.pairHreflang, false);
  assert.match(absentEnglish.assessment.warnings.join(' '), /absent on this branch/);

  const sitemap = readFileSync(path.join(ROOT, 'scripts/generate-sitemap.mjs'), 'utf8');
  assert.match(sitemap, /reviewedSitemapDecision/);
  assert.match(sitemap, /reviewedSlugs/);
  assert.match(sitemap, /stubOnlySlugs/);
  assert.match(sitemap, /isScheduledLanguage/);
  const schema = readFileSync(path.join(ROOT, 'src/content/config.ts'), 'utf8');
  assert.match(schema, /lang: z\.literal\('en'\)/);
  assert.match(schema, /translationOf: z\.null\(\)/);
  assert.match(schema, /z\.enum\(scheduledLanguageCodes\)/);
  assert.match(schema, /translationOf: z\.string\(\)\.min\(1\)/);
});
