# Great Indian Company Website

The Astro website and content automation system for Great Indian Company.

Live: [https://www.greatindiancompany.com](https://www.greatindiancompany.com)

## Mission

Great Indian Company is an applied AI product lab from India for the world. The site exists to explain the company and publish English market-intelligence briefs.

## What This Repository Contains

Astro static site for Great Indian Company with English briefs, source registries, thesis topics, sitemap generation, and a Cloudflare Worker that serves the built files. Language-tagged files under `content-automation/generated-translations/` are English templates. They are not translations, they are not pages on the site, and they are not listed in the sitemap.

## Highlights

- Company landing site with brand storytelling.
- Content automation configs for languages, sources, and thesis topics.
- Unpublished language-tagged templates. The text is English. The build does not emit HTML for them.
- Cloudflare deployment workflow and sitemap generation.

## Tech Stack

- Astro with Cloudflare adapter
- Plain JavaScript content automation scripts
- English Markdown briefs
- Wrangler deployment
- Custom sitemap generation

## Getting Started

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm test
npm run build
```

## Repository Notes

- `npm run build` writes the sitemap and then counts files in `dist`. The build fails above 10,000 files so a deploy stays under the Workers Free limit of 20,000 static assets per version. Do not raise that budget until a paid Workers plan is confirmed.
- Do not treat `content-automation/generated-translations/` as localized copy. `npm run content:run` and `npm run content:expand:800` do not write those files.
- Keep source registries and thesis topics factual and current.

## Contributing

Contributions are welcome. The best contributions are specific, tested, and grounded in the product mission. Good places to help include documentation, accessibility, tests, bug reports, UI polish, data validation, and safer AI behavior.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Please do not open public issues for secrets, auth bypasses, data exposure, provider key leaks, or abuse vectors. Follow [SECURITY.md](SECURITY.md).

## Code of Conduct

This project follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be direct, kind, and useful.

## License

MIT. See [LICENSE](LICENSE).
