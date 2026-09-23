import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { applyBriefHonesty } from '../src/lib/brief-honesty-remark.mjs';
import { filterTopicalSources, honestDescription, isTopicalCitation } from '../src/lib/citation-honesty.mjs';
import {
  buildSitemapIndex,
  buildUrlset,
  collectSitemapPages,
  isIndexableBrief,
  normalizeLastmod,
  unpublishedBlogSlugs,
} from './sitemap-honesty.mjs';

const healthcare = {
  title: 'Healthcare Access In India: For Policy Teams (753)',
  tags: ['healthcare-access', 'for-policy-teams', 'india-briefs'],
  slug: 'healthcare-access-for-policy-teams-education-gov-20260330-753',
};

test('rotated off-topic registry links are not treated as citations', () => {
  const links = ['https://www.education.gov.in/', 'https://www.jpmorgan.com/insights'];
  assert.equal(isTopicalCitation(links[0], healthcare), false);
  assert.equal(isTopicalCitation(links[1], healthcare), false);
  assert.deepEqual(filterTopicalSources(links, healthcare), []);
});

test('a domain match can stay, and a slug that names the registry does not create a match', () => {
  assert.deepEqual(
    filterTopicalSources(['https://www.mohfw.gov.in/', 'https://www.education.gov.in/'], healthcare),
    ['https://www.mohfw.gov.in/'],
  );

  const credit = {
    title: 'Credit Growth: What Changed Guide (5)',
    tags: ['credit-growth', 'what-changed'],
  };
  assert.equal(
    isTopicalCitation('https://www.rbi.org.in/Scripts/DBIE.aspx', credit),
    true,
  );
  assert.equal(
    isTopicalCitation('https://www.rbi.org.in/Scripts/DBIE.aspx', {
      title: 'Employment And Skills: Risk Watch (80)',
      tags: ['employment-and-skills', 'risk-watch'],
    }),
    false,
  );
  assert.equal(
    isTopicalCitation('https://www.rbi.org.in/Scripts/StateFinances.aspx', {
      title: 'State Finance: Long Term Trend (48)',
      tags: ['state-finance', 'long-term-trend'],
    }),
    true,
  );
});

test('descriptions drop source and evidence claims without inventing a new citation', () => {
  assert.equal(
    honestDescription('Original summary on Credit Growth focused on What Changed with primary-source links.'),
    'Original summary on Credit Growth focused on What Changed.',
  );
  assert.equal(
    honestDescription('A high-level India brief using inputs from education-gov and jpmorgan.'),
    'A high-level India brief.',
  );
  assert.equal(
    honestDescription('Evidence-based analysis of agri-value-chains in India with practical implications.'),
    'English template brief. This page does not verify sources or report a checked shift.',
  );
  assert.equal(honestDescription('Evidence-based analysis of agri.').includes('education.gov'), false);
});

test('rendered briefs drop source-backed sections and verifiable-shift wording', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'The narrative focuses on verifiable shifts rather than speculation.' }],
      },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: 'Source-Backed Reading Path' }],
      },
      {
        type: 'list',
        children: [
          {
            type: 'listItem',
            children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Start with the primary release.' }] }],
          },
        ],
      },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: 'Primary Sources' }],
      },
      {
        type: 'list',
        children: [
          {
            type: 'listItem',
            children: [{ type: 'paragraph', children: [{ type: 'text', value: 'https://www.education.gov.in/' }] }],
          },
        ],
      },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: 'Editorial Note' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value:
              'This article is an original synthesis prepared for Great Indian Company using publicly available primary sources.',
          },
        ],
      },
    ],
  };

  applyBriefHonesty(tree);
  const serialized = JSON.stringify(tree);
  assert.equal(serialized.includes('verifiable shifts'), false);
  assert.equal(serialized.includes('Source-Backed'), false);
  assert.equal(serialized.includes('Primary Sources'), false);
  assert.equal(serialized.includes('education.gov.in'), false);
  assert.equal(serialized.includes('does not check registry documents'), true);
  assert.equal(serialized.includes('Editorial Note'), true);
});

