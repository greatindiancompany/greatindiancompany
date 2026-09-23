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

/** English masters already published. Growth past this count needs an explicit opt-in. */
export const MASTER_COUNT_CAP = 800;

export const CANONICAL_DBIE_URL = 'https://www.rbi.org.in/Scripts/DBIE.aspx';

export function contentWriteAllowed(env = process.env) {
  return env.ALLOW_CONTENT_WRITE === '1';
}

export function classifyMasterAppend({
  existingCount,
  additional,
  allowWrite = false,
  cap = MASTER_COUNT_CAP,
}) {
  if (!Number.isInteger(existingCount) || existingCount < 0) {
    throw new Error(`Existing master count must be a non-negative integer. Received ${existingCount}.`);
  }
  if (!Number.isInteger(additional) || additional < 0) {
    throw new Error(`Additional master count must be a non-negative integer. Received ${additional}.`);
  }

  const ceiling = Math.max(cap, existingCount);
  const next = existingCount + additional;

  if (additional === 0) {
    return { action: 'noop', ceiling, next };
  }

  if (!allowWrite) {
    return { action: 'dry-run', ceiling, next };
  }

  return { action: 'commit', ceiling, next };
}

export function assertMasterAppendAllowed(args) {
  const decision = classifyMasterAppend(args);
  if (decision.action === 'dry-run') {
    throw new Error(
      `Refusing to add ${args.additional} English masters without ALLOW_CONTENT_WRITE=1. Existing count is ${args.existingCount}; ceiling is ${decision.ceiling}; result would be ${decision.next}.`,
    );
  }
  return decision;
}

export async function writeEnglishBrief(fs, filePath, markdown, languageCodes, options = {}) {
  assertSafeMarkdownWrite(filePath, markdown, languageCodes);
  const allowWrite = options.allowWrite ?? contentWriteAllowed(options.env);
  if (!allowWrite) {
    throw new Error(
      `Refusing to write ${filePath} without ALLOW_CONTENT_WRITE=1. Existing English masters are left unchanged.`,
    );
  }
  await fs.writeFile(filePath, markdown, 'utf8');
}

export async function rollbackWrittenBriefs(fs, filePaths) {
  for (const filePath of filePaths) {
    await fs.rm(filePath, { force: true });
  }
}

/**
 * Hosts, and path tokens where one host covers many series, that match a topic.
 * Registry entries that fail this check are omitted. Selection does not rotate by article index.
 */
