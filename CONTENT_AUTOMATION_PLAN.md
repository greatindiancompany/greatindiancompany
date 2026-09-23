# CONTENT_AUTOMATION_PLAN.md

## Current publish rule

Published briefs are English. `content-automation/generated-translations/` is a corpus of English templates with language tags. Those files are not translations, are not part of the site build, and must not be added to the sitemap.

`content:run` and `content:expand:800` may write new files only through `writeEnglishBrief` in `content-automation/scripts/publish-guard.mjs`. That helper rejects `generated-translations/`, any folder other than `src/content/blog/en/`, a non-English `lang`, and a slug that ends with a code from `languages.json`. `scripts/generate-sitemap.mjs` fails the build if a sitemap URL matches one of those templates. See [docs/SEO.md](docs/SEO.md).

Do not generate 22 language versions. Do not add `hreflang` for these templates. The older sections below that still describe a 2,200-file translation contract are not the current rule; where they conflict with this section, this section wins.

## 1) Objective

Build a deterministic content engine that:

1. Scans existing English blog content in this repository to understand what already exists.
2. Creates exactly **100 new English articles** per `content:run`.
3. Does **not** create language versions. Language-tagged templates already on disk stay unpublished.
4. Publishes new English `.md` files under `src/content/blog/en/` only.

### Run Output Contract (Hard Requirement)

Each successful `content:run` must output:

- `100` new English articles
- `0` new language-tagged files
- `100` total new `.md` files

If these counts are not met, the run is considered failed and must not partially publish. A run that writes under `content-automation/generated-translations/` is a failure even if the file count looks right.

---

## 2) Scope and Principles

### In Scope

- Programmatic English content generation from thesis-aligned sources (RBI + Government of India first).
- Markdown-based publishing pipeline for `src/content/blog/en/` only.
- GitHub scan + dedupe + coverage mapping of English briefs.
- Daily scheduled run by cron (default), still without language-tagged output.

### in Scope

- Direct copying of third-party blog text.
- Publishing without source attribution.

### Content Principle

- English templates are not source-backed and do not report a verifiable shift. The pipeline does not check registry URLs.
- Frontmatter may store source links. The site shows a link only when its site matches the brief topic.

---

## 3) Repository Layout

```text
/
├── CONTENT_AUTOMATION_PLAN.md
├── docs/
│   └── SEO.md
├── content-automation/
│   ├── config/
│   │   ├── languages.json          # rejection codes, not a publish list
│   │   ├── source_registry.json
│   │   └── thesis_topics.json
│   ├── generated-translations/     # unpublished English templates; not in the sitemap
│   ├── state/
│   │   ├── content-index.json
│   │   ├── coverage-map.json
│   │   └── last-run-manifest.json
│   └── scripts/
│       ├── publish-guard.mjs
│       ├── run-content-pipeline.mjs
│       └── expand-to-800-diverse.mjs
└── src/
    └── content/
        └── blog/
            └── en/                  # only published brief folder
```

Notes:

- `src/content/blog/en/` holds the published English briefs. Do not add `src/content/blog/<lang>/` folders.
- `content-automation/generated-translations/<code>/` is an unpublished template corpus. Do not move those files into `src/content/`.
- `languages.json` lists template codes so the sitemap guard can reject `-<code>` slugs. It is not a publish target.
- Do not add `generate-translations.mjs`. `publish-guard.mjs` is the write and sitemap gate.

---

## 4) Run Architecture

## 4.1 Trigger

- Default cadence: once daily (cron).
- Optional manual trigger for backfill or failed rerun.

## 4.2 Single-Run Lifecycle

1. Load config and previous state.
2. Phase 1: Scan English content and build the current blog index.
3. Phase 2: Generate and accept exactly 100 new English articles.
4. Do not generate language versions.
5. Validate English files, counts, and schema.
6. Publish atomically (all-or-nothing) under `src/content/blog/en/`.
7. Emit run manifest with `translationsPublished: 0`.

---

## 5) Phase 1: Scan Existing Blogs from GitHub

Goal: Understand existing content inventory and avoid duplicates.

## 5.1 Discovery

1. Pull `main` branch tree from GitHub.
2. Enumerate all `*.md` and `*.mdx` files in known content paths.
3. Parse frontmatter + markdown body.

## 5.2 Extracted Fields

For each discovered article:

- `path`
- `slug`
- `lang`
- `canonicalId` (or derived)
- `title`
- `description`
- `publishDate`
- `updatedDate`
- `tags`
- `sourceLinks[]`

## 5.3 Fingerprinting and Deduplication Signals

Compute and store:

- `titleHash` (normalized title hash)
- `semanticHash` (embedding/simhash representation)
- `sourceHash` (sorted source-link hash)
- `topicCluster` (assigned cluster)
- `status` (`active`, `draft`, `archived`)

## 5.4 Coverage Map

Build `coverage-map.json` that classifies:

