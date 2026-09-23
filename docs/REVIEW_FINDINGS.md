# Review findings

Date: 2026-09-23. Scope: full tree of `greatindiancompany/greatindiancompany` on `main` (brand/entity lander). Shopify app repositories were not in this tree and were not reviewed.

This pass read the source, configs, automation scripts, and a sample of generated content. It ran `npm ci --ignore-scripts` and `npm audit`. It did not run `astro build`, `wrangler deploy`, or the content scripts. Deploy file counts below are estimates from the generators, not a measured `dist/`.

No fixes are included except `AGENTS.md` and this document.

## Snapshot

| Surface | What is in the tree |
| --- | --- |
| Site | Astro 4.16.19, `output: 'static'`, site `https://greatindiancompany.com` |
| Worker | `giclander` in `wrangler.jsonc`; `worker.js` returns `env.ASSETS.fetch(request)` |
| English briefs | 800 markdown files in `src/content/blog/en/` |
| Language files | 17,600 markdown files in `content-automation/generated-translations/` (22 dirs × 800) |
| Pages | Lander, `/blog`, `/blog/[slug]` for English only; translation HTML is written after the Astro build |
| CI | No workflow files under `.github/` |
| Secrets in git | None found. `.gitignore` covers `.env*` and `.dev.vars*` |

## P0

### 1. Indexable pages claim to be translations and are English templates

`content-automation/scripts/run-content-pipeline.mjs` and `expand-to-800-diverse.mjs` write "translations" by prefixing the English title with a language name. The body stays English. Example: `content-automation/generated-translations/hi/2026-03-30-rbi-monetary-policy-risk-watch-20260330-071-hi.md` has `lang: "hi"` and the sentence "This Hindi edition preserves the meaning of the English master article…".

`scripts/generate-sitemap.mjs` then emits an HTML page for every one of those 17,600 files, sets `<html lang="…">` from frontmatter, and adds each URL to `sitemap-0.xml`. `public/robots.txt` allows all crawlers and points at that sitemap.

English masters are the same pattern: a shared template with the cluster and angle interpolated. All 800 English bodies hash differently because the title is interpolated, and the section structure is the same. Copy asserts "verifiable shifts" and "source-backed" claims. The scripts never fetch a source. There is no `fetch` in `content-automation/scripts/`.

Recommendation: keep these URLs out of the sitemap and add `noindex` until a page is a real localized article. Treat another `npm run content:run` as a content incident, not a routine build step.

## P1

### 2. Citations are rotated independently of the topic

`run-content-pipeline.mjs` assigns `sourceLinks` by index into `source_registry.json`, not by subject. The RBI monetary-policy example above cites `https://www.irdai.gov.in/` and `https://www.sebi.gov.in/`. Of 20 English files whose names start with `rbi-`, 12 do not contain `rbi.org.in` in the frontmatter-plus-opening. Registry entry `https://www.rbi.org.in/Scripts/DBIE.spx` is missing the `a` in `aspx`.

`CONTENT_AUTOMATION_PLAN.md` requires factual checks against cited excerpts and an approved-domain policy. The scripts check file counts only.

Recommendation: stop publishing a source URL that the body does not actually use. Fix or drop `DBIE.spx`. Add a check that the cited host matches the topic before any new files are written.

### 3. `content:run` appends forever and publishes before validation

`run-content-pipeline.mjs` targets 100 new masters and 2,200 new translations on every success. It writes each file under `src/content/blog/en/` and `content-automation/generated-translations/` immediately. The count check runs afterward. On failure it throws and leaves the files in place. The plan's staging and all-or-nothing rules are not implemented.

`expand-to-800-diverse.mjs` does stop at 800 masters. That cap is already reached (`existing` path returns a no-op). `content:run` has no such cap. One more run adds 2,300 markdown files and, after `npm run build`, about 2,300 more HTML files.

`content-automation/state/content-index.json` is `[]`. `coverage-map.json` records `existingArticleCount: 0` at `2026-03-30T01:23:41.760Z` because the scan runs before the new files are written and is never refreshed. Deduping against that index does not see the 800 live masters.

Recommendation: do not run `npm run content:run` until it writes to a staging directory, refreshes the index after the write, and rolls back on a failed count. The current script will grow the corpus on every invocation.

