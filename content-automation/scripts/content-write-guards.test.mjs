import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runDiverseExpansion } from './expand-to-800-diverse.mjs';
import { runContentPipeline } from './run-content-pipeline.mjs';
import {
  CANONICAL_DBIE_URL,
  MASTER_COUNT_CAP,
  assertWithinMasterCap,
  commitMastersIfAllowed,
  contentWriteAllowed,
  discardStaging,
  refreshContentState,
  selectAlignedSourceLinks,
  writeStagedFiles,
} from './content-write-guards.mjs';

const SAMPLE_MASTER = `---
id: "gic-existing-001"
lang: "en"
translationOf: null
title: "Existing brief"
description: "Already on disk."
slug: "existing-brief"
publishDate: "2026-03-30"
updatedDate: "2026-03-30"
tags:
  - "credit-growth"
sourceLinks:
  - "${CANONICAL_DBIE_URL}"
summaryType: "policy-explainer"
draft: false
---

# Existing brief

Body copy for the index.
`;

async function makeRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'gic-guards-'));
  await mkdir(path.join(root, 'src', 'content', 'blog', 'en'), { recursive: true });
  await mkdir(path.join(root, 'content-automation', 'config'), { recursive: true });
  await mkdir(path.join(root, 'content-automation', 'state'), { recursive: true });
  await writeFile(path.join(root, 'content-automation', 'state', 'content-index.json'), '[]\n', 'utf8');
  return root;
}

test('content writes require the exact ALLOW_CONTENT_WRITE=1 opt-in', () => {
  assert.equal(contentWriteAllowed({ ALLOW_CONTENT_WRITE: '1' }), true);
  assert.equal(contentWriteAllowed({ ALLOW_CONTENT_WRITE: 'true' }), false);
  assert.equal(contentWriteAllowed({}), false);
});

test('master growth past 800 or the current count is refused without opt-in', () => {
  assert.equal(MASTER_COUNT_CAP, 800);
  assert.throws(
    () => assertWithinMasterCap({ existingCount: 800, additional: 1, allowWrite: false }),
    /ALLOW_CONTENT_WRITE=1/,
  );
  assert.throws(
    () => assertWithinMasterCap({ existingCount: 900, additional: 1, allowWrite: false }),
    /ceiling is 900/,
  );
  assert.throws(
    () => assertWithinMasterCap({ existingCount: 10, additional: 1, allowWrite: false }),
    /ALLOW_CONTENT_WRITE=1/,
  );
  const allowed = assertWithinMasterCap({ existingCount: 800, additional: 1, allowWrite: true });
  assert.equal(allowed.action, 'commit');
});

test('source links follow the topic and keep the DBIE.aspx path', () => {
  const registry = [
    'https://www.mohfw.gov.in/',
    'https://www.rbi.org.in/Scripts/NotificationUser.aspx',
    'https://www.ayush.gov.in/',
    'https://www.rbi.org.in/Scripts/DBIE.spx',
  ];
  const selected = selectAlignedSourceLinks('credit-growth', registry);
  assert.deepEqual(selected, [CANONICAL_DBIE_URL]);
  assert.equal(selected.includes(registry[0]), false);
  assert.equal(selected.includes(registry[1]), false);

  const pharma = selectAlignedSourceLinks('pharma-and-biotech', [
    'https://www.mnre.gov.in/',
    'https://www.ministryofcoal.gov.in/',
    'https://www.mohfw.gov.in/',
  ]);
  assert.deepEqual(pharma, ['https://www.mohfw.gov.in/']);

  const first = selectAlignedSourceLinks('education-and-skilling', [
    'https://www.education.gov.in/',
    'https://www.nsdcindia.org/',
    'https://www.skillindiadigital.gov.in/',
  ]);
  const later = selectAlignedSourceLinks('education-and-skilling', [
    'https://www.education.gov.in/',
    'https://www.nsdcindia.org/',
    'https://www.skillindiadigital.gov.in/',
  ]);
  assert.deepEqual(first, later);
  assert.deepEqual(first, ['https://www.education.gov.in/', 'https://www.nsdcindia.org/']);
});

test('the checked-in source registry still uses DBIE.aspx', async () => {
  const registry = JSON.parse(
    await readFile(path.join(process.cwd(), 'content-automation', 'config', 'source_registry.json'), 'utf8'),
  );
  assert.equal(registry.includes(CANONICAL_DBIE_URL), true);
  assert.equal(registry.some((url) => /DBIE\.spx/i.test(url)), false);
});

test('a failed staged count removes staging and does not touch masters', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  const stagingDir = path.join(root, 'staging');
  await writeFile(path.join(masterRoot, '2026-03-30-existing-brief.md'), SAMPLE_MASTER, 'utf8');
  await writeStagedFiles(stagingDir, [{ name: 'only-one.md', body: '---\nid: "x"\n---\n' }]);

  await assert.rejects(
    () =>
      commitMastersIfAllowed({
        stagingDir,
        masterRoot,
        expectedCount: 2,
        existingCount: 1,
        allowWrite: true,
      }),
    /staged 1 files, expected 2/,
  );

  assert.deepEqual(await readdir(masterRoot), ['2026-03-30-existing-brief.md']);
  await assert.rejects(() => readdir(stagingDir));
  await rm(root, { recursive: true, force: true });
});