- Saturated topics (high article density)
- Under-covered opportunities (high-interest, low coverage)
- Freshness gaps (topics with stale updates)

---

## 6) Phase 2: Generate Exactly 100 New Master Articles

Goal: Produce 100 accepted English masters each run.

## 6.1 Topic Candidate Pool

Candidate topics come from:

1. RBI reports/notifications/bulletins.
2. Government of India ministry reports and releases.
3. Thesis topic bank (`thesis_topics.json`).
4. Coverage gap candidates from Phase 1.

## 6.2 Topic Scoring Model

Score each candidate with weighted factors:

- `freshnessScore`
- `searchIntentScore`
- `sourceAuthorityScore`
- `coverageGapScore`
- `duplicationRiskPenalty`

Select top-ranked candidates for generation.

## 6.3 Generation Strategy

- Generate an initial batch larger than target (example: 140 candidates).
- Run quality gates and reject failures.
- Regenerate until exactly 100 pass.

## 6.4 Master Article Frontmatter (Required)

Each English master must include:

- `id`
- `lang: en`
- `translationOf: null`
- `title`
- `description`
- `slug`
- `publishDate`
- `updatedDate`
- `tags[]`
- `sourceLinks[]`
- `summaryType` (for example: `report-summary`, `policy-explainer`)
- `draft: false`

## 6.5 Quality Gates for Acceptance

Article is accepted only if all pass:

1. Schema valid frontmatter.
2. Source links present and reachable format.
3. Duplicate check below threshold vs existing + in-run generated set.
4. Originality threshold pass.
5. Factual consistency check against cited source excerpts.
6. Length and structure requirements pass.

If fail: reject + regenerate candidate.

---

## 7) Phase 3: Do not generate language versions

Goal: leave language-tagged templates unpublished.

`content-automation/config/languages.json` records 22 language codes. Files under `content-automation/generated-translations/<code>/` use those codes in `lang` and in the slug, and the body is English. They are not localized versions.

Do not write new files there. Do not copy them into `src/content/blog/`. Do not add them to the sitemap, `hreflang`, or alternate links. The codes exist so `publish-guard.mjs` can reject a slug that ends in `-<code>`.

The list below is the rejection set, not a generation target:

## 7.1 Language codes that must stay out of the sitemap

These codes are not published languages:

1. Assamese (`as`)
2. Bengali (`bn`)
3. Bodo (`brx`)
4. Dogri (`doi`)
5. Gujarati (`gu`)
6. Hindi (`hi`)
7. Kannada (`kn`)
8. Konkani (`kok`)
9. Kashmiri (`ks`)
10. Maithili (`mai`)
11. Malayalam (`ml`)
12. Manipuri/Meitei (`mni`)
13. Marathi (`mr`)
14. Nepali (`ne`)
15. Odia (`or`)
16. Punjabi (`pa`)
17. Sanskrit (`sa`)
18. Santali (`sat`)
19. Sindhi (`sd`)
20. Tamil (`ta`)
21. Telugu (`te`)
22. Urdu (`ur`)

English remains the only published language.

## 7.2 What a real translation would require

A future localized brief is in scope only when the body is written in that language and a person has reviewed it. Until then:

1. Do not prefix an English title with a language name and call it a translation.
2. Do not set `lang` to anything other than `en` on a published file.
3. Do not set `translationOf` on a published file.
4. Do not invent a language-specific slug by appending `-<code>`.
5. Do not emit `hreflang` for a template.

## 7.3 Validation

`writeEnglishBrief` rejects a write that violates the rules above. `assertSitemapOmitsGeneratedTranslations` rejects a sitemap that contains a template URL. The content collection schema accepts `lang: "en"` and `translationOf: null` only.

---

## 8) Markdown Output Specification

## 8.1 File Naming

Published article path:

`src/content/blog/en/<publishDate>-<slug>.md`

Do not publish to `src/content/blog/<lang>/`.

## 8.2 Canonical linkage

Every published markdown file includes:

- `id`
- `lang: "en"`
- `translationOf: null`

There is no alternate-language link set and no `hreflang` set. See [docs/SEO.md](docs/SEO.md).

## 8.3 Example Master Frontmatter

```yaml
---
id: "gic-2026-03-30-rbi-liquidity-001"
lang: "en"
translationOf: null
title: "RBI Liquidity Update: What Changed and Why It Matters"
description: "A plain-language summary of RBI liquidity actions and implications."
slug: "rbi-liquidity-update-what-changed"
publishDate: "2026-03-30"
updatedDate: "2026-03-30"
tags: ["rbi", "liquidity", "india-economy"]
sourceLinks:
  - "https://www.rbi.org.in/..."
summaryType: "report-summary"
draft: false
---
```

## 8.4 Language-tagged frontmatter is not a publish format

A file like the one below is a template, not a Hindi article. Do not publish it and do not list its URL in the sitemap.

