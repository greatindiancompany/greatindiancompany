# AGENTS.md

Instructions for Cursor Cloud Agents working in this repository.

## What this repo is

This is the Great Indian Company brand and entity lander for greatindiancompany.com. The homepage states the company assertion: building the great indian century.

The repo is an Astro static site, a Cloudflare Worker that serves the built files, a generated briefing corpus, and the scripts that produced that corpus.

Owner: the GIC entity/brand agent.

Shopify apps and ecommerce product work are out of scope, including mark-delivered and mark-shipping-status. That work belongs to the Shopify apps agent. Do not change it from this repository.

## Stack

What the tree actually wires up:

- Astro 4. `package-lock.json` resolves `astro` to 4.16.19. `astro.config.mjs` sets `output: 'static'` and `site: 'https://greatindiancompany.com'`. It does not import `@astrojs/cloudflare`.
- Content collections in `src/content.config.ts`. English masters live in `src/content/blog/en/` (800 markdown files). Pages are `src/pages/index.astro` (brand lander), `src/pages/blog/index.astro`, and `src/pages/blog/[slug].astro`. Layouts are `src/layouts/Layout.astro` and `src/layouts/BlogLayout.astro`. Styles for the lander are `src/styles/global.css`.
- `@astrojs/cloudflare` 11.2.0 is listed in `package.json` and is unused by the Astro config.
- Cloudflare Worker. `worker.js` forwards each request to the `ASSETS` binding. `wrangler.jsonc` names the worker `giclander`, sets `main` to `worker.js`, and serves the `dist` directory as assets. Compatibility date is `2025-09-27`. Flags are `global_fetch_strictly_public` and `nodejs_compat`. Observability is enabled. The config has no routes, custom domains, or account id.
- Wrangler 4.78.0 is the deploy CLI (`devDependency` in `package.json`).
- Sitemap and translation HTML. `npm run build` runs `astro build` and then `node scripts/generate-sitemap.mjs`. That script writes `dist/sitemap-0.xml`, `dist/sitemap-index.xml`, and one HTML page per markdown file under `content-automation/generated-translations/` (17,600 files across 22 language directories).
- Content automation. Config is in `content-automation/config/`. Scripts are `content-automation/scripts/run-content-pipeline.mjs` and `content-automation/scripts/expand-to-800-diverse.mjs`. Run state is in `content-automation/state/`. `CONTENT_AUTOMATION_PLAN.md` describes a larger pipeline than those two scripts implement.
- Static files in `public/`: `robots.txt`, `favicon.png`, `assets/videos/bg.mp4`, `assets/images/bg-mobile.webp`, `assets/images/bg-mobile.png`, and `.assetsignore`.

## Develop, build, deploy

Commands defined in `package.json`:

```bash
npm install
npm run dev          # astro dev
npm run build        # astro build && node scripts/generate-sitemap.mjs
npm run preview      # npm run build && wrangler dev
npm run deploy       # npm run build && wrangler deploy
```

Content commands, also in `package.json`:

```bash
npm run content:run           # node content-automation/scripts/run-content-pipeline.mjs
npm run content:expand:800    # node content-automation/scripts/expand-to-800-diverse.mjs
```

`README.md` and `CONTRIBUTING.md` document `npm install`, `npm run dev`, and `npm run build` as the local loop. There is no test script and no GitHub Actions workflow in `.github/`.

`npm run deploy` builds the site and runs `wrangler deploy` for the worker named `giclander`, using Cloudflare credentials present on the machine. Domain attachment for greatindiancompany.com is not defined in this repo.

Leave the content scripts alone unless the founder asks for a content run. `content:run` writes 100 new English articles and 2,200 translation files on every successful run, and it has no upper cap. `content:expand:800` stops once 800 English masters exist. That count is already met, so a fresh run is a no-op.

## Safety

- Do not commit secrets, `.env` files, `.dev.vars`, provider keys, or Cloudflare API tokens. `.gitignore` ignores `node_modules/`, `dist/`, `.astro/`, `.wrangler`, `.dev.vars*`, and `.env*`.
- Do not merge to `main` without the founder. Open draft pull requests. Prefer small, reversible changes.
- Public outbound actions and production deploy are founder-gated. Do not run `npm run deploy`, `wrangler deploy`, or any other production publish. Do not attach custom domains, change DNS, or otherwise change public traffic.
- Shopify product code is out of scope for this repository.

## Review notes

A point-in-time review lives in `docs/REVIEW_FINDINGS.md`. Read it before changing the worker, the sitemap generator, or the content pipeline.
