import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  assertWithinWorkersFreeAssetBudget,
  slugFromTranslationFilename,
  STATIC_ASSET_FILE_BUDGET,
  withNoindex,
  WORKERS_FREE_STATIC_ASSET_LIMIT,
} from './localization-policy.mjs';

const SITE_URL = 'https://greatindiancompany.com';
const ROOT = process.cwd();
const MASTER_ROOT = path.join(ROOT, 'src', 'content', 'blog', 'en');
const TRANSLATION_ROOT = path.join(ROOT, 'content-automation', 'generated-translations');
const DIST_ROOT = path.join(ROOT, 'dist');

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function field(frontmatter, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = frontmatter.match(new RegExp(`^${escaped}:\\s*(.*)$`, 'm'));
  if (!match) {
    return null;
  }

  return match[1].replace(/^"|"$/g, '').trim();
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  return match ? match[1] : '';
}

function normalizeDate(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

async function listMasterFiles(dir) {
  try {
    const names = await fs.readdir(dir);
    return names.filter((name) => name.endsWith('.md')).map((name) => path.join(dir, name));
  } catch {
    return [];
  }
}

async function listTranslationFiles(root) {
  const out = [];
  let dirs = [];
  try {
    dirs = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const dir of dirs) {
    if (!dir.isDirectory()) {
      continue;
    }

    const dirPath = path.join(root, dir.name);
    let names = [];
    try {
      names = await fs.readdir(dirPath);
    } catch {
      continue;
    }

    for (const name of names) {
      if (name.endsWith('.md')) {
        out.push(path.join(dirPath, name));
      }
    }
  }

  return out;
}

function buildUrlset(urlEntries) {
  const nodes = urlEntries
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</urlset>
`;
}

function buildSitemapIndex(sitemapLoc) {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${xmlEscape(sitemapLoc)}</loc>
    <lastmod>${xmlEscape(now)}</lastmod>
  </sitemap>
</sitemapindex>
`;
}

function blogSlugFromLoc(loc) {
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
  return slug || null;
}

async function noindexLeftoverTranslationPages(translationSlugs) {
  const blogDir = path.join(DIST_ROOT, 'blog');
  let names = [];
  try {
    names = await fs.readdir(blogDir);
  } catch {
    return 0;
  }

  const present = new Set(names);
  let patched = 0;

  for (const slug of translationSlugs) {
    if (!present.has(slug)) {
      continue;
    }

    const pagePath = path.join(blogDir, slug, 'index.html');
    let html;
    try {
      html = await fs.readFile(pagePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }

    const next = withNoindex(html);
    if (next !== html) {
      await fs.writeFile(pagePath, next, 'utf8');
    }
    patched += 1;
  }

  return patched;
}

async function countFiles(dir) {
  let count = 0;

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
        count += 1;
      }
    }
  }

  await walk(dir);
  return count;
}

async function main() {
  const masterFiles = await listMasterFiles(MASTER_ROOT);
  const translationFiles = await listTranslationFiles(TRANSLATION_ROOT);
  const translationSlugs = new Set(
    translationFiles.map((filePath) => slugFromTranslationFilename(path.basename(filePath))),
  );
  const pages = [
    { loc: `${SITE_URL}/`, lastmod: new Date().toISOString().slice(0, 10) },
    { loc: `${SITE_URL}/blog`, lastmod: new Date().toISOString().slice(0, 10) },
  ];

  for (const filePath of masterFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    const frontmatter = parseFrontmatter(raw);
    const slug = field(frontmatter, 'slug');
    if (!slug || translationSlugs.has(slug)) {
      continue;
    }

    if (field(frontmatter, 'draft') === 'true') {
      continue;
    }

    const updatedDate = normalizeDate(field(frontmatter, 'updatedDate') || field(frontmatter, 'publishDate'));
    pages.push({
      loc: `${SITE_URL}/blog/${slug}`,
      lastmod: updatedDate,
    });
  }

  const indexablePages = pages.filter((entry) => {
    const slug = blogSlugFromLoc(entry.loc);
    return !slug || !translationSlugs.has(slug);
  });

  await fs.mkdir(DIST_ROOT, { recursive: true });
  await fs.writeFile(path.join(DIST_ROOT, 'sitemap-0.xml'), buildUrlset(indexablePages), 'utf8');
  await fs.writeFile(
    path.join(DIST_ROOT, 'sitemap-index.xml'),
    buildSitemapIndex(`${SITE_URL}/sitemap-0.xml`),
    'utf8',
  );

  const noindexed = await noindexLeftoverTranslationPages(translationSlugs);
  const distFileCount = await countFiles(DIST_ROOT);
  assertWithinWorkersFreeAssetBudget(distFileCount);

  console.log(
    `Sitemap generated: ${indexablePages.length} URLs | translation HTML written: 0 | language-tagged templates excluded: ${translationSlugs.size} | leftover translation pages noindexed: ${noindexed} | dist files: ${distFileCount} (budget ${STATIC_ASSET_FILE_BUDGET}, Workers Free limit ${WORKERS_FREE_STATIC_ASSET_LIMIT})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