### 4. Built file count sits against the Workers Free asset cap

A full `npm run build` emits roughly:

- 1 home page, 1 blog index, 800 English post pages
- 17,600 translation HTML pages from `generate-sitemap.mjs`
- 2 sitemap XML files plus the files copied from `public/`

That is about 18,400 files. [Workers static asset limits](https://developers.cloudflare.com/workers/platform/limits/#static-assets) are 20,000 files per version on the Free plan and 100,000 on Paid. Individual files must stay under 25 MiB. This repo's Wrangler is 4.78.0, which is new enough for the higher paid cap. The account plan is not in the repo. One additional `content:run` (about 2,300 HTML files) crosses 20,000.

Recommendation: confirm the Cloudflare plan before the next content expansion or production deploy. Split sitemaps if a single `sitemap-0.xml` grows toward the sitemap protocol cap (50,000 URLs or 50 MB). 18,402 URLs is under that cap today.

### 5. Production deploy is one npm script, with no environment split

`package.json` `deploy` is `npm run build && wrangler deploy`. `wrangler.jsonc` has:

- `name`: `giclander`
- `main`: `worker.js`
- `assets.directory`: `dist`
- no `routes`, no custom domains, no `account_id`, no `workers_dev` flag

`public/.assetsignore` excludes `_worker.js` and `_routes.json`, so an adapter-generated worker would be dropped if one appeared in `dist`. The live custom domain for greatindiancompany.com is not described in this repo. `npm run deploy` still publishes worker `giclander` with whatever credentials the environment has.

Canonical host strings disagree. Astro `site`, sitemaps, `robots.txt`, and the layout canonicals use `https://greatindiancompany.com`. `package.json` `homepage` and the README live link use `https://www.greatindiancompany.com`. No redirect or host canonicalization exists in `worker.js`.

Recommendation: founder-gate `wrangler deploy`. Add an explicit preview vs production config only when the founder wants that change. Pick one host and redirect the other at the edge. Do not infer the redirect target from the README alone.

### 6. `@astrojs/cloudflare` is installed and unused; Astro 4.16.19 is far behind audit fixes

`astro.config.mjs` does not register the adapter. The running worker is the three-line asset proxy in `worker.js`. README line "Astro with Cloudflare adapter" describes a dependency, not the build.

`npm audit` on the lockfile (2026-09-23): 1 critical, 13 high, 4 moderate, 1 low.

The critical advisory is [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) (Astro AVIF image-optimization RCE), range `<=7.2.7`. This repo does not use `astro:assets` or an image service, and `output` is `static`, so that endpoint is not on the request path. `@astrojs/cloudflare` 11.2.0 is flagged high for SSRF on `/_image` (`<=13.1.9`). That route is also absent while the adapter is unwired. Other highs sit in the install tree (`wrangler`, `miniflare`, `undici`, `sharp`, `vite`, `postcss`, `js-yaml`, `devalue`, `ws`, `nanoid`, `defu`, `browserslist`). The adapter also nests its own Wrangler 3 beside the root Wrangler 4.

Recommendation: remove `@astrojs/cloudflare` until a page needs it, or upgrade it together with Astro before enabling the adapter or image optimization. Re-run `npm audit` after that change. Do not treat the current static asset worker as exposed to the image-endpoint advisories.

### 7. No CI, and the plan's pipeline does not exist

`.github/` contains issue templates and a pull request template. There is no Actions workflow, no `test` script, and no schema check in the build.

`CONTENT_AUTOMATION_PLAN.md` specifies scripts that are not in the repo (`scan-existing-content.mjs`, `generate-masters.mjs`, `generate-translations.mjs`, `validate-run.mjs`), a `content-automation/logs/` directory, language folders under `src/content/blog/<lang>/`, a daily cron, atomic publish, and translation quality gates. Translations actually live under `content-automation/generated-translations/<lang>/`. Section 1 contains the stray text "SPAWM 2300 AGENTS for this". Section 2 labels the exclusion list "in Scope" a second time.

English pages rendered by Astro and translation pages rendered by `generate-sitemap.mjs` are two implementations of the article chrome. Blog layout changes do not reach the 17,600 generated pages.

Recommendation: either delete the plan's unimplemented sections or mark them as design notes. Add a CI workflow that runs `npm run build` only after the founder accepts the cost of emitting ~18k HTML files. Add a frontmatter check for English masters (`src/content.config.ts` already has a Zod schema; the sitemap parser does not use it).

### 8. Language tags and direction are wrong for several scheduled languages

`generate-sitemap.mjs` hardcodes `dir="ltr"` for every translation page. `languages.json` includes Urdu (`ur`), Kashmiri (`ks`), and Sindhi (`sd`), which are written right to left. `lang` is set, and `hreflang` alternates are absent. `[slug].astro` filters to `lang === 'en'`, so the `isTranslation` branch in that page never renders.

Recommendation: set `dir` from the language code, and add `hreflang` only after the body is actually in that language. Until then, prefer `noindex` over alternate links.

## P2

### 9. Sitemap metadata and draft handling

`generate-sitemap.mjs` sets `lastmod` for `/` and `/blog` to the build date, so every build looks like a content change. It includes every markdown file that has a `slug`, including any future `draft: true` file. Astro's blog routes skip drafts. English and translation slugs do not collide today (`slug` vs `slug-<lang>`), and the 800 English slugs are unique.

### 10. Lander performance and third parties

`public/assets/images/bg-mobile.png` is 5.2 MB. The WebP beside it is 387 KB, and the picture element prefers WebP on coarse pointers. `public/assets/videos/bg.mp4` is 508 KB and is removed on those same pointers by the inline script in `src/pages/index.astro`.

The lander loads Google Fonts, Google Analytics `G-XRKSD0DYQ7`, and Microsoft Clarity `xioe2gmzjl` from `Layout.astro`. The blog layout loads Google Fonts and does not load Analytics or Clarity. There is no consent UI and no Content-Security-Policy. The ids are public measurement ids, not credentials.

`worker.js` adds no security headers (CSP, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`).

The assertion link in the lander `h1` is `href="#"`. Social links use `rel="noopener"` and omit `noreferrer`.

There is no `src/pages/404.astro`.

### 11. Dependency and repo hygiene

- `.gitignore` allows `.env.example` and `.dev.vars.example`. Neither file exists. No secrets are required to build the static site.
- `SECURITY.md` describes a private report path. `.github/ISSUE_TEMPLATE/config.yml` points at GitHub security advisories. That matches the policy.
- `CONTRIBUTING.md` invites general contributions. For a brand lander, founder review is still required before merge (`AGENTS.md`).
- Astro content config validates `sourceLinks` as URLs for files under `src/content/`. Generated translations skip that schema.
- Compatibility flags `nodejs_compat` and `global_fetch_strictly_public` are unused by `worker.js`. Observability enabled is consistent with a static asset worker.
- Homepage and blog use separate visual systems (`global.css` vs inline styles in `BlogLayout.astro` and a copied stylesheet inside `generate-sitemap.mjs`).

## What looks sound

- `worker.js` only serves the asset binding. It does not proxy arbitrary URLs.
- `.gitignore` excludes env files, Wrangler local state, `dist/`, and `node_modules/`.
- A search of tracked source for API keys, bearer tokens, and private keys did not find committed secrets. Analytics ids in `Layout.astro` are public.
- Translation HTML escapes text before autolinking, and autolinks are limited to `http` and `https`.
- English blog routes are generated from the content collection with a Zod schema, draft filter, and unique slugs.
- `content:expand:800` refuses to run once 800 masters exist, which matches the current corpus.

## Suggested order of work

1. Stop indexing template translations (P0). Do not run `content:run` again until citations and rollback exist (P1.2, P1.3).
2. Confirm the Cloudflare plan and the apex-vs-www host before the next `wrangler deploy` (P1.4, P1.5).
3. Remove or upgrade the unused Cloudflare adapter and Astro, then re-audit (P1.6).
4. Add CI for `npm run build`, and correct `CONTENT_AUTOMATION_PLAN.md` so it matches the two scripts that exist (P1.7).
5. RTL direction, security headers, the 5.2 MB PNG, and the dead `href="#"` can follow as small PRs (P1.8, P2).
