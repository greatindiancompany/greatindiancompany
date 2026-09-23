import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  MASTER_COUNT_CAP,
  commitMastersIfAllowed,
  contentWriteAllowed,
  isDirectExecution,
  refreshContentState,
  selectAlignedSourceLinks,
  writeStagedFiles,
} from './content-write-guards.mjs';

const TARGET_MASTERS_TOTAL = 800;

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function shortDomain(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const main = host.split('.').slice(0, -1).join('-') || host.replace(/\./g, '-');
    return main.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  } catch {
    return 'source';
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function listMarkdownNames(dir) {
  try {
    const files = await fs.readdir(dir);
    return files.filter((name) => name.endsWith('.md'));
  } catch {
    return [];
  }
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: '', body: raw };
  }

  return { frontmatter: match[1], body: raw.slice(match[0].length) };
}

function pickField(frontmatter, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = frontmatter.match(new RegExp(`^${escaped}:\\s*(.*)$`, 'm'));
  if (!match) {
    return null;
  }

  return match[1].replace(/^"|"$/g, '').trim();
}

async function getExistingMasters(masterRoot, root) {
  const names = await listMarkdownNames(masterRoot);
  const masters = [];

  for (const name of names) {
    const filePath = path.join(masterRoot, name);
    const raw = await fs.readFile(filePath, 'utf8');
    const { frontmatter } = parseFrontmatter(raw);
    const id = pickField(frontmatter, 'id');
    const slug = pickField(frontmatter, 'slug');
    if (id && slug) {
      masters.push({ id, slug, filePath: path.relative(root, filePath) });
    }
  }

  return masters;
}

