/**
 * Language-tagged files under content-automation/generated-translations/ are
 * English templates. Content scripts must not write them, and the sitemap
 * must fail if one of those URLs is about to be published.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}$/;

export function normalizePath(filePath) {
  return String(filePath).replaceAll('\\', '/');
}

export function isGeneratedTranslationPath(filePath) {
  const normalized = normalizePath(filePath);
  return (
    normalized.includes('/content-automation/generated-translations/') ||
    normalized.endsWith('/content-automation/generated-translations')
  );
}

export function loadLanguageCodes(configPath) {
  const languages = JSON.parse(readFileSync(configPath, 'utf8'));
  if (!Array.isArray(languages) || languages.length === 0) {
    throw new Error(`${configPath} must list the template language codes.`);
  }

  const codes = languages.map((entry) => {
    if (!entry || typeof entry.code !== 'string' || !LANGUAGE_CODE_PATTERN.test(entry.code)) {
      throw new Error(`${configPath} has an invalid language code.`);
    }
    return entry.code;
  });

  return codes.sort((a, b) => b.length - a.length);
}

export function languageSuffixOfSlug(slug, languageCodes) {
  if (typeof slug !== 'string' || slug.length === 0) {
    return null;
  }

  for (const code of languageCodes) {
    if (slug.endsWith(`-${code}`)) {
      return code;
    }
  }

  return null;
}

export function blogSlugFromLoc(loc) {
  let pathname = loc;
  try {
    pathname = new URL(loc).pathname;
  } catch {
    return null;
  }

  if (!pathname.startsWith('/blog/')) {
    return null;
  }

  const slug = pathname.slice('/blog/'.length).replace(/\/$/, '');
  if (!slug || slug.includes('/')) {
    return null;
  }

  return slug;
}

function frontmatterField(markdown, key) {
  const match = String(markdown).match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!match) {
    return null;
  }

  return match[1].trim().replace(/^"|"$/g, '');
}

export function assertSafeMarkdownWrite(filePath, markdown, languageCodes) {
  const normalized = normalizePath(filePath);

  if (isGeneratedTranslationPath(normalized)) {
    throw new Error(
      `Refusing to write ${filePath}. Files under content-automation/generated-translations are English templates and cannot re-enter the site or the sitemap.`,
    );
  }

  if (!normalized.includes('/src/content/blog/en/')) {
    throw new Error(`Refusing to write ${filePath}. Published briefs belong in src/content/blog/en/.`);
  }

  const lang = frontmatterField(markdown, 'lang');
  if (lang !== 'en') {
    throw new Error(
      `Refusing to write ${filePath} with lang "${lang ?? ''}". Published briefs are English. A language tag does not make the body a translation.`,
    );
  }

  const translationOf = frontmatterField(markdown, 'translationOf');
  if (translationOf !== 'null') {
    throw new Error(`Refusing to write ${filePath}. Published briefs must set translationOf: null.`);
  }

  const slug = frontmatterField(markdown, 'slug');
  if (!slug) {
    throw new Error(`Refusing to write ${filePath}. Published briefs need a slug.`);
  }

  const suffix = languageSuffixOfSlug(slug, languageCodes);
  if (suffix) {
    throw new Error(
      `Refusing slug "${slug}". The -${suffix} suffix is reserved for unpublished language templates and must not be indexed.`,
    );
  }
}

export async function writeEnglishBrief(fs, filePath, markdown, languageCodes) {
  assertSafeMarkdownWrite(filePath, markdown, languageCodes);
  await fs.writeFile(filePath, markdown, 'utf8');
}

export function assertSitemapOmitsGeneratedTranslations(locs, blockedSlugs, languageCodes) {
  const blocked = blockedSlugs instanceof Set ? blockedSlugs : new Set(blockedSlugs);
  const leaks = [];

  for (const loc of locs) {
    const slug = blogSlugFromLoc(loc);
    if (!slug) {
      continue;
    }

    if (blocked.has(slug) || languageSuffixOfSlug(slug, languageCodes)) {
      leaks.push(loc);
    }
  }

  if (leaks.length > 0) {
    throw new Error(
      `Refusing to write the sitemap: ${leaks.length} URL(s) match content-automation/generated-translations or a language-code suffix. First: ${leaks[0]}`,
    );
  }
}

export function defaultLanguageConfigPath(root = process.cwd()) {
  return path.join(root, 'content-automation', 'config', 'languages.json');
}
