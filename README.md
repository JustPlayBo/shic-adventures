# SHIC Adventures

Public archive of fan-made adventures for the Italian board game *Sherlock Holmes — Consulente Investigativo*. Adventures are stored as Markdown files with the full schema in YAML front matter; Hugo renders both a Victorian-themed catalog (HTML) and machine-readable JSON consumed by the companion app at <https://sherlock.justplaybo.it/>.

Deployment target: <https://adventures.sherlock.justplaybo.it/>.

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

| URL                                       | Purpose |
|-------------------------------------------|---------|
| `/`                                       | Themed home page with featured adventures. |
| `/adventures/`                            | Browsable catalog (HTML). |
| `/adventures/index.json`                  | Lightweight manifest of all adventures (id, title, summary, tags…). |
| `/adventures/<slug>/`                     | Themed single adventure page. |
| `/adventures/<slug>/index.json`           | Adventure payload consumed by the companion (canonical, all platforms). |
| `/adventures/<slug>.json`                 | Flat sibling of the above — emitted by the GitHub Pages workflow and by the Netlify rewrite. |
| `/adventures/<slug>`                      | Extensionless variant — **Netlify only** (rewrite). On GitHub Pages this 301-redirects to the HTML page. |

CORS for `/adventures/*` is open (`Access-Control-Allow-Origin: *`) so the companion can fetch payloads from a different subdomain. On GitHub Pages CORS comes for free (Pages already responds with `Access-Control-Allow-Origin: *` on every asset); on Netlify it's set explicitly via `netlify.toml` and `static/_headers`.

## Deployment

Two paths are wired up:

- **GitHub Pages** (default) — `.github/workflows/pages.yml` builds with Hugo extended on every push to `main`, flattens the adventure JSONs to `/adventures/<slug>.json`, writes a `CNAME` for `adventures.sherlock.justplaybo.it`, and publishes via `actions/deploy-pages@v4`. Enable Pages in the repo settings with the source set to *GitHub Actions* and add the custom domain there.
- **Netlify** — drop the repo into a Netlify site and `netlify.toml` handles the rest. The Netlify variant additionally exposes the extensionless URL `/adventures/<slug>` (matching the companion app's current fetch path) via redirect rules.

## Theme

`themes/shic/` is a custom Victorian/sepia theme (`#644b13` mahogany, `#a19476` brass, `#fbf6e7` parchment) using *Cinzel* + *EB Garamond* from Google Fonts. The single-adventure layout renders intro, places (with conditional reveals styled as wax-sealed cards), Sherlock's path and the solution behind progressive-disclosure spoiler toggles, so the themed page is genuinely usable as a printable case file.

## Companion compatibility

The companion app (`/srv/justplay-shic`, deployed as <https://sherlock.justplaybo.it>) calls `https://adventures.sherlock.justplaybo.it/adventures/<id>` and validates the payload via `AdventureService.loadAdventure`, which requires `places` to be an object. The JSON output template (`themes/shic/layouts/adventures/single.json`) emits exactly the v1 fields and nothing else, so adding new theme metadata in front matter cannot break the wire schema.

If this archive is hosted on GitHub Pages, update the companion's `getAdventure(id)` URL to `https://adventures.sherlock.justplaybo.it/adventures/${id}.json` (one-line change). On Netlify the existing extensionless URL keeps working untouched.
