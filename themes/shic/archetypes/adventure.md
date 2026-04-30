---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
subtitle: ""
summary: ""
author: ""
difficulty: ""
duration: ""
players: ""
lang: "en"
translations: []
tags: []
outputs:
  - HTML
  - JSON
---

Author's notes. Add the full adventure payload as `data/adventures/{{ .Name }}.json` (same basename as this file).
