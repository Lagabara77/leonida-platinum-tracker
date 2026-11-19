# Leonida Platinum Tracker — GTA VI Trophy Guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Lagabara77/leonida-platinum-tracker/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Lagabara77/leonida-platinum-tracker/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline tracker and guide for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze. About 200 hours to platinum, difficulty 4/10, 0 online trophies, 1 playthrough.

## What it does

- **Checklist** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to JSON and imported back. Every row shows its target (for example "250 stunts"), so you can see the size of each job at a glance.
- **Progress at a glance** — KPI cards (earned x/55, percent toward platinum, remaining by grade, missable left) plus a progress bar, and a "Next up" line that names the cheapest unearned trophy.
- **Filters** — search by name, description, target or timing; filter by kind (story, side story, activities, robbery, combat, exploration, collectibles, money, misc, platinum path), by grade, and by earned / not earned; a "missable only" switch. Filters are shareable as URL parameters, for example `?kind=robbery&grade=silver` or `?q=stunt`.
- **Spoiler setting** — story trophies stay hidden ("Hidden trophy — earn it to reveal") until earned, unless you turn spoilers on (`?spoilers=on`). Hidden trophies cannot be ticked before they are revealed.
- **Guide for every trophy** — written in this guide's own words, with the official description labelled as such, a target line and a "when" line (which chapter or stage unlocks it), and a Sources line naming the public guides each fact comes from. Concrete counts, unlock conditions and in-game tracking menus come from PowerPyx's roadmap. Where no source has pinned down a method, the guide says so instead of guessing — only 4 of 55 trophies are still unconfirmed, and the guide says which ones and what they are believed to be.
- **Roadmap to platinum** — 3 steps as cards (story + chapter saves, 100% completion + challenges, robbery/money/misc cleanup) with hours and trophy counts, the one potentially missable trophy flagged (Positive Mental Attitude — meditate at the Chapter 1 balcony spot, 18 spots in 10 locations), a live trophies-by-kind table, and the rules that protect your run (cheats disable trophies, no mission replay, no difficulty trophy).

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
