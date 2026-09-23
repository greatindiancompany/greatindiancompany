/**
 * Sitemap entries follow pages that are actually published.
 * lastmod is included only when the brief has a real calendar date.
 */

export function normalizeLastmod(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function maxLastmod(values) {
  const dates = values.map((value) => normalizeLastmod(value)).filter(Boolean);
  if (dates.length === 0) {
    return null;
  }
  return dates.sort().at(-1);
}

export function isIndexableBrief(brief, { translationSlugs, today }) {
  if (!brief || typeof brief.slug !== 'string' || brief.slug.trim() === '') {
    return false;
  }

  const slug = brief.slug.trim();
  if (translationSlugs?.has(slug)) {
    return false;
  }

  if (brief.draft === true || brief.draft === 'true') {
    return false;
  }

  if (brief.lang !== 'en') {
    return false;
  }

  const published = normalizeLastmod(brief.publishDate);
  if (!published || published > today) {
    return false;
  }

  return true;
}

export function lastmodForBrief(brief, today) {
  const updated = normalizeLastmod(brief?.updatedDate);
  if (updated && updated <= today) {
    return updated;
  }

  const published = normalizeLastmod(brief?.publishDate);
  if (published && published <= today) {
    return published;
  }

  return null;
}

export function collectSitemapPages({ briefs, translationSlugs, today, siteUrl, pageExists }) {
  const pages = [];
  if (pageExists('/')) {
    pages.push({ loc: `${siteUrl}/` });
  }

  const posts = [];
  for (const brief of briefs) {
    if (!isIndexableBrief(brief, { translationSlugs, today })) {
      continue;
    }

    const urlPath = `/blog/${brief.slug}`;
    if (!pageExists(urlPath)) {
      continue;
    }

    const entry = { loc: `${siteUrl}${urlPath}` };
    const lastmod = lastmodForBrief(brief, today);
    if (lastmod) {
      entry.lastmod = lastmod;
    }
    posts.push(entry);
  }

  if (pageExists('/blog')) {
    const blog = { loc: `${siteUrl}/blog` };
    const lastmod = maxLastmod(posts.map((entry) => entry.lastmod));
    if (lastmod) {
      blog.lastmod = lastmod;
    }
    pages.push(blog);
  }

  pages.push(...posts);
  return pages;
}

export function unpublishedBlogSlugs(distSlugs, indexableSlugs) {
  const indexable = indexableSlugs instanceof Set ? indexableSlugs : new Set(indexableSlugs);
  return [...distSlugs].filter((slug) => slug && slug !== 'index.html' && !indexable.has(slug));
}

export function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildUrlset(urlEntries) {
  const nodes = urlEntries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</urlset>
`;
}

export function buildSitemapIndex(sitemapLoc, lastmod) {
  const lastmodNode = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${xmlEscape(sitemapLoc)}</loc>${lastmodNode}
  </sitemap>
</sitemapindex>
`;
}
