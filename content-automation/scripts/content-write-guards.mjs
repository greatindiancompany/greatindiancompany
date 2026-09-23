import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** English masters already on the site. Growth past this count needs an explicit opt-in. */
export const MASTER_COUNT_CAP = 800;

export const CANONICAL_DBIE_URL = 'https://www.rbi.org.in/Scripts/DBIE.aspx';

/**
 * Hosts and, where one host covers many series, path tokens that actually
 * match the topic. Registry entries that fail this check are omitted.
 * Selection never rotates by article index.
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

export function isDirectExecution(metaUrl) {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return metaUrl === pathToFileURL(entry).href;
}

export function contentWriteAllowed(env = process.env) {
  return env.ALLOW_CONTENT_WRITE === '1';
}

export function classifyMasterWrite({
  existingCount,
  additional,
  cap = MASTER_COUNT_CAP,
  allowWrite = false,
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
    return { action: 'noop', ceiling, next, reason: 'no-additional-masters' };
  }

  if (!allowWrite) {
    return {
      action: 'dry-run',
      ceiling,
      next,
      reason: next > ceiling ? 'above-cap' : 'missing-opt-in',
    };
  }

  return { action: 'commit', ceiling, next, reason: 'opt-in' };
}

export function assertWithinMasterCap(args) {
  const decision = classifyMasterWrite(args);
  if (decision.action === 'dry-run') {
    throw new Error(
      `Refusing to add ${args.additional} English masters without ALLOW_CONTENT_WRITE=1. Existing count is ${args.existingCount}; ceiling is ${decision.ceiling}; result would be ${decision.next}.`,
    );
  }
  return decision;
}

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

function hostname(url) {
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

  const host = hostname(normalized);
  if (!rule.hosts.includes(host)) {
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
    if (!url || seen.has(url)) {
      continue;
    }
    if (!sourceAlignsWithTopic(url, cluster)) {
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

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

export async function listMarkdownFiles(dir) {
  const out = [];

  async function walk(current) {
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        out.push(fullPath);
      }
    }
  }

  await walk(dir);
  return out;
}

export async function writeStagedFiles(stagingDir, files) {
  await fs.rm(stagingDir, { recursive: true, force: true });
  await fs.mkdir(stagingDir, { recursive: true });

  for (const file of files) {
    const target = path.join(stagingDir, file.name);
    if (path.dirname(target) !== stagingDir) {
      throw new Error(`Staged master name must stay inside the staging directory. Received ${file.name}.`);
    }
    await fs.writeFile(target, file.body, 'utf8');
  }
}

export async function discardStaging(stagingDir) {
  await fs.rm(stagingDir, { recursive: true, force: true });
}

export async function rollbackCommitted(filePaths) {
  for (const filePath of filePaths) {
    await fs.rm(filePath, { force: true });
  }
}

export async function commitStagedMasters(stagingDir, masterRoot) {
  const names = (await fs.readdir(stagingDir)).filter((name) => name.endsWith('.md') || name.endsWith('.mdx')).sort();
  await fs.mkdir(masterRoot, { recursive: true });
  const committed = [];

  try {
    for (const name of names) {
      const dest = path.join(masterRoot, name);
      if (await pathExists(dest)) {
        throw new Error(`Refusing to overwrite existing master ${name}.`);
      }
      await fs.copyFile(path.join(stagingDir, name), dest);
      committed.push(dest);
    }
  } catch (error) {
    await rollbackCommitted(committed);
    throw error;
  }

  return committed;
}

export async function commitMastersIfAllowed({
  stagingDir,
  masterRoot,
  expectedCount,
  existingCount,
  allowWrite = false,
  cap = MASTER_COUNT_CAP,
}) {
  let stagedNames = [];
  try {
    stagedNames = (await fs.readdir(stagingDir)).filter((name) => name.endsWith('.md') || name.endsWith('.mdx'));
  } catch (error) {
    await discardStaging(stagingDir);
    throw error;
  }

  if (stagedNames.length !== expectedCount) {
    await discardStaging(stagingDir);
    throw new Error(
      `Refusing to commit masters: staged ${stagedNames.length} files, expected ${expectedCount}. Staging was removed.`,
    );
  }

  const decision = classifyMasterWrite({
    existingCount,
    additional: expectedCount,
    cap,
    allowWrite,
  });

  if (decision.action !== 'commit') {
    await discardStaging(stagingDir);
    return { published: 0, committed: [], decision };
  }

  let committed = [];
  try {
    committed = await commitStagedMasters(stagingDir, masterRoot);
    const after = (await listMarkdownFiles(masterRoot)).length;
    if (after !== existingCount + expectedCount) {
      throw new Error(
        `Master count check failed after commit (found ${after}, expected ${existingCount + expectedCount}). Rolled back new files.`,
      );
    }
  } catch (error) {
    await rollbackCommitted(committed);
    await discardStaging(stagingDir);
    throw error;
  }

  await discardStaging(stagingDir);
  return { published: committed.length, committed, decision };
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: '', body: raw };
  }

  return {
    frontmatter: match[1],
    body: raw.slice(match[0].length),
  };
}

function pickField(frontmatter, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = frontmatter.match(new RegExp(`^${escaped}:\\s*(.*)$`, 'm'));
  if (!match) {
    return null;
  }

  return match[1].replace(/^"|"$/g, '').trim();
}

function pickArray(frontmatter, key) {
  const lines = frontmatter.split('\n');
  const out = [];
  let inBlock = false;

  for (const line of lines) {
    if (!inBlock) {
      if (line.startsWith(`${key}:`)) {
        inBlock = true;
      }
      continue;
    }

    if (line.startsWith('- ')) {
      out.push(line.slice(2).trim().replace(/^"|"$/g, ''));
      continue;
    }

    if (line.startsWith('  - ')) {
      out.push(line.slice(4).trim().replace(/^"|"$/g, ''));
      continue;
    }

    if (line.trim() === '') {
      continue;
    }

    if (!line.startsWith(' ')) {
      break;
    }
  }

  return out;
}

export async function scanMasterIndex({ root, masterRoot }) {
  const markdownFiles = await listMarkdownFiles(masterRoot);
  const index = [];

  for (const filePath of markdownFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(raw);
    const slug = pickField(frontmatter, 'slug') || path.basename(filePath).replace(/\.mdx?$/, '');
    const lang = pickField(frontmatter, 'lang') || 'unknown';
    const id = pickField(frontmatter, 'id') || slug;
    const translationOf = pickField(frontmatter, 'translationOf');
    const canonicalId = translationOf && translationOf !== 'null' ? translationOf : id;
    const title = pickField(frontmatter, 'title') || slug;
    const tags = pickArray(frontmatter, 'tags');
    const sourceLinks = pickArray(frontmatter, 'sourceLinks');

    index.push({
      path: path.relative(root, filePath),
      lang,
      canonicalId,
      slug,
      title,
      titleHash: hash(title.toLowerCase()),
      semanticHash: hash(body.toLowerCase().replace(/\s+/g, ' ').slice(0, 5000)),
      sourceHash: hash([...sourceLinks].sort().join('|')),
      topicCluster: tags[0] || 'uncategorized',
      status: 'active',
    });
  }

  index.sort((left, right) => left.path.localeCompare(right.path));
  return index;
}

export function buildCoverageMap(index) {
  const byTopic = {};
  const byLanguage = {};

  for (const row of index) {
    byTopic[row.topicCluster] = (byTopic[row.topicCluster] || 0) + 1;
    byLanguage[row.lang] = (byLanguage[row.lang] || 0) + 1;
  }

  return {
    scannedAt: new Date().toISOString(),
    existingArticleCount: index.length,
    byTopic,
    byLanguage,
    saturatedTopics: Object.entries(byTopic)
      .filter(([, count]) => count >= 10)
      .map(([topic]) => topic),
    underCoveredTopics: Object.entries(byTopic)
      .filter(([, count]) => count < 3)
      .map(([topic]) => topic),
  };
}

export async function refreshContentState({
  root,
  masterRoot = path.join(root, 'src', 'content', 'blog', 'en'),
  stateRoot = path.join(root, 'content-automation', 'state'),
}) {
  const index = await scanMasterIndex({ root, masterRoot });

  if (index.length === 0) {
    const onDisk = await listMarkdownFiles(masterRoot);
    if (onDisk.length > 0) {
      throw new Error('Refusing to write an empty content index while master files exist.');
    }
  }

  await fs.mkdir(stateRoot, { recursive: true });
  await fs.writeFile(path.join(stateRoot, 'content-index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  await fs.writeFile(
    path.join(stateRoot, 'coverage-map.json'),
    `${JSON.stringify(buildCoverageMap(index), null, 2)}\n`,
    'utf8',
  );

  return { index };
}
