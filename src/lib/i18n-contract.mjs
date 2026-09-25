/**
 * Naming contract for reviewed translations under src/content/blog/<lang>/.
 *
 * A translation whose English source is not on this branch is still rendered.
 * The build warns and skips hreflang pairing. Wrong lang, an unknown language
 * code, or a wrong slug suffix is refused.
 */
import { languageSuffixOfSlug } from '../../content-automation/scripts/publish-guard.mjs';
import { isScheduledLanguage, scheduledLanguageCodes } from './i18n-languages.mjs';
import { normalizeLastmod } from '../../scripts/sitemap-honesty.mjs';

function orderedCodes(languageCodes) {
  return [...languageCodes].sort((left, right) => right.length - left.length);
}

export function assessReviewedTranslation(entry, { english = null, languageCodes = scheduledLanguageCodes() } = {}) {
  const errors = [];
  const warnings = [];
  const lang = entry?.lang;
  const folder = entry?.folder;
  const filename = entry?.filename;
  const id = entry?.id;
  const slug = entry?.slug;
  const translationOf = entry?.translationOf;
  const codes = orderedCodes(languageCodes);

  if (typeof lang !== 'string' || !codes.includes(lang) || !isScheduledLanguage(lang)) {
    errors.push(`Unknown language code "${lang ?? ''}".`);
  } else if (folder !== lang) {
    errors.push(`lang "${lang}" does not match folder "${folder ?? ''}".`);
  }

  if (folder && !codes.includes(folder) && folder !== lang) {
    errors.push(`Unknown language code "${folder}".`);
  }

  const translationId =
    typeof translationOf === 'string' && translationOf.trim() !== '' && translationOf !== 'null'
      ? translationOf
      : null;
  if (!translationId) {
    errors.push('translationOf must be a non-empty English id.');
  }

  const suffix = languageSuffixOfSlug(typeof slug === 'string' ? slug : '', codes);
  if (suffix !== lang) {
    errors.push(`Slug must end in -${lang ?? ''}.`);
  }

  if (translationId && id !== `${translationId}-${lang}`) {
    errors.push(`id must be "${translationId}-${lang}".`);
  }

  if (typeof filename !== 'string' || !filename.endsWith(`-${lang}.md`)) {
    errors.push(`Filename must end in -${lang ?? ''}.md.`);
  }

  if (english) {
    if (translationOf !== english.id) {
      errors.push(`translationOf "${translationOf ?? ''}" does not match English id "${english.id}".`);
    }
    if (slug !== `${english.slug}-${lang}`) {
      errors.push(`Slug must be "${english.slug}-${lang}".`);
    }
    const expectedFilename = `${english.basename}-${lang}.md`;
    if (filename !== expectedFilename) {
      errors.push(`Filename must be "${expectedFilename}".`);
    }
  } else if (errors.length === 0) {
    warnings.push(`English source "${translationId}" is absent on this branch; skipping hreflang pairing.`);
  }

  const pairHreflang = errors.length === 0 && Boolean(english) && english.draft !== true;
  if (errors.length === 0 && english?.draft === true) {
    warnings.push(`English source "${translationId}" is a draft; skipping hreflang pairing.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    pairHreflang,
  };
}

export async function reviewedSitemapDecision(
  entry,
  { english = null, today = null, pageExists = null, languageCodes = scheduledLanguageCodes() } = {},
) {
  const assessment = assessReviewedTranslation(entry, { english, languageCodes });
  if (!assessment.ok) {
    return { include: false, assessment };
  }

  if (entry.draft === true || entry.draft === 'true') {
    return { include: false, assessment };
  }

  const publishedOn = normalizeLastmod(entry.publishDate);
  if (publishedOn && today && publishedOn > today) {
    return { include: false, assessment };
  }

  if (typeof pageExists === 'function' && !(await pageExists(`/blog/${entry.slug}`))) {
    return { include: false, assessment };
  }

  return { include: true, assessment };
}

export function hreflangAlternates({ english = null, translations = [], siteUrl }) {
  const published = translations.filter((entry) => entry?.code && entry?.slug);
  if (!english?.slug || published.length === 0) {
    return [];
  }

  const englishHref = `${siteUrl}/blog/${english.slug}`;
  return [
    { hreflang: 'en', href: englishHref },
    ...published.map((entry) => ({
      hreflang: entry.code,
      href: `${siteUrl}/blog/${entry.slug}`,
    })),
    { hreflang: 'x-default', href: englishHref },
  ];
}

export function languageSwitchLinks({ currentCode, english = null, translations = [] }) {
  const links = [];
  if (english?.slug && currentCode !== 'en') {
    links.push({
      code: 'en',
      hreflang: 'en',
      dir: 'ltr',
      slug: english.slug,
      label: 'English',
    });
  }

  for (const entry of translations) {
    if (!entry?.code || !entry?.slug || entry.code === currentCode) {
      continue;
    }
    links.push({
      code: entry.code,
      hreflang: entry.code,
      dir: entry.dir === 'rtl' ? 'rtl' : 'ltr',
      slug: entry.slug,
      label: entry.nativeName || entry.code,
    });
  }

  return links;
}
