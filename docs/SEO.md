# SEO

Published pages are English. A language code in a file name or in frontmatter is not a translation.

## Indexable URLs

The sitemap may list only:

- `https://greatindiancompany.com/`
- `https://greatindiancompany.com/blog`
- `https://greatindiancompany.com/blog/<english-slug>`

English briefs live in `src/content/blog/en/`. Each one has `lang: "en"` and `translationOf: null`. Layouts set `<html lang="en">`. There is no `hreflang` set.

## Language-tagged templates

`content-automation/generated-translations/<code>/` holds 22 copies of the English briefs, one directory per code in `content-automation/config/languages.json`. The body stays English. The frontmatter sets `lang` to that code and the slug ends in `-<code>`.

Those files are not localized articles. The build does not write HTML for them. `scripts/generate-sitemap.mjs` does not add their URLs. After the URL list is built, `assertSitemapOmitsGeneratedTranslations` fails the build if any `<loc>` matches one of those slugs or ends with a code from `languages.json`.

`content:run` and `content:expand:800` write new English briefs only through `writeEnglishBrief`. That helper refuses:

- any path under `content-automation/generated-translations/`
- any path outside `src/content/blog/en/`
- `lang` other than `en`
- a slug that ends with a template language code

Copying a template into `src/content/blog/` does not make it indexable. Astro 4 loads `src/content/config.ts`. That schema accepts `lang: "en"` and `translationOf: null` only. `slug` stays in the markdown frontmatter; Astro treats it as the entry slug, so it is not repeated in the schema. The sitemap step also rejects a language-code suffix.

## hreflang

Do not add `hreflang`, alternate language links, or a language switcher for these templates. Add them only after a brief is written in that language and reviewed as such.

## robots.txt

`public/robots.txt` allows crawlers and points at `https://greatindiancompany.com/sitemap-index.xml`. That sitemap is the English URL list above.

## Asset budget

`npm run build` counts files in `dist` and fails above 10,000. Workers Free allows 20,000 static assets per Worker version. Keeping the templates out of `dist` is what holds the build under that budget. Do not raise the budget until a paid Workers plan is confirmed.

## Citations and lastmod

The indexable set above is unchanged. A registry URL is rendered only when its site matches the brief topic. Unmatched links are omitted, and the page does not add a replacement source.

Sitemap `lastmod` is the brief `updatedDate` or `publishDate` when that calendar date is real and not in the future. The homepage omits `lastmod`. Drafts are not listed. Canonical links use the apex host `https://greatindiancompany.com`.

`npm run content:run` can still append English masters; it is not part of the site build.