test('a failed post-commit count rolls back new masters', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  const stagingDir = path.join(root, 'staging');
  await writeFile(path.join(masterRoot, '2026-03-30-existing-brief.md'), SAMPLE_MASTER, 'utf8');
  await writeStagedFiles(stagingDir, [
    { name: '2026-03-30-new-brief.md', body: SAMPLE_MASTER.replace('existing-brief', 'new-brief') },
  ]);

  await assert.rejects(
    () =>
      commitMastersIfAllowed({
        stagingDir,
        masterRoot,
        expectedCount: 1,
        existingCount: 0,
        allowWrite: true,
      }),
    /Rolled back new files/,
  );

  assert.deepEqual(await readdir(masterRoot), ['2026-03-30-existing-brief.md']);
  await assert.rejects(() => readdir(stagingDir));
  await rm(root, { recursive: true, force: true });
});

test('dry-run discards staging and still refreshes a non-empty index', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  const stagingDir = path.join(root, 'staging');
  await writeFile(path.join(masterRoot, '2026-03-30-existing-brief.md'), SAMPLE_MASTER, 'utf8');
  await writeStagedFiles(stagingDir, [{ name: '2026-03-30-new-brief.md', body: '# new\n' }]);

  const outcome = await commitMastersIfAllowed({
    stagingDir,
    masterRoot,
    expectedCount: 1,
    existingCount: 1,
    allowWrite: false,
    cap: MASTER_COUNT_CAP,
  });

  assert.equal(outcome.published, 0);
  assert.equal(outcome.decision.action, 'dry-run');
  assert.deepEqual(await readdir(masterRoot), ['2026-03-30-existing-brief.md']);
  await assert.rejects(() => readdir(stagingDir));

  const { index } = await refreshContentState({ root });
  assert.equal(index.length, 1);
  const stored = JSON.parse(
    await readFile(path.join(root, 'content-automation', 'state', 'content-index.json'), 'utf8'),
  );
  assert.equal(stored.length, 1);
  assert.equal(stored[0].slug, 'existing-brief');
  const coverage = JSON.parse(
    await readFile(path.join(root, 'content-automation', 'state', 'coverage-map.json'), 'utf8'),
  );
  assert.equal(coverage.existingArticleCount, 1);
  await rm(root, { recursive: true, force: true });
});

test('content pipeline dry-run does not grow src/content and repairs the index', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  await writeFile(path.join(masterRoot, '2026-03-30-existing-brief.md'), SAMPLE_MASTER, 'utf8');
  await writeFile(
    path.join(root, 'content-automation', 'config', 'thesis_topics.json'),
    JSON.stringify({ clusters: ['credit-growth'], angles: ['what-changed'] }),
    'utf8',
  );
  await writeFile(
    path.join(root, 'content-automation', 'config', 'source_registry.json'),
    JSON.stringify([
      'https://www.mohfw.gov.in/',
      'https://www.rbi.org.in/Scripts/NotificationUser.aspx',
      CANONICAL_DBIE_URL,
    ]),
    'utf8',
  );

  const { manifest } = await runContentPipeline({
    root,
    allowWrite: false,
    masterTarget: 1,
    now: new Date('2026-04-02T00:00:00.000Z'),
  });

  assert.equal(manifest.status, 'dry-run');
  assert.equal(manifest.mastersPublished, 0);
  assert.deepEqual(await readdir(masterRoot), ['2026-03-30-existing-brief.md']);
  const stored = JSON.parse(
    await readFile(path.join(root, 'content-automation', 'state', 'content-index.json'), 'utf8'),
  );
  assert.equal(stored.length, 1);
  await rm(root, { recursive: true, force: true });
});

