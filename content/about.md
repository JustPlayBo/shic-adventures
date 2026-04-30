---
title: "About the case"
description: "What SHIC Adventures is, the v1 adventure schema, and how to contribute."
---

This is the public archive of adventures compatible with the companion app for *Sherlock Holmes — Consulting Detective* available at [sherlock.justplaybo.it](https://sherlock.justplaybo.it/). Adventures are distributed as JSON files with a stable schema, so anyone can write new ones and add them to the repository.

## Schema {#schema}

The app validates each adventure on load and requires, at minimum, a stable identifier and a `places` map. Optional sections enable additional features in the UI.

```jsonc
{
  "id": "slug",
  "title": "Adventure title",
  "lang": "en",
  "translations": [
    { "lang": "it", "id": "slug-it", "label": "Italiano" }
  ],
  "version": 1,
  "intro":    { "title": "…", "html": "…" },
  "solution": { "title": "…", "html": "…" },
  "places": {
    "<pointId>": {
      "default": "<p>clue always visible</p>",
      "conditional": [
        { "requires": ["S"],     "html": "<p>extra reveal with S</p>" },
        { "requires": ["S","W"], "html": "<p>only with S and W</p>" }
      ]
    },
    "<pointId2>": "<p>simple clue</p>"
  },
  "questions": {
    "primary":   { "title": "…", "items": [/* { id, text, answer, points, rationale? } */] },
    "secondary": { "title": "…", "items": [/* … */] }
  },
  "sherlockPath": {
    "title": "…",
    "steps": [
      { "at": "3SO", "title": "…", "description": "…", "gains": ["S"] }
    ]
  }
}
```

- `places` is required and must be an object. Keys correspond to the `pointId`s defined on the interactive map.
- `intro`, `solution`, `questions`, and `sherlockPath` are optional. When missing, the app hides the corresponding menu entries.
- Letters in `requires` and `gains` are normalised to upper case.
- `lang` is a BCP-47 / ISO-639 code (e.g. `"en"`, `"it"`). When an adventure exists in several languages, list its siblings under `translations` with their `lang` and `id` (the slug under `data/adventures/`); add an optional `label` to override the display name.

## Contributing

The archive lives on GitHub: [JustPlayBo/shic-adventures](https://github.com/JustPlayBo/shic-adventures). Open a pull request adding a JSON payload under `data/adventures/` and a thin Markdown stub under `content/adventures/` (matched by basename), and Hugo will publish it as both an HTML page and a JSON endpoint.
