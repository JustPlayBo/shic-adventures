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
tags: []
outputs:
  - HTML
  - JSON
---

Note dell'autore. Aggiungi il payload completo dell'avventura come `data/adventures/{{ .Name }}.json` (stessa basename di questo file).