test('an opted-in pipeline commit attaches only the aligned DBIE link', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  await writeFile(
    path.join(root, 'content-automation', 'config', 'thesis_topics.json'),
    JSON.stringify({ clusters: ['credit-growth'], angles: ['what-changed'] }),
    'utf8',
  );
  await writeFile(
    path.join(root, 'content-automation', 'config', 'source_registry.json'),
    JSON.stringify([
      'https://www.mohfw.gov.in/',
      'https://www.rbi.org.in/Scripts/NotificationUser.aspx',
      CANONICAL_DBIE_URL,
    ]),
    'utf8',
  );

  const { manifest } = await runContentPipeline({
    root,
    allowWrite: true,
    masterTarget: 1,
    now: new Date('2026-04-02T00:00:00.000Z'),
  });

  assert.equal(manifest.status, 'success');
  assert.equal(manifest.mastersPublished, 1);
  const names = await readdir(masterRoot);
  assert.equal(names.length, 1);
  const body = await readFile(path.join(masterRoot, names[0]), 'utf8');
  assert.match(body, new RegExp(CANONICAL_DBIE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(body.includes('mohfw.gov.in'), false);
  assert.equal(body.includes('NotificationUser.aspx'), false);
  assert.equal(body.includes('DBIE.spx'), false);
  const stored = JSON.parse(
    await readFile(path.join(root, 'content-automation', 'state', 'content-index.json'), 'utf8'),
  );
  assert.equal(stored.length, 1);
  await rm(root, { recursive: true, force: true });
});

test('a registry that reintroduces DBIE.spx fails before any master is written', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  await writeFile(path.join(masterRoot, '2026-03-30-existing-brief.md'), SAMPLE_MASTER, 'utf8');
  await writeFile(
    path.join(root, 'content-automation', 'config', 'thesis_topics.json'),
    JSON.stringify({ clusters: ['credit-growth'], angles: ['what-changed'] }),
    'utf8',
  );
  await writeFile(
    path.join(root, 'content-automation', 'config', 'source_registry.json'),
    JSON.stringify(['https://www.rbi.org.in/Scripts/DBIE.spx']),
    'utf8',
  );

  await assert.rejects(
    () => runContentPipeline({ root, allowWrite: true, masterTarget: 1 }),
    /DBIE\.aspx/,
  );
  assert.deepEqual(await readdir(masterRoot), ['2026-03-30-existing-brief.md']);
  await rm(root, { recursive: true, force: true });
});

test('diverse expansion dry-run does not append masters', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  await writeFile(path.join(masterRoot, '2026-03-30-existing-brief.md'), SAMPLE_MASTER, 'utf8');
  await writeFile(
    path.join(root, 'content-automation', 'config', 'thesis_topics_diverse.json'),
    JSON.stringify({ clusters: ['pharma-and-biotech'], angles: ['market-signal-brief'] }),
    'utf8',
  );
  await writeFile(
    path.join(root, 'content-automation', 'config', 'source_registry_diverse.json'),
    JSON.stringify({
      government: ['https://www.mnre.gov.in/', 'https://www.mohfw.gov.in/'],
      consulting: ['https://www.mckinsey.com/in/our-insights'],
      investmentBanks: [],
      multilaterals: [],
    }),
    'utf8',
  );

  const { manifest } = await runDiverseExpansion({
    root,
    allowWrite: false,
    targetTotal: 2,
    now: new Date('2026-04-02T00:00:00.000Z'),
  });

  assert.equal(manifest.status, 'dry-run');
  assert.equal(manifest.additionalMastersGenerated, 0);
  assert.deepEqual(await readdir(masterRoot), ['2026-03-30-existing-brief.md']);
  const stored = JSON.parse(
    await readFile(path.join(root, 'content-automation', 'state', 'content-index.json'), 'utf8'),
  );
  assert.equal(stored.length, 1);
  await rm(root, { recursive: true, force: true });
});

test('an opted-in diverse expansion omits topically unrelated hosts', async () => {
  const root = await makeRoot();
  const masterRoot = path.join(root, 'src', 'content', 'blog', 'en');
  await writeFile(
    path.join(root, 'content-automation', 'config', 'thesis_topics_diverse.json'),
    JSON.stringify({ clusters: ['pharma-and-biotech'], angles: ['market-signal-brief'] }),
    'utf8',
  );
  await writeFile(
    path.join(root, 'content-automation', 'config', 'source_registry_diverse.json'),
    JSON.stringify({
      government: ['https://www.mnre.gov.in/', 'https://www.mohfw.gov.in/'],
      consulting: ['https://www.mckinsey.com/in/our-insights'],
      investmentBanks: [],
      multilaterals: [],
    }),
    'utf8',
  );

  const { manifest } = await runDiverseExpansion({
    root,
    allowWrite: true,
    targetTotal: 1,
    now: new Date('2026-04-02T00:00:00.000Z'),
  });

  assert.equal(manifest.status, 'success');
  const names = await readdir(masterRoot);
  assert.equal(names.length, 1);
  const body = await readFile(path.join(masterRoot, names[0]), 'utf8');
  assert.match(body, /mohfw\.gov\.in/);
  assert.equal(body.includes('mnre.gov.in'), false);
  assert.equal(body.includes('mckinsey.com'), false);
  const stored = JSON.parse(
    await readFile(path.join(root, 'content-automation', 'state', 'content-index.json'), 'utf8'),
  );
  assert.equal(stored.length, 1);
  await rm(root, { recursive: true, force: true });
});

test('discardStaging removes a staging directory', async () => {
  const stagingDir = await mkdtemp(path.join(os.tmpdir(), 'gic-discard-'));
  await writeFile(path.join(stagingDir, 'orphan.md'), 'x', 'utf8');
  await discardStaging(stagingDir);
  await assert.rejects(() => readdir(stagingDir));
});