test('sitemap lists published English pages only and keeps real lastmod dates', () => {
  const translationSlugs = new Set(['rbi-monetary-policy-risk-watch-20260330-071-hi']);
  const built = new Set(['/', '/blog', '/blog/credit-growth-what-changed-20260330-005']);
  const pages = collectSitemapPages({
    briefs: [
      {
        slug: 'credit-growth-what-changed-20260330-005',
        lang: 'en',
        draft: 'false',
        publishDate: '2026-03-30',
        updatedDate: '2026-03-30',
      },
      {
        slug: 'draft-note',
        lang: 'en',
        draft: 'true',
        publishDate: '2026-03-30',
        updatedDate: '2026-04-01',
      },
      {
        slug: 'future-note',
        lang: 'en',
        draft: 'false',
        publishDate: '2026-12-01',
        updatedDate: '2026-12-01',
      },
      {
        slug: 'hindi-copy',
        lang: 'hi',
        draft: 'false',
        publishDate: '2026-03-30',
        updatedDate: '2026-03-30',
      },
      {
        slug: 'rbi-monetary-policy-risk-watch-20260330-071-hi',
        lang: 'en',
        draft: 'false',
        publishDate: '2026-03-30',
        updatedDate: '2026-03-30',
      },
      {
        slug: 'missing-html',
        lang: 'en',
        draft: 'false',
        publishDate: '2026-03-30',
        updatedDate: '2026-03-31',
      },
    ],
    translationSlugs,
    today: '2026-09-23',
    siteUrl: 'https://greatindiancompany.com',
    pageExists: (urlPath) => built.has(urlPath),
  });

  assert.deepEqual(
    pages.map((entry) => entry.loc),
    [
      'https://greatindiancompany.com/',
      'https://greatindiancompany.com/blog',
      'https://greatindiancompany.com/blog/credit-growth-what-changed-20260330-005',
    ],
  );
  assert.equal(pages[0].lastmod, undefined);
  assert.equal(pages[1].lastmod, '2026-03-30');
  assert.equal(pages[2].lastmod, '2026-03-30');
  assert.equal(JSON.stringify(pages).includes('2026-09-23'), false);
  assert.equal(normalizeLastmod('2026-02-31'), null);
  assert.equal(
    isIndexableBrief(
      { slug: 'draft-note', lang: 'en', draft: 'true', publishDate: '2026-03-30' },
      { translationSlugs, today: '2026-09-23' },
    ),
    false,
  );

  const xml = buildUrlset(pages);
  const index = buildSitemapIndex('https://greatindiancompany.com/sitemap-0.xml', '2026-03-30');
  assert.match(xml, /<loc>https:\/\/greatindiancompany.com\/<\/loc>\n  <\/url>/);
  assert.equal(xml.includes('<lastmod>2026-09-23</lastmod>'), false);
  assert.match(index, /<lastmod>2026-03-30<\/lastmod>/);
  assert.equal(/\d{4}-\d{2}-\d{2}T/.test(index), false);

  const hidden = unpublishedBlogSlugs(
    ['credit-growth-what-changed-20260330-005', 'rbi-monetary-policy-risk-watch-20260330-071-hi', 'draft-note'],
    new Set(['credit-growth-what-changed-20260330-005']),
  );
  assert.deepEqual(hidden, ['rbi-monetary-policy-risk-watch-20260330-071-hi', 'draft-note']);
});

test('generators and public templates do not claim translations, source-backed readings, or verifiable shifts', () => {
  const pipeline = readFileSync(
    path.join(process.cwd(), 'content-automation/scripts/run-content-pipeline.mjs'),
    'utf8',
  );
  const expand = readFileSync(
    path.join(process.cwd(), 'content-automation/scripts/expand-to-800-diverse.mjs'),
    'utf8',
  );
  const blogPost = readFileSync(path.join(process.cwd(), 'src/pages/blog/[slug].astro'), 'utf8');
  const blogIndex = readFileSync(path.join(process.cwd(), 'src/pages/blog/index.astro'), 'utf8');
  const layout = readFileSync(path.join(process.cwd(), 'src/layouts/BlogLayout.astro'), 'utf8');
  const home = readFileSync(path.join(process.cwd(), 'src/layouts/Layout.astro'), 'utf8');

  for (const source of [pipeline, expand, blogPost, blogIndex, layout]) {
    assert.equal(/verifiable shifts/i.test(source), false, source.slice(0, 40));
    assert.equal(/source-backed/i.test(source), false);
    assert.equal(/primary sources/i.test(source), false);
    assert.equal(/primary-source/i.test(source), false);
  }

  assert.match(pipeline, /writeEnglishBrief/);
  assert.match(expand, /writeEnglishBrief/);
  assert.match(blogIndex, /not translations/);
  assert.match(blogPost, /post\.slug/);
  const sitemap = readFileSync(path.join(process.cwd(), 'scripts/generate-sitemap.mjs'), 'utf8');
  assert.match(sitemap, /assertSitemapOmitsGeneratedTranslations/);
  assert.match(sitemap, /languageSuffixOfSlug/);
  const schema = readFileSync(path.join(process.cwd(), 'src/content/config.ts'), 'utf8');
  assert.match(schema, /lang: z\.literal\('en'\)/);
  assert.match(home, /canonical" href="https:\/\/greatindiancompany.com"/);
  assert.equal(home.includes('www.greatindiancompany.com'), false);
  assert.equal(layout.includes('www.greatindiancompany.com'), false);
  assert.equal(blogPost.includes('noindex'), false);
});
