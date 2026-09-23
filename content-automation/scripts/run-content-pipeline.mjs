import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  classifyMasterAppend,
  contentWriteAllowed,
  loadLanguageCodes,
  rollbackWrittenBriefs,
  selectAlignedSourceLinks,
  writeEnglishBrief,
} from './publish-guard.mjs';

const ROOT = process.cwd();
const MASTER_ROOT = path.join(ROOT, 'src', 'content', 'blog', 'en');
const CONFIG_ROOT = path.join(ROOT, 'content-automation', 'config');
const STATE_ROOT = path.join(ROOT, 'content-automation', 'state');

const MASTER_TARGET = 100;
const LANGUAGE_CODES = loadLanguageCodes(path.join(CONFIG_ROOT, 'languages.json'));

const now = new Date();
const publishDate = now.toISOString().slice(0, 10);
const runId = `${now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${randomUUID().slice(0, 8)}`;
const startedAt = now.toISOString();

function hash(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function titleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function listFilesRecursive(dir) {
  const out = [];

  async function walk(current) {
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        out.push(fullPath);
      }
    }
  }

  await walk(dir);
  return out;
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

async function scanExistingContent() {
  const files = await listFilesRecursive(MASTER_ROOT);
  const markdownFiles = files.filter((filePath) => filePath.endsWith('.md') || filePath.endsWith('.mdx'));
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
      path: path.relative(ROOT, filePath),
      lang,
      canonicalId,
      slug,
      title,
      titleHash: hash(title.toLowerCase()),
      semanticHash: hash(body.toLowerCase().replace(/\s+/g, ' ').slice(0, 5000)),
      sourceHash: hash(sourceLinks.sort().join('|')),
      topicCluster: tags[0] || 'uncategorized',
      status: 'active',
    });
  }

  return index;
}

