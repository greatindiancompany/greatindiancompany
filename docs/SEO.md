# SEO

Published English briefs stay English. A language code on a file under `content-automation/generated-translations/` is not a translation. A reviewed translation is a separate file under `src/content/blog/<lang>/` that follows the naming contract below.

## Indexable URLs

The sitemap may list:

- `https://greatindiancompany.com/`
- `https://greatindiancompany.com/blog`
- `https://greatindiancompany.com/blog/<english-slug>`
- `https://greatindiancompany.com/blog/<english-slug>-<lang>` for a reviewed, non-draft translation

English briefs live in `src/content/blog/en/`. Each one has `lang: "en"` and `translationOf: null`. English pages set `<html lang="en" dir="ltr">`. An English page emits `hreflang` only when at least one reviewed translation of that id is published.

## Language-tagged templates

`content-automation/generated-translations/<code>/` holds 22 copies of the English briefs, one directory per code in `content-automation/config/languages.json`. The body stays English. The frontmatter sets `lang` to that code and the slug ends in `-<code>`.

Those files are not localized articles. The build does not write HTML for them. `scripts/generate-sitemap.mjs` does not add their URLs. After the URL list is built, `assertSitemapOmitsGeneratedTranslations` fails the build if any `<loc>` matches one of those slugs or ends with a code from `languages.json`.

`content:run` and `content:expand:800` write new English briefs only through `writeEnglishBrief`. That helper refuses:

- any path under `content-automation/generated-translations/`
- any path outside `src/content/blog/en/`
- `lang` other than `en`
- a slug that ends with a template language code

Copying a template into `src/content/blog/` does not make it indexable. Astro 4 loads `src/content/config.ts`. English entries still require `lang: "en"` and `translationOf: null`. A scheduled language code is accepted only when `translationOf` is a non-empty English id. `slug` stays in the markdown frontmatter; Astro treats it as the entry slug, so it is not repeated in the schema. The sitemap still rejects a language-code suffix that is not a reviewed translation in `src/content/blog/<lang>/`.

`writeEnglishBrief` still refuses to mint a translation. A reviewed translation is a hand-written file. The content pipeline cannot create one.

## Reviewed translations

`src/lib/i18n-languages.mjs` reads `content-automation/config/languages.json` and attaches script, direction, hreflang, Noto font, and quality tier for all 22 codes: `as`, `bn`, `brx`, `doi`, `gu`, `hi`, `kn`, `kok`, `ks`, `mai`, `ml`, `mni`, `mr`, `ne`, `or`, `pa`, `sa`, `sat`, `sd`, `ta`, `te`, `ur`.

Naming contract, checked by the page build and the sitemap:

- File: `src/content/blog/<lang>/<english-filename-without-.md>-<lang>.md`
- `id`: `<english-id>-<lang>`
- `slug`: `<english-slug>-<lang>`
- `lang` equals the folder name and is one of those 22 codes
- `translationOf` is the English id
- URL: `/blog/<english-slug>-<lang>`

If that English id is not on the current branch, the build warns and skips `hreflang` pairing. It still refuses a wrong `lang`, an unknown language code, or a wrong slug suffix. Drafts are not routed and are not listed.

The page sets `<html lang="<code>" dir="ltr|rtl">` (`rtl` for `ur`, `ks`, and `sd`). The canonical URL is the page itself. Only the Noto stylesheet for that page's script is added. A short note says the page is a machine-assisted translation and links to the English original when that page exists. The language switcher lists only the languages that exist for that English id.

## hreflang

Do not add `hreflang` for `content-automation/generated-translations/`. On an English page and on each reviewed translation of that English id, emit `en`, `x-default` (the English URL), and one alternate for every language that has a non-draft translation. Emit nothing else. An English page with no translation emits no `hreflang`.

## robots.txt

`public/robots.txt` allows crawlers and points at `https://greatindiancompany.com/sitemap-index.xml`.

## Asset budget

`npm run build` counts files in `dist` and fails above 10,000. Workers Free allows 20,000 static assets per Worker version. `STATIC_ASSET_FILE_BUDGET` stays 10,000. Keeping the generated-translation stubs out of `dist` is what holds today's build under that budget.

A full rollout is 800 English pages plus up to 17,600 translated static pages. That exceeds 10,000 files. Serving those translations on demand from the existing Worker, or a paid Workers plan, is a founder decision. Do not raise the budget until that decision is made.

## Citations and lastmod

A registry URL is rendered only when its site matches the brief topic. Unmatched links are omitted, and the page does not add a replacement source.

Sitemap `lastmod` is the brief `updatedDate` or `publishDate` when that calendar date is real and not in the future. The homepage omits `lastmod`. Drafts are not listed. Canonical links use the apex host `https://greatindiancompany.com`.

`npm run content:run` can still append English masters; it is not part of the site build.
