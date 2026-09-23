import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
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

const TARGET_MASTERS_TOTAL = 800;
const LANGUAGE_CODES = loadLanguageCodes(path.join(CONFIG_ROOT, 'languages.json'));

const startedAt = new Date().toISOString();
const runId = `diverse-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${randomUUID().slice(0, 8)}`;
const publishDate = new Date().toISOString().slice(0, 10);

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

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function listMarkdownFiles(dir) {
  try {
    const files = await fs.readdir(dir);
    return files.filter((name) => name.endsWith('.md')).map((name) => path.join(dir, name));
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

async function getExistingMasters() {
  const files = await listMarkdownFiles(MASTER_ROOT);
  const masters = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, 'utf8');
    const { frontmatter } = parseFrontmatter(raw);
    const id = pickField(frontmatter, 'id');
    const slug = pickField(frontmatter, 'slug');
    if (id && slug) {
      masters.push({ id, slug, filePath: path.relative(ROOT, filePath) });
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
  govLabel,
  privateLabel,
}) {
  const tagsYaml = tags.map((tag) => `  - "${tag}"`).join('\n');
  const linksYaml = sourceLinks.length
    ? `sourceLinks:\n${sourceLinks.map((url) => `  - "${url}"`).join('\n')}\n`
    : '';
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

This brief synthesizes public information from **${govLabel}** and **${privateLabel}** to map India-specific developments on **${titleCase(cluster)}**.

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

async function main() {
  await ensureDir(STATE_ROOT);

  const diverseSources = await readJson(path.join(CONFIG_ROOT, 'source_registry_diverse.json'));
  const diverseTopics = await readJson(path.join(CONFIG_ROOT, 'thesis_topics_diverse.json'));

  const existingMasters = await getExistingMasters();
  const existingMasterCount = existingMasters.length;

  if (existingMasterCount > TARGET_MASTERS_TOTAL) {
    throw new Error(
      `Existing masters (${existingMasterCount}) already exceed target (${TARGET_MASTERS_TOTAL}). Aborting.`,
    );
  }

  const additionalMastersNeeded = TARGET_MASTERS_TOTAL - existingMasterCount;

  if (additionalMastersNeeded === 0) {
    console.log(
      `No-op: already at ${TARGET_MASTERS_TOTAL} English masters. Localization files are not generated.`,
    );
    return;
  }

  const existingSlugs = new Set(existingMasters.map((item) => item.slug));
  const existingSeqMax = existingMasters.reduce((max, item) => {
    const m = item.id.match(/-(\d+)$/);
    if (!m) {
      return max;
    }
    return Math.max(max, Number(m[1]));
  }, 0);

  const gov = diverseSources.government;
  const privatePool = [...diverseSources.consulting, ...diverseSources.investmentBanks, ...diverseSources.multilaterals];

  if (gov.length === 0 || privatePool.length === 0) {
    throw new Error('Diverse source registries are empty.');
  }

  const generatedMasterPaths = [];
  const generatedSlugs = [];
  const sourceUrlsUsed = new Set();

  await ensureDir(MASTER_ROOT);

  const appendDecision = classifyMasterAppend({
    existingCount: existingMasterCount,
    additional: additionalMastersNeeded,
    allowWrite: contentWriteAllowed(),
  });

  if (appendDecision.action === 'dry-run') {
    console.log(
      `Refusing to write ${additionalMastersNeeded} English masters without ALLOW_CONTENT_WRITE=1. Existing count is ${existingMasterCount}; ceiling is ${appendDecision.ceiling}.`,
    );
    return;
  }

  let createdMasters = 0;
  const writtenPaths = [];

  let i = 0;
  while (createdMasters < additionalMastersNeeded) {
    const seq = existingSeqMax + createdMasters + 1;
    const seqLabel = String(seq).padStart(3, '0');

    const cluster = diverseTopics.clusters[i % diverseTopics.clusters.length];
    const angle = diverseTopics.angles[Math.floor(i / diverseTopics.clusters.length) % diverseTopics.angles.length];

    const sourceLinks = selectAlignedSourceLinks(cluster, [...gov, ...privatePool]);
    const govLabel = sourceLinks[0] ? shortDomain(sourceLinks[0]) : 'unlinked';
    const privateLabel = sourceLinks[1] ? shortDomain(sourceLinks[1]) : govLabel;

    const slug = toSlug(`${cluster}-${angle}-${govLabel}-${publishDate.replace(/-/g, '')}-${seqLabel}`);
    i += 1;

    if (existingSlugs.has(slug) || generatedSlugs.includes(slug)) {
      continue;
    }

    const title = `${titleCase(cluster)} In India: ${titleCase(angle)} (${seq})`;
    const description = `A high-level India brief using inputs from ${govLabel} and ${privateLabel}.`;
    const id = `gic-${publishDate.replace(/-/g, '')}-${seqLabel}`;
    const tags = [cluster, angle, 'india-briefs', 'diverse-sources'];
    const summaryType = 'india-brief';

    sourceLinks.forEach((url) => sourceUrlsUsed.add(url));

    const masterMarkdown = makeMasterMarkdown({
      id,
      title,
      description,
      slug,
      tags,
      sourceLinks,
      summaryType,
      cluster,
      angle,
      govLabel,
      privateLabel,
    });

    const masterFile = path.join(MASTER_ROOT, `${publishDate}-${slug}.md`);
    try {
      await writeEnglishBrief(fs, masterFile, masterMarkdown, LANGUAGE_CODES);
    } catch (error) {
      await rollbackWrittenBriefs(fs, writtenPaths);
      throw error;
    }
    writtenPaths.push(masterFile);
    generatedMasterPaths.push(path.relative(ROOT, masterFile));
    generatedSlugs.push(slug);
    createdMasters += 1;
  }

  if (createdMasters !== additionalMastersNeeded) {
    await rollbackWrittenBriefs(fs, writtenPaths);
    throw new Error(
      `Refusing to keep ${createdMasters} new masters; expected ${additionalMastersNeeded}. Rolled back new files.`,
    );
  }

  const totalMastersAfter = (await listMarkdownFiles(MASTER_ROOT)).length;

  const failedItems = [];
  if (createdMasters !== additionalMastersNeeded) {
    failedItems.push(`created-master-mismatch:${createdMasters}`);
  }
  if (totalMastersAfter !== TARGET_MASTERS_TOTAL) {
    failedItems.push(`final-master-count-mismatch:${totalMastersAfter}`);
  }

  const endedAt = new Date().toISOString();

  const manifest = {
    runId,
    startedAt,
    endedAt,
    targetMastersTotal: TARGET_MASTERS_TOTAL,
    existingMastersBefore: existingMasterCount,
    additionalMastersRequested: additionalMastersNeeded,
    additionalMastersGenerated: createdMasters,
    additionalTranslationsGenerated: 0,
    localizationStatus: 'not-generated',
    localizationNote:
      'This run writes English briefs only, through the publish guard. It does not write language-tagged files. The sitemap build rejects those URLs.',
    mastersAfterRun: totalMastersAfter,
    sourcePolicy: 'No RBI sources in this expansion batch. Government + consulting/investment/multilateral sources only.',
    sourceUrlsUsed: Array.from(sourceUrlsUsed),
    generatedMasterPaths,
    failedItems,
    status: failedItems.length === 0 ? 'success' : 'failed',
  };

  await fs.writeFile(
    path.join(STATE_ROOT, 'diverse-expansion-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );

  if (failedItems.length > 0) {
    await rollbackWrittenBriefs(fs, writtenPaths);
    throw new Error(`Expansion failed: ${failedItems.join(', ')}. Rolled back new files.`);
  }

  console.log(
    `Expansion complete: +${createdMasters} English masters. No localization files written.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