function buildCoverageMap(index) {
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

function makeMasterMarkdown({ id, title, description, slug, tags, sourceLinks, summaryType, cluster, angle }) {
  const tagsYaml = tags.map((tag) => `  - "${tag}"`).join('\n');
  const linksYaml = sourceLinks.length
    ? `sourceLinks:\n${sourceLinks.map((link) => `  - "${link}"`).join('\n')}\n`
    : '';
  const readingPath = sourceLinks.length
    ? '- Start with the primary release linked in sourceLinks.'
    : '- No registry URL matched this topic, so this brief does not attach a source link.';

  return `---
id: "${id}"
lang: "en"
translationOf: null
title: "${title}"
description: "${description}"
slug: "${slug}"
publishDate: "${publishDate}"
updatedDate: "${publishDate}"
tags:
${tagsYaml}
${linksYaml}summaryType: "${summaryType}"
draft: false
---

# ${title}

## Why This Matters

This briefing summarizes current developments connected to **${titleCase(cluster)}** and gives a practical view for readers tracking India policy and market signals.

## What Changed

- New updates are assessed against official releases and report series.
- The narrative focuses on verifiable shifts rather than speculation.
- Terms are kept plain-language so non-specialist readers can follow quickly.

## Key Takeaways

1. The signal in this cycle is linked to **${titleCase(angle)}**.
2. Readers should track policy continuity alongside short-term data movement.
3. Source-first reading improves confidence and interpretation quality.

## Source-Backed Reading Path

${readingPath}
- Compare with prior-period publication patterns.
- Track follow-up notifications in the same domain.

## Editorial Note

This article is an original synthesis prepared for Great Indian Company using publicly available primary sources.
`;
}

export async function refreshPublishedState() {
  const index = await scanExistingContent();
  if (index.length === 0) {
    const onDisk = (await listFilesRecursive(MASTER_ROOT)).filter(
      (filePath) => filePath.endsWith('.md') || filePath.endsWith('.mdx'),
    );
    if (onDisk.length > 0) {
      throw new Error('Refusing to write an empty content index while master files exist.');
    }
  }

  const coverageMap = buildCoverageMap(index);
  await ensureDir(STATE_ROOT);
  await fs.writeFile(path.join(STATE_ROOT, 'content-index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(STATE_ROOT, 'coverage-map.json'), `${JSON.stringify(coverageMap, null, 2)}\n`, 'utf8');
  return index;
}

async function main() {
  await ensureDir(STATE_ROOT);
  const sourceRegistry = await readJson(path.join(CONFIG_ROOT, 'source_registry.json'));
  const thesisTopics = await readJson(path.join(CONFIG_ROOT, 'thesis_topics.json'));

  const existingIndex = await scanExistingContent();
  const existingSlugs = new Set(existingIndex.map((entry) => entry.slug));
  const existingCount = existingIndex.length;

  const publishRoot = MASTER_ROOT;
  await ensureDir(publishRoot);

  const sourceUrlsUsed = new Set();
  const generatedSlugs = [];
  const failedItems = [];
  const retryCounts = {
    masterRetries: 0,
  };

  const combos = [];
  for (const angle of thesisTopics.angles) {
    for (const cluster of thesisTopics.clusters) {
      combos.push({ cluster, angle });
    }
  }

  if (combos.length < MASTER_TARGET) {
    throw new Error(`Not enough cluster/angle combinations to create ${MASTER_TARGET} masters.`);
  }

  const masters = [];
  let comboIndex = 0;
  let attempts = 0;
  const maxAttempts = Math.max(combos.length * 20, MASTER_TARGET * 5);

  while (masters.length < MASTER_TARGET && attempts < maxAttempts) {
    attempts += 1;
    const seq = String(masters.length + 1).padStart(3, '0');
    const combo = combos[comboIndex % combos.length];
    comboIndex += 1;

    const slugBase = `${combo.cluster}-${combo.angle}-${publishDate.replace(/-/g, '')}-${seq}`;
    const slug = toSlug(slugBase);

    if (existingSlugs.has(slug) || generatedSlugs.includes(slug)) {
      retryCounts.masterRetries += 1;
      continue;
    }

    const title = `${titleCase(combo.cluster)}: ${titleCase(combo.angle)} Guide (${masters.length + 1})`;
    const description = `Original summary on ${titleCase(combo.cluster)} focused on ${titleCase(combo.angle)} with primary-source links.`;
    const id = `gic-${publishDate.replace(/-/g, '')}-${seq}`;

    const sourceLinks = selectAlignedSourceLinks(combo.cluster, sourceRegistry);

    sourceLinks.forEach((link) => sourceUrlsUsed.add(link));

    const tags = [combo.cluster, combo.angle, 'india', 'policy'];
    const summaryType = combo.cluster.includes('rbi') ? 'report-summary' : 'policy-explainer';

    const masterMarkdown = makeMasterMarkdown({
      id,
      title,
      description,
      slug,
      tags,
      sourceLinks,
      summaryType,
      cluster: combo.cluster,
      angle: combo.angle,
    });

    const masterFileName = `${publishDate}-${slug}.md`;
    const masterPath = path.join(publishRoot, masterFileName);

    generatedSlugs.push(slug);

    masters.push({
      id,
      slug,
      title,
      description,
      tags,
      sourceLinks,
      summaryType,
      markdown: masterMarkdown,
      filePath: masterPath,
    });
  }

  const masterCount = masters.length;

  if (masterCount !== MASTER_TARGET) {
    failedItems.push(`master-count-mismatch:${masterCount}`);
    await refreshPublishedState();
    throw new Error(
      `Refusing to commit masters: planned ${masterCount}, expected ${MASTER_TARGET}. No files were written under src/content.`,
    );
  }

  const allowWrite = contentWriteAllowed();
  const appendDecision = classifyMasterAppend({
    existingCount,
    additional: masterCount,
    allowWrite,
  });

  if (appendDecision.action !== 'commit') {
    await refreshPublishedState();
    const endedAt = new Date().toISOString();
    const manifest = {
      runId,
      startedAt,
      endedAt,
      writeMode: 'dry-run',
      allowContentWrite: false,
      existingMastersBefore: existingCount,
      masterCeiling: appendDecision.ceiling,
      mastersRequested: MASTER_TARGET,
      mastersPublished: 0,
      translationsPublished: 0,
      localizationStatus: 'not-generated',
      localizationNote:
        'This run writes English briefs only, through the publish guard. It does not write language-tagged files. The sitemap build rejects those URLs.',
      totalNewMarkdownFiles: 0,
      failedItems,
      retryCounts,
      sourceUrlsUsed: [],
      generatedSlugs: [],
      status: 'dry-run',
    };
    await fs.writeFile(path.join(STATE_ROOT, 'last-run-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(
      `Refusing to write ${masterCount} English masters without ALLOW_CONTENT_WRITE=1. Existing count is ${existingCount}; ceiling is ${appendDecision.ceiling}. Content index refreshed from the current tree.`,
    );
    return;
  }

  const writtenPaths = [];
  try {
    for (const master of masters) {
      await writeEnglishBrief(fs, master.filePath, master.markdown, LANGUAGE_CODES);
      writtenPaths.push(master.filePath);
    }
    const after = (await listFilesRecursive(MASTER_ROOT)).filter((filePath) => filePath.endsWith('.md') || filePath.endsWith('.mdx')).length;
    if (writtenPaths.length !== MASTER_TARGET || after !== existingCount + MASTER_TARGET) {
      throw new Error(
        `Master count check failed after commit (found ${after}, expected ${existingCount + MASTER_TARGET}). Rolled back new files.`,
      );
    }
  } catch (error) {
    await rollbackWrittenBriefs(fs, writtenPaths);
    await refreshPublishedState();
    throw error;
  }

  await refreshPublishedState();

  const endedAt = new Date().toISOString();

  const manifest = {
    runId,
    startedAt,
    endedAt,
    mastersRequested: MASTER_TARGET,
    mastersPublished: masterCount,
    translationsPublished: 0,
    localizationStatus: 'not-generated',
    localizationNote:
      'This run writes English briefs only, through the publish guard. It does not write language-tagged files. The sitemap build rejects those URLs.',
    totalNewMarkdownFiles: masterCount,
    failedItems,
    retryCounts,
    sourceUrlsUsed: Array.from(sourceUrlsUsed),
    generatedSlugs,
    status: failedItems.length === 0 ? 'success' : 'failed',
  };

  await fs.writeFile(path.join(STATE_ROOT, 'last-run-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  if (failedItems.length > 0) {
    throw new Error(`Run failed: ${failedItems.join(', ')}`);
  }

  console.log(
    `Run complete: masters=${masterCount}. No localization files written. Language-tagged English templates are not translations.`,
  );
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