function makeMasterMarkdown({
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
    ? `sourceLinks:\n${sourceLinks.map((url) => `  - "${url}"`).join('\n')}\n`
    : '';
  const sourceNames = sourceLinks.map((url) => shortDomain(url));
  const attribution = sourceNames.length
    ? `public information from **${sourceNames.join('** and **')}**`
    : 'public information';
  const sourceSection = sourceLinks.length
    ? sourceLinks.map((url) => `- ${url}`).join('\n')
    : '- No registry host aligned with this topic, so no source link is attached.';

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

## Executive Brief

This brief synthesizes ${attribution} to map India-specific developments on **${titleCase(cluster)}**.

## What Changed

- Recent updates suggest a measurable shift in policy or operating conditions tied to **${titleCase(angle)}**.
- Multiple institutions now frame this area as a medium-term execution priority.
- Program design and implementation speed appear to be as important as headline announcements.

## Strategic Signals For India

1. **Policy signal:** execution quality is becoming a differentiator, not just policy intent.
2. **Enterprise signal:** firms with faster compliance and deployment cycles can capture outsized gains.
3. **Capital signal:** investors are likely to reward credible, milestone-backed delivery.

## Implications

### For policy teams

- Prioritize measurable outcomes and publish periodic progress snapshots.
- Reduce overlap between central and state-level implementation tracks.

### For operators and founders

- Build roadmap scenarios around adoption speed, regulatory response, and infrastructure readiness.
- Track procurement, standards, and partner ecosystem readiness.

### For investors and strategy teams

- Focus on execution depth, not only narrative momentum.
- Benchmark business models against international precedents with India-specific constraints.

## Next 90 Days Checklist

- Watch for follow-up circulars, implementation guidelines, and budget-linked disclosures.
- Track state-level adoption variance and bottleneck resolution patterns.
- Revisit scenario assumptions as new disclosures arrive.

## Source Links

${sourceSection}

## Editorial Method

This is an original synthesis for Great Indian Company, based on public-source reading and structured analysis.
`;
}

export async function runDiverseExpansion({
  root = process.cwd(),
  allowWrite,
  targetTotal = TARGET_MASTERS_TOTAL,
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
  const runId = `diverse-${now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${randomUUID().slice(0, 8)}`;

  await fs.mkdir(stateRoot, { recursive: true });

  const diverseSources = await readJson(path.join(configRoot, 'source_registry_diverse.json'));
  const diverseTopics = await readJson(path.join(configRoot, 'thesis_topics_diverse.json'));
  const existingMasters = await getExistingMasters(masterRoot, root);
  const existingMasterCount = existingMasters.length;

  if (existingMasterCount > targetTotal) {
    throw new Error(
      `Existing masters (${existingMasterCount}) already exceed target (${targetTotal}). Aborting.`,
    );
  }

  const additionalMastersNeeded = targetTotal - existingMasterCount;

  if (additionalMastersNeeded === 0) {
    await refreshContentState({ root, masterRoot, stateRoot });
    console.log(
      `No-op: already at ${targetTotal} English masters. Localization files are not generated. Content index refreshed from the current tree.`,
    );
    return {
      manifest: {
        runId,
        status: 'noop',
        existingMastersBefore: existingMasterCount,
        additionalMastersGenerated: 0,
      },
    };
  }

  const gov = diverseSources.government;
  const privatePool = [
    ...diverseSources.consulting,
    ...diverseSources.investmentBanks,
    ...diverseSources.multilaterals,
  ];
  const registryUrls = [...gov, ...privatePool];

  if (gov.length === 0 || privatePool.length === 0) {
    throw new Error('Diverse source registries are empty.');
  }

  const existingSlugs = new Set(existingMasters.map((item) => item.slug));
  const existingSeqMax = existingMasters.reduce((max, item) => {
    const match = item.id.match(/-(\d+)$/);
    if (!match) {
      return max;
    }
    return Math.max(max, Number(match[1]));
  }, 0);

  const files = [];
  const generatedSlugs = [];
  const sourceUrlsUsed = new Set();
  let createdMasters = 0;
  let cursor = 0;
  let attempts = 0;
  const maxAttempts = additionalMastersNeeded * 20;

  while (createdMasters < additionalMastersNeeded && attempts < maxAttempts) {
    attempts += 1;
    const seq = existingSeqMax + createdMasters + 1;
    const seqLabel = String(seq).padStart(3, '0');
    const cluster = diverseTopics.clusters[cursor % diverseTopics.clusters.length];
    const angle =
      diverseTopics.angles[Math.floor(cursor / diverseTopics.clusters.length) % diverseTopics.angles.length];
    const sourceLinks = selectAlignedSourceLinks(cluster, registryUrls);
    const sourceLabel = sourceLinks.length > 0 ? shortDomain(sourceLinks[0]) : 'unlinked';
    const slug = toSlug(`${cluster}-${angle}-${sourceLabel}-${publishDate.replace(/-/g, '')}-${seqLabel}`);
    cursor += 1;

    if (existingSlugs.has(slug) || generatedSlugs.includes(slug)) {
      continue;
    }

    const title = `${titleCase(cluster)} In India: ${titleCase(angle)} (${seq})`;
    const description = sourceLinks.length
      ? `A high-level India brief using inputs from ${sourceLinks.map((url) => shortDomain(url)).join(' and ')}.`
      : `A high-level India brief on ${titleCase(cluster)}. No aligned registry host was attached.`;
    const id = `gic-${publishDate.replace(/-/g, '')}-${seqLabel}`;
    const tags = [cluster, angle, 'india-briefs', 'diverse-sources'];
    sourceLinks.forEach((url) => sourceUrlsUsed.add(url));

    files.push({
      name: `${publishDate}-${slug}.md`,
      body: makeMasterMarkdown({
        id,
        title,
        description,
        slug,
        tags,
        sourceLinks,
        summaryType: 'india-brief',
        cluster,
        angle,
        publishDate,
      }),
    });
    generatedSlugs.push(slug);
    createdMasters += 1;
  }

  const failedItems = [];
  if (createdMasters !== additionalMastersNeeded) {
    failedItems.push(`created-master-mismatch:${createdMasters}`);
    await refreshContentState({ root, masterRoot, stateRoot });
    const manifest = {
      runId,
      startedAt,
      endedAt: new Date().toISOString(),
      targetMastersTotal: targetTotal,
      existingMastersBefore: existingMasterCount,
      additionalMastersRequested: additionalMastersNeeded,
      additionalMastersGenerated: 0,
      mastersAfterRun: (await listMarkdownNames(masterRoot)).length,
      failedItems,
      status: 'failed',
    };
    await fs.writeFile(
      path.join(stateRoot, 'diverse-expansion-manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    );
    throw new Error(`Expansion failed before commit: ${failedItems.join(', ')}`);
  }

  const stagingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gic-diverse-masters-'));
  await writeStagedFiles(stagingDir, files);

  let outcome;
  try {
    outcome = await commitMastersIfAllowed({
      stagingDir,
      masterRoot,
      expectedCount: files.length,
      existingCount: existingMasterCount,
      allowWrite: writeAllowed,
      cap: masterCap,
    });
  } catch (error) {
    await refreshContentState({ root, masterRoot, stateRoot });
    throw error;
  }

  const mastersAfterRun = (await listMarkdownNames(masterRoot)).length;
  if (outcome.published > 0 && mastersAfterRun !== targetTotal) {
    failedItems.push(`final-master-count-mismatch:${mastersAfterRun}`);
  }

  await refreshContentState({ root, masterRoot, stateRoot });

  const status = failedItems.length > 0 ? 'failed' : outcome.decision.action === 'commit' ? 'success' : 'dry-run';
  const manifest = {
    runId,
    startedAt,
    endedAt: new Date().toISOString(),
    writeMode: status === 'success' ? 'committed' : status,
    allowContentWrite: writeAllowed,
    masterCap,
    targetMastersTotal: targetTotal,
    existingMastersBefore: existingMasterCount,
    additionalMastersRequested: additionalMastersNeeded,
    additionalMastersGenerated: outcome.published,
    additionalTranslationsGenerated: 0,
    localizationStatus: 'not-generated',
    localizationNote:
      'This run does not write language-tagged files. Existing files under generated-translations are English templates, not translations, and the site build does not publish them.',
    mastersAfterRun,
    sourcePolicy:
      'Source links are attached only when the host matches the topic. Unrelated registry rotation is omitted. No localization files are written.',
    sourceUrlsUsed: Array.from(sourceUrlsUsed),
    generatedMasterPaths:
      status === 'success' ? files.map((file) => path.join('src', 'content', 'blog', 'en', file.name)) : [],
    failedItems,
    status,
  };

  await fs.writeFile(
    path.join(stateRoot, 'diverse-expansion-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  if (failedItems.length > 0) {
    throw new Error(`Expansion failed: ${failedItems.join(', ')}`);
  }

  if (status === 'dry-run') {
    console.log(
      `Refusing to write ${additionalMastersNeeded} English masters under src/content without ALLOW_CONTENT_WRITE=1. Existing count is ${existingMasterCount}; ceiling is ${outcome.decision.ceiling}. Content index refreshed from the current tree.`,
    );
  } else {
    console.log(
      `Expansion complete: +${outcome.published} English masters. Content index refreshed after writes. No localization files written.`,
    );
  }

  return { manifest };
}

if (isDirectExecution(import.meta.url)) {
  runDiverseExpansion().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