const TOPIC_ALIGNMENT = {
  'rbi-monetary-policy': {
    hosts: ['rbi.org.in'],
    paths: ['monetarypolicy', 'annualreportmaindisplay', 'bs_speechesview', 'publicationsview'],
  },
  'rbi-liquidity': {
    hosts: ['rbi.org.in'],
    paths: ['bs_viewcontent', 'notificationuser', 'dbie.aspx'],
  },
  'banking-regulation': {
    hosts: ['rbi.org.in'],
    paths: ['notificationuser', 'bs_pressreleasedisplay'],
  },
  'inflation-trends': {
    hosts: ['rbi.org.in', 'mospi.gov.in'],
    paths: ['dbie.aspx', 'monetarypolicy', 'mospi.gov.in'],
  },
  'credit-growth': {
    hosts: ['rbi.org.in'],
    paths: ['dbie.aspx'],
  },
  'digital-payments': {
    hosts: ['rbi.org.in', 'meity.gov.in', 'digitalindia.gov.in'],
    paths: ['dbie.aspx', 'meity.gov.in', 'digitalindia.gov.in'],
  },
  'financial-inclusion': {
    hosts: ['rbi.org.in', 'nabard.org', 'sidbi.in'],
    paths: ['dbie.aspx', 'nabard.org', 'sidbi.in'],
  },
  'state-finance': {
    hosts: ['rbi.org.in', 'mof.gov.in', 'indiabudget.gov.in', 'dea.gov.in'],
    paths: ['statefinances', 'mof.gov.in', 'indiabudget.gov.in', 'dea.gov.in'],
  },
  'trade-and-fx': {
    hosts: ['rbi.org.in', 'commerce.gov.in'],
    paths: ['dbie.aspx', 'commerce.gov.in'],
  },
  'employment-and-skills': {
    hosts: ['rbi.org.in', 'mospi.gov.in', 'nsdcindia.org', 'skillindiadigital.gov.in'],
    paths: ['dbie.aspx', 'mospi.gov.in', 'nsdcindia.org', 'skillindiadigital.gov.in'],
  },
  'manufacturing-industrial-policy': { hosts: ['dpiit.gov.in', 'makeinindia.com', 'commerce.gov.in'] },
  'energy-transition': { hosts: ['mnre.gov.in', 'powermin.gov.in', 'moef.gov.in'] },
  'green-hydrogen': { hosts: ['mnre.gov.in', 'powermin.gov.in', 'moef.gov.in'] },
  'solar-and-storage': { hosts: ['mnre.gov.in', 'powermin.gov.in'] },
  'logistics-and-freight': { hosts: ['morth.nic.in', 'commerce.gov.in'] },
  'ports-and-shipping': { hosts: ['shipmin.gov.in'] },
  'aviation-and-tourism': { hosts: ['civilaviation.gov.in'] },
  'rail-and-transit': { hosts: ['railministry.gov.in', 'morth.nic.in'] },
  'digital-public-infrastructure': { hosts: ['meity.gov.in', 'digitalindia.gov.in', 'dpiit.gov.in'] },
  'ai-and-data-governance': { hosts: ['meity.gov.in'] },
  'cybersecurity-resilience': { hosts: ['meity.gov.in', 'mha.gov.in'] },
  'telecom-broadband': { hosts: ['dot.gov.in', 'trai.gov.in', 'meity.gov.in'] },
  'healthcare-access': { hosts: ['mohfw.gov.in'] },
  'pharma-and-biotech': { hosts: ['mohfw.gov.in'] },
  'education-and-skilling': { hosts: ['education.gov.in', 'nsdcindia.org', 'skillindiadigital.gov.in'] },
  'future-of-work': { hosts: ['education.gov.in', 'nsdcindia.org', 'skillindiadigital.gov.in'] },
  'agri-value-chains': { hosts: ['nabard.org'] },
  'food-processing': { hosts: ['mofpi.gov.in'] },
  'water-and-sanitation': { hosts: ['jalshakti-dowr.gov.in'] },
  'urbanization-and-housing': { hosts: ['smartcities.gov.in'] },
  'real-estate-and-construction': { hosts: ['mca.gov.in', 'smartcities.gov.in'] },
  'state-capacity-and-governance': { hosts: ['niti.gov.in', 'mygov.in', 'mha.gov.in'] },
  'fiscal-policy-and-public-finance': { hosts: ['mof.gov.in', 'indiabudget.gov.in', 'dea.gov.in'] },
  'capital-markets-and-ipo': { hosts: ['sebi.gov.in'] },
  'startup-and-venture-capital': { hosts: ['startupindia.gov.in', 'investindia.gov.in', 'dpiit.gov.in'] },
  'global-capability-centers': { hosts: ['investindia.gov.in', 'dpiit.gov.in', 'meity.gov.in'] },
  'semiconductor-and-electronics': { hosts: ['meity.gov.in', 'dpiit.gov.in'] },
  'defence-and-aerospace': { hosts: ['makeinindia.com'] },
  'automotive-and-ev': { hosts: ['mnre.gov.in', 'dpiit.gov.in'] },
  'consumer-demand-and-retail': { hosts: ['mospi.gov.in', 'dpiit.gov.in'] },
  'export-competitiveness': { hosts: ['commerce.gov.in', 'dpiit.gov.in'] },
  'trade-corridors': { hosts: ['commerce.gov.in', 'morth.nic.in', 'shipmin.gov.in'] },
  'supply-chain-diversification': { hosts: ['commerce.gov.in', 'dpiit.gov.in'] },
  'women-workforce-participation': { hosts: ['education.gov.in', 'nsdcindia.org', 'skillindiadigital.gov.in'] },
  'climate-adaptation': { hosts: ['moef.gov.in', 'mnre.gov.in'] },
  'insurance-penetration': { hosts: ['irdai.gov.in'] },
  'msme-productivity': { hosts: ['sidbi.in', 'dpiit.gov.in'] },
  'financial-digitalization': { hosts: ['meity.gov.in', 'digitalindia.gov.in'] },
  'public-service-delivery': { hosts: ['mygov.in', 'niti.gov.in', 'digitalindia.gov.in'] },
  'social-sector-outcomes': { hosts: ['mospi.gov.in', 'niti.gov.in', 'education.gov.in', 'mohfw.gov.in'] },
};

export function normalizeCitationUrl(url) {
  if (typeof url !== 'string') {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  if (/DBIE\.spx/i.test(trimmed)) {
    return CANONICAL_DBIE_URL;
  }
  return trimmed;
}

function citationHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

export function sourceAlignsWithTopic(url, cluster) {
  const normalized = normalizeCitationUrl(url);
  const rule = TOPIC_ALIGNMENT[cluster];
  if (!normalized || !rule) {
    return false;
  }
  if (!rule.hosts.includes(citationHost(normalized))) {
    return false;
  }
  if (!rule.paths) {
    return true;
  }
  const haystack = normalized.toLowerCase();
  return rule.paths.some((token) => haystack.includes(token));
}

export function selectAlignedSourceLinks(cluster, registryUrls, { limit = 2 } = {}) {
  if (!Array.isArray(registryUrls) || limit <= 0) {
    return [];
  }

  const seen = new Set();
  const aligned = [];
  for (const candidate of registryUrls) {
    const url = normalizeCitationUrl(candidate);
    if (!url || seen.has(url) || !sourceAlignsWithTopic(url, cluster)) {
      continue;
    }
    seen.add(url);
    aligned.push(url);
    if (aligned.length >= limit) {
      break;
    }
  }
  return aligned;
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
