# SHIC Adventures

Public archive of fan-made adventures for the Italian board game *Sherlock Holmes — Consulente Investigativo*. Adventures are stored as JSON data files with thin Markdown stubs for catalog metadata; Hugo renders both a Victorian-themed catalog (HTML) and the machine-readable JSON consumed by the companion app at <https://sherlock.justplaybo.it/>.

Deployment target: <https://justplaybo.github.io/shic-adventures/>.

## Quick start

```sh
hugo server          # dev preview at http://localhost:1313/
hugo --gc --minify   # build to ./public/
```

Hugo ≥ 0.128.0 (extended) is required.

## Authoring an adventure

Each adventure has **two files**:

1. `data/adventures/<id>.json` — the v1 payload. This is the single source of truth and is served verbatim to the companion. Map keys (e.g. `"3SO"`) are preserved as-is. Hugo would lowercase them if they lived in YAML front matter, so the API surface deliberately lives in `/data/`.
2. `content/adventures/<id>.md` — a thin Markdown file with catalog metadata only (`title`, `subtitle`, `summary`, `author`, `difficulty`, `duration`, `players`, `tags`). The body is shown as "Note dell'autore" on the themed page. The two files are matched by filename: `data/adventures/<id>.json` ↔ `content/adventures/<id>.md`.

Bootstrap a new adventure:

```sh
cp data/adventures/sample-bsi.json data/adventures/<id>.json
hugo new --kind adventure adventures/<id>.md
```

### v1 payload schema (`data/adventures/<id>.json`)

| Field           | Required | Notes |
|-----------------|----------|-------|
| `id`            | yes      | Must equal the filename so the companion's `getAdventure(id)` URL resolves. |
| `title`         | yes      | Displayed by `IntroComponent`. |
| `version`       | yes      | Currently `1`. |
| `intro.html`    | no       | Shown by `IntroComponent` after load. HTML allowed. |
| `solution.html` | no       | Shown by `SolutionComponent`. |
| `places`        | yes      | Object keyed by `pointId` → either a string (legacy) or `{default, conditional[]}`. **Keys are case-sensitive.** |
| `questions`     | no       | `{primary, secondary}`, each `{title, items[]}`. Item ids must be stable. |
| `sherlockPath`  | no       | Reference walkthrough; `at` matches a `pointId`, `gains` is an array of letters. |

The seed adventure `sample-bsi` demonstrates the full shape.

## URLs

The site is published as a project page at `https://justplaybo.github.io/shic-adventures/`, so every path below is relative to that prefix.

| URL                                       | Purpose |
|-------------------------------------------|---------|
| `/`                                       | Themed home page with featured adventures. |
| `/adventures/`                            | Browsable catalog (HTML). |
| `/adventures/index.json`                  | Lightweight manifest of all adventures (id, title, summary, tags…). |
| `/adventures/<id>/`                       | Themed single adventure page. |
| `/adventures/<id>/index.json`             | Adventure payload consumed by the companion. |
| `/adventures/<id>.json`                   | Flat sibling of the above — emitted by the GitHub Pages workflow so the companion can fetch with a single deterministic path. |

The extensionless URL `/adventures/<id>` is **not** exposed on GitHub Pages — Pages 301-redirects directory-shaped URLs to the trailing-slash form, which would serve the HTML page instead of the JSON. The companion should fetch `/adventures/<id>.json` (the flat sibling); see "Companion compatibility" below.

CORS comes for free on GitHub Pages — every asset is served with `Access-Control-Allow-Origin: *`, so the companion can fetch payloads cross-origin without extra configuration.

## Deployment

`.github/workflows/pages.yml` builds with Hugo extended on every push to `main`:

1. Installs Hugo extended (pinned via the `HUGO_VERSION` env var).
2. Calls `actions/configure-pages@v5` and passes the resulting `base_url` to `hugo --baseURL` so the build is correct for the project-page subpath (`/shic-adventures/`).
3. Runs `hugo --gc --minify`.
4. Flattens each adventure's `<id>/index.json` to a sibling `<id>.json` (sidesteps the GitHub Pages directory-redirect collision against the HTML page bundle).
5. Uploads via `actions/upload-pages-artifact@v3` and deploys via `actions/deploy-pages@v4`.

To activate, in **Settings → Pages** of the repo set **Source: GitHub Actions**. No custom domain is configured.

A `netlify.toml` is also included for completeness — if you ever mirror the archive to Netlify it adds the same flat `<id>.json` sibling plus the extensionless `/adventures/<id>` rewrite that the companion's pre-existing fetch path expects. Not required for the GitHub Pages deployment.

## Theme

`themes/shic/` is a custom Victorian/sepia theme (`#644b13` mahogany, `#a19476` brass, `#fbf6e7` parchment) using *Cinzel* + *EB Garamond* from Google Fonts. The single-adventure layout renders intro, places (with conditional reveals styled as wax-sealed cards), Sherlock's path and the solution behind progressive-disclosure spoiler toggles, so the themed page is genuinely usable as a printable case file.

## Companion compatibility

The companion app (`/srv/justplay-shic`, deployed as <https://sherlock.justplaybo.it>) calls a remote `getAdventure(id)` endpoint and validates the payload via `AdventureService.loadAdventure`, which requires `places` to be an object. The JSON output template (`themes/shic/layouts/adventures/single.json`) renders the data file verbatim, so adding new theme metadata in the content stub cannot affect the wire schema.

The companion currently points at `https://adventures.sherlock.justplaybo.it/adventures/<id>` (extensionless). To consume this GitHub Pages archive, update the URL to:

```
https://justplaybo.github.io/shic-adventures/adventures/${id}.json
```

(one-line change in `AdventureService.getAdventure`).
