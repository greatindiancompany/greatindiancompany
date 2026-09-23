/**
 * Publishing rules for language-tagged markdown.
 *
 * Files under content-automation/generated-translations/ prefix an English
 * template with a language name. The body stays English. Emitting an HTML
 * page per file would claim a language the text is not in, and would put
 * dist near the Workers Free static-asset cap (20,000 files per version).
 *
 * A page is publishable only when both are true:
 * 1. Its slug is listed in PUBLISHABLE_LOCALIZATION_SLUGS.
 * 2. Frontmatter opts in with localized: true, lang is not English, the
 *    article is not a draft, and the body is not an English stub.
 */

export const WORKERS_FREE_STATIC_ASSET_LIMIT = 20000;

/**
 * Fail the build well below the Free cap so one content run cannot deploy
 * thousands of extra HTML files. Paid Workers allow 100,000 files; do not
 * raise this budget until that plan is confirmed.
 */
export const STATIC_ASSET_FILE_BUDGET = 10000;

/** Slugs of articles whose body is actually written in `lang`. Empty on purpose. */
export const PUBLISHABLE_LOCALIZATION_SLUGS = Object.freeze([]);

const RTL_LANGS = new Set(['ur', 'ks', 'sd', 'ar', 'fa', 'he']);

const ENGLISH_STUB_MARKERS = [
  'preserves the meaning',
  'Localized Summary',
  'Localized Brief',
  'regional discovery',
  'English master',
];

export function textDirection(lang) {
  return RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
}

export function isPublishableLocalization({ lang, localized, draft, body }) {
  if (String(localized) !== 'true') {
    return false;
  }

  if (typeof lang !== 'string' || lang.length === 0 || lang === 'en' || lang === 'unknown') {
    return false;
  }

  if (String(draft) === 'true') {
    return false;
  }

  const text = typeof body === 'string' ? body : '';
  if (ENGLISH_STUB_MARKERS.some((marker) => text.includes(marker))) {
    return false;
  }

  return true;
}

export function assertWithinWorkersFreeAssetBudget(fileCount) {
  if (!Number.isInteger(fileCount) || fileCount < 0) {
    throw new Error(`Asset file count must be a non-negative integer. Received ${fileCount}.`);
  }

  if (fileCount > STATIC_ASSET_FILE_BUDGET || fileCount > WORKERS_FREE_STATIC_ASSET_LIMIT) {
    throw new Error(
      `Refusing to finish the build: dist contains ${fileCount} files, above the budget of ${STATIC_ASSET_FILE_BUDGET}. Workers Free allows ${WORKERS_FREE_STATIC_ASSET_LIMIT} static assets per Worker version. Language-tagged English templates must stay out of dist. Confirm a paid Workers plan before raising STATIC_ASSET_FILE_BUDGET.`,
    );
  }
}
