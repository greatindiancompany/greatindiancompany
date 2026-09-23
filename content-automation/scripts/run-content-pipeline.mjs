import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  CANONICAL_DBIE_URL,
  MASTER_COUNT_CAP,
  classifyMasterWrite,
  commitMastersIfAllowed,
  contentWriteAllowed,
  isDirectExecution,
  refreshContentState,
  scanMasterIndex,
  selectAlignedSourceLinks,
  writeStagedFiles,
} from './content-write-guards.mjs';

const MASTER_TARGET = 100;

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

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export function makeMasterMarkdown({
  id,
  title,
  description,
  slug,
  tags,
  sourceLinks,
  summaryType,
  cluster,
  angle,
  publishDate,
}) {
  const tagsYaml = tags.map((tag) => `  - "${tag}"`).join('\n');
  const linksYaml = sourceLinks.length
    ? `sourceLinks:\n${sourceLinks.map((link) => `  - "${link}"`).join('\n')}\n`
    : '';
  const readingPath = sourceLinks.length
    ? `- Start with the primary release linked in sourceLinks.
- Compare with prior-period publication patterns.
- Track follow-up notifications in the same domain.`
    : `- No registry URL matched this topic, so this brief does not attach a source link.
- Compare with prior-period publication patterns from the same subject-matter host.
- Track follow-up notifications in that domain.`;

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

## Editorial Note

This article is an original synthesis prepared for Great Indian Company using publicly available primary sources.
`;
}

function planMasters({ thesisTopics, sourceRegistry, existingSlugs, masterTarget, publishDate }) {
  const combos = [];
  for (const angle of thesisTopics.angles) {
    for (const cluster of thesisTopics.clusters) {
      combos.push({ cluster, angle });
    }
  }

  if (combos.length < 1) {
    throw new Error('Not enough cluster/angle combinations to plan masters.');
  }

  const masters = [];
  const files = [];
  const generatedSlugs = [];
  const sourceUrlsUsed = new Set();
  let comboIndex = 0;
  let attempts = 0;
  const maxAttempts = Math.max(combos.length * 20, masterTarget * 5);
  let masterRetries = 0;

  while (masters.length < masterTarget && attempts < maxAttempts) {
    attempts += 1;
    const seq = String(masters.length + 1).padStart(3, '0');
    const combo = combos[comboIndex % combos.length];
    comboIndex += 1;
    const slugBase = `${combo.cluster}-${combo.angle}-${publishDate.replace(/-/g, '')}-${seq}`;
    const slug = toSlug(slugBase);

    if (existingSlugs.has(slug) || generatedSlugs.includes(slug)) {
      masterRetries += 1;
      continue;
    }

    const title = `${titleCase(combo.cluster)}: ${titleCase(combo.angle)} Guide (${masters.length + 1})`;
    const description = `Original summary on ${titleCase(combo.cluster)} focused on ${titleCase(combo.angle)} with primary-source links.`;
    const id = `gic-${publishDate.replace(/-/g, '')}-${seq}`;
    const sourceLinks = selectAlignedSourceLinks(combo.cluster, sourceRegistry);
    sourceLinks.forEach((link) => sourceUrlsUsed.add(link));

    const tags = [combo.cluster, combo.angle, 'india', 'policy'];
    const summaryType = combo.cluster.includes('rbi') ? 'report-summary' : 'policy-explainer';
    const body = makeMasterMarkdown({
      id,
      title,
      description,
      slug,
      tags,
      sourceLinks,
      summaryType,
      cluster: combo.cluster,
      angle: combo.angle,
      publishDate,
    });
    const fileName = `${publishDate}-${slug}.md`;

    generatedSlugs.push(slug);
    files.push({ name: fileName, body });
    masters.push({
      id,
      slug,
      title,
      description,
      tags,
      sourceLinks,
      summaryType,
      filePath: path.join('src', 'content', 'blog', 'en', fileName),
    });
  }

  return { masters, files, generatedSlugs, sourceUrlsUsed, masterRetries };
}

async function writeManifest(stateRoot, manifest) {
  await fs.mkdir(stateRoot, { recursive: true });
  await fs.writeFile(path.join(stateRoot, 'last-run-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

export async function runContentPipeline({
  root = process.cwd(),
  allowWrite,
  masterTarget = MASTER_TARGET,
  masterCap = MASTER_COUNT_CAP,
  env = process.env,
  now = new Date(),
} = {}) {
  const writeAllowed = allowWrite ?? contentWriteAllowed(env);
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  const configRoot = path.join(root, 'content-automation', 'config');
  const stateRoot = path.join(root, 'content-automation', 'state');
  const publishDate = now.toISOString().slice(0, 10);
  const startedAt = now.toISOString();
  const runId = `${now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${randomUUID().slice(0, 8)}`;

  const sourceRegistry = await readJson(path.join(configRoot, 'source_registry.json'));
  const thesisTopics = await readJson(path.join(configRoot, 'thesis_topics.json'));
  const existingIndex = await scanMasterIndex({ root, masterRoot });
  const existingSlugs = new Set(existingIndex.map((entry) => entry.slug));
  const existingCount = existingIndex.length;

  let planned = { masters: [], files: [], generatedSlugs: [], sourceUrlsUsed: new Set(), masterRetries: 0 };
  let outcome = {
    published: 0,
    committed: [],
    decision: classifyMasterWrite({ existingCount, additional: 0, cap: masterCap, allowWrite: writeAllowed }),
  };
  let status = 'dry-run';
  const failedItems = [];

  try {
    if (!Array.isArray(sourceRegistry) || sourceRegistry.length === 0) {
      throw new Error('Source registry is empty.');
    }
    if (sourceRegistry.some((url) => /DBIE\.spx/i.test(url))) {
      throw new Error(`Source registry must keep ${CANONICAL_DBIE_URL}. Found DBIE.spx.`);
    }

    planned = planMasters({
      thesisTopics,
      sourceRegistry,
      existingSlugs,
      masterTarget,
      publishDate,
    });

    if (planned.masters.length !== masterTarget) {
      failedItems.push(`master-count-mismatch:${planned.masters.length}`);
      throw new Error(
        `Refusing to commit masters: planned ${planned.masters.length}, expected ${masterTarget}. No files were written under src/content.`,
      );
    }

    const decision = classifyMasterWrite({
      existingCount,
      additional: planned.masters.length,
      cap: masterCap,
      allowWrite: writeAllowed,
    });

    const stagingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gic-masters-'));
    await writeStagedFiles(stagingDir, planned.files);
    outcome = await commitMastersIfAllowed({
      stagingDir,
      masterRoot,
      expectedCount: planned.masters.length,
      existingCount,
      allowWrite: decision.action === 'commit',
      cap: masterCap,
    });
    status = outcome.decision.action === 'commit' ? 'success' : 'dry-run';
  } catch (error) {
    failedItems.push(error instanceof Error ? error.message : String(error));
    status = 'failed';
    try {
      await refreshContentState({ root, masterRoot, stateRoot });
    } catch (refreshError) {
      failedItems.push(refreshError instanceof Error ? refreshError.message : String(refreshError));
    }

    const manifest = buildManifest({
      runId,
      startedAt,
      masterTarget,
      masterCap,
      existingCount,
      planned,
      outcome,
      writeAllowed,
      failedItems,
      status,
    });
    await writeManifest(stateRoot, manifest);
    throw error;
  }

  await refreshContentState({ root, masterRoot, stateRoot });

  const manifest = buildManifest({
    runId,
    startedAt,
    masterTarget,
    masterCap,
    existingCount,
    planned,
    outcome,
    writeAllowed,
    failedItems,
    status,
  });
  await writeManifest(stateRoot, manifest);

  if (status === 'dry-run') {
    console.log(
      `Refusing to write ${planned.masters.length} English masters under src/content without ALLOW_CONTENT_WRITE=1. Existing count is ${existingCount}; ceiling is ${outcome.decision.ceiling}. Content index refreshed from the current tree. No localization files written.`,
    );
  } else {
    console.log(
      `Run complete: masters=${outcome.published}. Content index refreshed after writes. No localization files written. Language-tagged English templates are not translations.`,
    );
  }

  return { manifest };
}

function buildManifest({
  runId,
  startedAt,
  masterTarget,
  masterCap,
  existingCount,
  planned,
  outcome,
  writeAllowed,
  failedItems,
  status,
}) {
  return {
    runId,
    startedAt,
    endedAt: new Date().toISOString(),
    writeMode: status === 'success' ? 'committed' : status,
    allowContentWrite: writeAllowed,
    masterCap,
    existingMastersBefore: existingCount,
    mastersRequested: masterTarget,
    mastersPlanned: planned.masters.length,
    mastersPublished: outcome.published,
    translationsPublished: 0,
    localizationStatus: 'not-generated',
    localizationNote:
      'This run does not write language-tagged files. Existing files under generated-translations are English templates, not translations, and the site build does not publish them.',
    totalNewMarkdownFiles: outcome.published,
    failedItems,
    retryCounts: {
      masterRetries: planned.masterRetries,
    },
    sourceUrlsUsed: Array.from(planned.sourceUrlsUsed),
    generatedSlugs: status === 'success' ? planned.generatedSlugs : [],
    citationPolicy:
      'sourceLinks are attached only when the host and path match the topic. Unrelated registry entries are omitted. DBIE citations use https://www.rbi.org.in/Scripts/DBIE.aspx.',
    status,
  };
}

if (isDirectExecution(import.meta.url)) {
  runContentPipeline().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
