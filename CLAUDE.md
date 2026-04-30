# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
hugo server          # dev preview at http://localhost:1313/
hugo --gc --minify   # production build into ./public/
```

Hugo **extended** ≥ 0.128.0 is required (the workflow pins `HUGO_VERSION=0.128.0`). There are no JS/CSS toolchains, no package manager, no test suite — Hugo's pipeline (`resources.Minify`, `resources.Fingerprint`) handles asset processing.

Bootstrap a new adventure:

```sh
cp data/adventures/sample-bsi.json data/adventures/<id>.json
hugo new --kind adventure adventures/<id>.md
```

## Architecture

This is a Hugo site that serves **two parallel artefacts** for every adventure: a Victorian-themed HTML page (for browsing) and a JSON payload (for the companion app at sherlock.justplaybo.it). Understanding why the data is split the way it is matters more than understanding the layouts.

### The two-file split per adventure

Each adventure has **two source files** matched by basename:

- `data/adventures/<id>.json` — full payload, source of truth, served verbatim.
- `content/adventures/<id>.md` — thin Markdown stub: catalog metadata in front matter (`title`, `subtitle`, `summary`, `author`, `difficulty`, `duration`, `players`, `tags`); body becomes "Note dell'autore" on the themed page.

The payload **must** live under `/data/` (not in the Markdown file's front matter) because Hugo's front-matter loader lowercases map keys, and the payload's `places` map uses case-sensitive keys like `"3SO"` that the companion expects intact. `themes/shic/layouts/adventures/single.json` looks up `index .Site.Data.adventures $slug` and emits the data file verbatim with `jsonify`. **Never move the payload into front matter** — it would silently corrupt the wire format.

### The flat-sibling JSON trick

Hugo emits the JSON at `/adventures/<slug>/index.json`. GitHub Pages 301-redirects `/adventures/<slug>` (extensionless) to the directory form, which serves the **HTML** page bundle, not the JSON. The companion needs a deterministic single path.

Resolution: a post-build step in `.github/workflows/pages.yml` (the "Flatten adventure JSON" step) copies each `<slug>/index.json` to a flat sibling `<slug>.json`. The companion fetches `/adventures/<id>.json`. The Netlify equivalent is a redirect rule in `netlify.toml`. **If you change the URL scheme or the JSON output, update both.**

### Permalinks and the slug contract

`hugo.toml` sets `[permalinks] adventures = "/adventures/:filename/"` so the slug is always the filename, regardless of the front-matter title. The JSON payload's `id` field MUST equal the filename, otherwise the companion's `getAdventure(id)` URL won't resolve. The two-file pairing is by filename basename.

### Base URL handling

Site is published as a project page at `https://justplaybo.github.io/shic-adventures/`. The CI workflow passes `--baseURL "${{ steps.pages.outputs.base_url }}/"` from `actions/configure-pages@v5`, so don't hard-code paths or assume root deployment. Use `relURL`/`RelPermalink` in templates.

### Wire schema (v1)

Required fields in `data/adventures/<id>.json`: `id`, `title`, `version` (currently `1`), `places`. `places` keys are case-sensitive `pointId` strings; values are either a string (legacy) or `{default, conditional[]}`. Optional: `author`, `lang` (BCP-47), `translations[]` (each `{lang, id, label?}` where `id` is another adventure's slug), `intro.html`, `solution.html`, `questions.{primary,secondary}.{title,items[]}`, `sherlockPath.steps[].{title, at, description, gains[]}`. The companion's `AdventureService.loadAdventure` validates that `places` is an object — so empty/missing `places` will break it. `sample-bsi` (Italian) and `sample-bsi-en` (English) are the canonical examples and link to each other via `translations`.

### Multi-language adventures

Each adventure stands on its own — there is no shared parent record. To publish the same case in several languages, create a separate `<slug>.<lang>` pair (one JSON payload + one Markdown stub) per language and cross-link them via `translations`. The site chrome itself is single-language (English); only the rendered adventure body uses its own `lang` (set on the article tag) and is surfaced as a chip plus an "Also available in" linkbar.

## Theme notes

`themes/shic/` is the only theme; the site root has empty `layouts/` and `archetypes/` directories — overrides go inside the theme. Color tokens are defined in `hugo.toml` (`[params.colors]`) but not actually consumed by templates; the live source is the CSS custom properties at the top of `themes/shic/assets/css/main.css`.
