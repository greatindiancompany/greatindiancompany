/**
 * Language-tagged files under content-automation/generated-translations/ are
 * English templates. They are not translations. The site build must not emit
 * HTML for them or list them in the sitemap. If a leftover HTML file for one
 * of those slugs is already in dist, it is marked noindex.
 */

export const WORKERS_FREE_STATIC_ASSET_LIMIT = 20000;

/**
 * Fail the build well below the Free cap. Paid Workers allow 100,000 files.
 * Do not raise this budget until that plan is confirmed.
 */
export const STATIC_ASSET_FILE_BUDGET = 10000;

export const NOINDEX_ROBOTS_META = '<meta name="robots" content="noindex, nofollow" />';

const NOINDEX_META_PATTERN = /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i;

export function slugFromTranslationFilename(filename) {
  const base = filename.replace(/\.mdx?$/i, '');
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function withNoindex(html) {
  if (typeof html !== 'string' || html.length === 0) {
    return html;
  }

  if (NOINDEX_META_PATTERN.test(html)) {
    return html;
  }

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (open) => `${open}\n    ${NOINDEX_ROBOTS_META}`);
  }

  return `${NOINDEX_ROBOTS_META}\n${html}`;
}

export function assertWithinWorkersFreeAssetBudget(fileCount) {
  if (!Number.isInteger(fileCount) || fileCount < 0) {
    throw new Error(`Asset file count must be a non-negative integer. Received ${fileCount}.`);
  }

  if (fileCount > STATIC_ASSET_FILE_BUDGET || fileCount > WORKERS_FREE_STATIC_ASSET_LIMIT) {
    throw new Error(
      `Refusing to finish the build: dist contains ${fileCount} files, above the budget of ${STATIC_ASSET_FILE_BUDGET}. Workers Free allows ${WORKERS_FREE_STATIC_ASSET_LIMIT} static assets per Worker version. Language-tagged English templates must stay out of dist. Confirm a paid Workers plan before raising STATIC_ASSET_FILE_BUDGET.`,
    );
  }
}