```yaml
---
id: "gic-2026-03-30-rbi-liquidity-001-hi"
lang: "hi"
translationOf: "gic-2026-03-30-rbi-liquidity-001"
title: "[Hindi] RBI Liquidity Update: What Changed and Why It Matters"
description: "Hindi version of an English brief."
slug: "rbi-liquidity-update-what-changed-hi"
publishDate: "2026-03-30"
updatedDate: "2026-03-30"
tags: ["rbi", "liquidity", "india-economy"]
sourceLinks:
  - "https://www.rbi.org.in/..."
summaryType: "report-summary"
draft: false
---
```

The title and body of the files on disk are English. A Devanagari title in an old example does not mean a translation exists.

---

## 9) Run Manifest Specification

At the end of each run, write:

`content-automation/state/last-run-manifest.json`

Required fields:

- `runId`
- `startedAt`
- `endedAt`
- `mastersRequested` (always 100)
- `mastersPublished`
- `translationsPublished` (always 0)
- `localizationStatus` (`not-generated`)
- `failedItems[]`
- `retryCounts`
- `sourceUrlsUsed[]`
- `generatedSlugs[]`

A run is successful only if:

- `mastersPublished === 100`
- `translationsPublished === 0`
- `schemaInvalidCount === 0`
- no new file was written under `content-automation/generated-translations/`

---

## 10) Retry, Failure, and Atomic Publish Rules

## 10.1 Retry Policy

- English article retries per failed candidate: configurable (default `3`).
- There is no translation retry loop.
- Dedup/quality failures trigger regeneration of the English article.

## 10.2 Hard Failure Conditions

Fail whole run if:

1. Cannot reach 100 accepted English articles after max retries.
2. Any language-tagged file was written, or any sitemap URL would match a template slug.
3. Any schema-invalid file remains.
4. Manifest counts mismatch.

## 10.3 Atomic Publish

1. Write generated files to staging area first.
2. Run all validations.
3. Move to final content paths only after full pass.
4. If failed, discard staging changes; do not publish partial output.

---

## 11) CI/CD and Cron Execution

## 11.1 Scheduler

- Use GitHub Actions scheduled workflow (`cron`) once daily by default.
- Support manual `workflow_dispatch`.

## 11.2 Pipeline Steps

1. Checkout repository.
2. Install dependencies.
3. Execute content pipeline script.
4. Run validations and Astro build check.
5. Create commit/PR only if run passes full contract.

## 11.3 Commit Policy

- One commit per successful run containing all generated `.md` files + manifest update.
- No commit if run fails.

---

## 12) Test Plan (Implementation Acceptance)

## 12.1 Scan Tests

- Detect all blog `.md`/`.mdx` files in configured paths.
- Parse frontmatter/body without schema loss.

## 12.2 Dedup Tests

- Reject new masters above duplicate similarity threshold vs existing index.
- Reject in-run collisions.

## 12.3 Count Contract Tests

- Confirm exactly 100 accepted English articles.
- Confirm zero new language-tagged files.
- Confirm total exactly 100 generated markdown files per successful `content:run`.

## 12.4 Integrity Tests

- Every published article has `lang: "en"` and `translationOf: null`.
- No published slug ends with a code from `languages.json`.

## 12.5 Citation Tests

- Every article includes at least one valid source link.
- Source links follow approved-domain policy for thesis categories.

## 12.6 Build Tests

- Astro content loading passes for all generated markdown.
- `astro build` succeeds after generation.

## 12.7 Acceptance Criteria (Hard Gate)

Run is accepted only when all below are true:

1. `mastersPublished = 100`
2. `translationsPublished = 0`
3. `totalNewMarkdownFiles = 100`
4. `schemaInvalidCount = 0`
5. Sitemap URLs do not include a `generated-translations` slug
6. `dist` stays under 10,000 files
7. All tests pass

---

## 13) Operational Metrics

Track per run:

- generation pass rate
- dedupe rejection rate
- source utilization distribution
- build pass/fail
- runtime duration

Track weekly:

- indexed pages
- impressions/click growth
- non-branded query count
- top topic-cluster performance

---

## 14) Assumptions and Defaults

1. The 22 codes in `languages.json` are a sitemap rejection set. They are not an output language list.
2. English is the only generation language.
3. Content strategy uses original synthesis + source citation only.
4. Source priority starts with RBI and Government of India publications.
5. Default run cadence is daily via cron.
6. No partial publish is permitted.

---

## 15) Implementation Checklist (Engineer-Ready)

1. Create folder structure under `content-automation/` and `src/content/blog/`.
2. Implement GitHub scan script and content index writer.
3. Implement topic scoring and master generation engine.
4. Do not implement a translation engine. Keep `writeEnglishBrief` on every markdown write.
5. Implement validators (schema, dedupe, integrity, citation, count contract, sitemap exclusion).
6. Implement staging + atomic publish flow.
7. Implement run manifest output.
8. Add GitHub Actions daily cron workflow.
9. Add build/test gates.
10. Dry-run in test mode, then enable production run.

This checklist is complete and decision-ready for implementation.
