# Leonida Platinum Tracker — 55 trophies, 190 cited steps, 51 backed by 2+ sources

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Lagabara77/leonida-platinum-tracker/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Lagabara77/leonida-platinum-tracker/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline tracker and guide for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze. About 200 hours to platinum, difficulty 4/10, 0 online trophies, 1 playthrough.

## What it does

- **Checklist** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to JSON and imported back. Every row shows its target (for example "250 stunts"), so you can see the size of each job at a glance.
- **Progress at a glance** — KPI cards (earned x/55, percent toward platinum, remaining by grade, missable left) plus a progress bar, and a "Next up" line that names the cheapest unearned trophy.
- **Filters** — search by name, description, target or timing; filter by kind (story, side story, activities, robbery, combat, exploration, collectibles, money, misc, platinum path), by grade, and by earned / not earned; a "missable only" switch. Filters are shareable as URL parameters, for example `?kind=robbery&grade=silver` or `?q=stunt`.
- **Spoiler setting** — story trophies stay hidden ("Hidden trophy — earn it to reveal") until earned, unless you turn spoilers on (`?spoilers=on`). Hidden trophies cannot be ticked before they are revealed.
- **Guide for every trophy** — every guide is written as numbered steps, and every step that states a fact ends with a citation marker [1], [2] or [3] pointing at that trophy's numbered source list: 196 steps total, 190 cited, 51 backed by 2+ sources. The official description is labelled as such, with a target line and a "when" line (which chapter or stage unlocks it). Concrete counts, unlock conditions and in-game tracking menus come from PowerPyx's roadmap. Where no source has pinned down a method, the step carries a [?] marker and the guide says so instead of guessing — only 4 of 55 trophies are still unconfirmed, and the guide says which ones and what they are believed to be.
- **AUDIT strip** — a computed strip under the header on every tab: 55/55 official name, description and grade · 1P 2G 6S 46B · 28 PSN-hidden · 190/196 steps cited · 55/55 guides cite sources · 51 steps backed by 2+ sources · 3 pages · 3 sites read 19 Nov 2026 · 1 possibly missable · 1 at risk · 4 unconfirmed · 1 open question shown both ways. Every number is computed from the data at runtime, never hardcoded.
- **Roadmap to platinum** — a horizontal chapter timeline (Chapter 1–5, side stories, cleanup) with earned counts per chapter and a MISSABLE HERE flag on Chapter 1, plus 7 stat cards (~200 h, difficulty 4/10, 1 possibly missable, 0 online, 1 playthrough, 15 manual save slots, 5 story chapters), 3 steps as cards (story + chapter saves, 100% completion + challenges, robbery/money/misc cleanup) with hours and trophy counts, the one potentially missable trophy flagged (Positive Mental Attitude — meditate at the Chapter 1 balcony spot, 18 spots in 10 locations), a live trophies-by-kind table, and the rules that protect your run (cheats disable trophies, no mission replay, no difficulty trophy).
- **Missables tab** — one card per chapter (Chapter 1–5, side stories, cleanup) with a live summary ("1 possibly missable · 1 at risk · 54 safe at any time"). Positive Mental Attitude is labelled CAN BE LOST with its exact trigger (the Chapter 1 balcony meditation, after "Down to Earth") plus SAVE FIRST advice; the one open question about it — whether the balcony meditation is actually required — is shown both ways in its guide, because both readings come from PowerPyx itself and no source has settled it.
- **Sources tab** — a trophy × source matrix for all 55 trophies (PowerPyx / Exophase / PSNProfiles, every cell cited) plus per-source cited-step counts (PowerPyx 180 steps, Exophase 51, PSNProfiles 51) and a note on how the markers were assigned.
- **Round 3** — the checklist is grouped by chapter with earned counts per chapter (data in `app/data/chapters.json`), the header carries a big platinum progress ring, "Next up" is now a numbered Next 5 platinum path (story first, then activities, then cleanup), and the guide panel uses larger type with a prominent SOURCES box (one cited source per line) so citations are checkable at a glance.

## Run it offline

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no dependencies. Open `app/index.html` from any static file server; the app loads nothing from outside its own folder and makes no network request while running. Deep links work too: `?trophy=28` opens a trophy's guide, `?kind=activities` filters the list, `?spoilers=on` reveals story trophies.

## Sources

- Trophy names, descriptions and grades exactly as PlayStation publishes them, mirrored by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Rockstar Games has never published the list itself.
- Guides draw on [PowerPyx](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/), [OutputLag](https://outputlag.com/guides/gta-6-trophy-list/) and [U7BUY](https://www.u7buy.com/blog/gta-6-trophies/) — cited per trophy, never copied.
- Kind and missable flags are this guide's own classification derived from the official descriptions, not PSN data.

## License

MIT — see [LICENSE](LICENSE). Unofficial fan guide; no Rockstar logo or official artwork is used anywhere.
