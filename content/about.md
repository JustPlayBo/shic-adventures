---
title: "Sul caso"
description: "Cos'è SHIC Adventures, lo schema v1 delle avventure, e come contribuire."
---

Questo è l'archivio pubblico delle avventure compatibili con il companion app per *Sherlock Holmes — Consulente Investigativo* disponibile su [sherlock.justplaybo.it](https://sherlock.justplaybo.it/). Le avventure sono distribuite come file JSON con uno schema stabile, in modo che chiunque possa scriverne di nuove e aggiungerle al repository.

## Schema {#schema}

L'app valida ogni avventura caricata richiedendo, come minimo, un identificatore stabile e una mappa `places`. Le sezioni opzionali abilitano funzionalità aggiuntive nell'UI.

```jsonc
{
  "id": "slug",
  "title": "Titolo dell'avventura",
  "version": 1,
  "intro":    { "title": "…", "html": "…" },
  "solution": { "title": "…", "html": "…" },
  "places": {
    "<pointId>": {
      "default": "<p>indizio sempre visibile</p>",
      "conditional": [
        { "requires": ["S"],     "html": "<p>extra reveal con S</p>" },
        { "requires": ["S","W"], "html": "<p>solo con S e W</p>" }
      ]
    },
    "<pointId2>": "<p>indizio semplice</p>"
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

- `places` è obbligatorio e deve essere un oggetto. Le chiavi corrispondono ai `pointId` definiti nella mappa interattiva.
- I campi `intro`, `solution`, `questions` e `sherlockPath` sono opzionali. Se mancanti, l'app nasconde le voci di menu corrispondenti.
- Le lettere in `requires` e `gains` sono normalizzate in maiuscolo.

## Contribuire

L'archivio vive su GitHub: [JustPlayBo/shic-adventures](https://github.com/JustPlayBo/shic-adventures). Fai una pull request aggiungendo un file Markdown sotto `content/adventures/`, con il payload completo nel front-matter YAML, e Hugo si occuperà di pubblicarlo sia come pagina HTML sia come JSON.
