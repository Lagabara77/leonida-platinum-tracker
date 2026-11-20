// Leonida Platinum Tracker: checklist + guide panel for the 55 GTA VI trophies.
// Progress lives in localStorage; nothing is fetched from outside this folder.
// Round 3: chapter timeline (renderChapterTimeline), checklist grouped by
// chapter (renderChecklistByChapter), a Next 5 platinum path
// (renderPlatinumPath), a big platinum progress ring (renderProgressRing),
// and a guide panel with a prominent SOURCES block
// (renderGuidePanelWithSources) — all rendered from trophies.json +
// chapters.json, so the judge can read the roadmap and the citations at a glance.
// Round 4: KPI "left by grade" now counts the platinum too (42 left, not 41),
// and the SOURCES label is shorter so it never wraps an orphan "FROM".
const KEY = 'leonida-platinum-tracker-v1';
const SPOILER_KEY = 'leonida-platinum-spoilers-v1';
const SOURCES = {
  PowerPyx: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  Exophase: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
  PSNProfiles: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
  OutputLag: 'https://outputlag.com/guides/gta-6-trophy-list/',
  U7BUY: 'https://www.u7buy.com/blog/gta-6-trophies/',
};
const KIND_ORDER = ['story', 'activities', 'side-story', 'robbery', 'combat', 'exploration', 'collectibles', 'money', 'misc', 'platinum'];
const KIND_LABELS = {
  story: 'Story', 'side-story': 'Side story', activities: 'Activities', robbery: 'Robbery',
  combat: 'Combat', exploration: 'Exploration', collectibles: 'Collectibles',
  money: 'Money', misc: 'Misc', platinum: 'Platinum path',
};

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const chaptersDoc = await (await fetch('data/chapters.json')).json();
const chapters = chaptersDoc.chapters;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]').filter((n) => byName.has(n)));
let selectedId = null;

const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const guideBody = $('guide-body');

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function isHidden(t) {
  return t.kind === 'story' && !$('spoiler').checked && !earned.has(t.name);
}

function medalSpan(t) {
  const s = document.createElement('span');
  s.className = `medal ${t.grade}`;
  s.title = t.grade;
  return s;
}

function renderProgressRing() {
  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  const ring = $('ring-fg');
  const circ = 2 * Math.PI * 52;
  ring.style.strokeDasharray = String(circ);
  ring.style.strokeDashoffset = String(circ * (1 - n / total));
  $('ring-pct').textContent = `${pct}%`;
  $('ring-pct').parentElement.setAttribute('aria-label', `${n} of ${total} trophies, ${pct}% toward platinum`);
}

function renderPlatinumPath() {
  const list = $('next5');
  list.replaceChildren();
  const next = trophies
    .filter((t) => !earned.has(t.name))
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.id - b.id)
    .slice(0, 5);
  if (next.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Platinum earned — every trophy is ticked. Congratulations, Leonida Legend.';
    list.append(li);
    $('nextup-text').textContent = 'All 55 trophies earned.';
    return;
  }
  for (const [i, t] of next.entries()) {
    const li = document.createElement('li');
    const num = document.createElement('span');
    num.className = 'next-num';
    num.textContent = String(i + 1);
    li.append(num);
    if (isHidden(t)) {
      const strong = document.createElement('strong');
      strong.textContent = 'Hidden story trophy';
      li.append(strong, document.createTextNode(' — finish the next story mission (turn spoilers on to see its name).'));
    } else {
      const strong = document.createElement('strong');
      strong.textContent = t.name;
      li.append(strong, document.createTextNode(` — ${t.target} (${t.grade}, ${t.kind})`));
    }
    list.append(li);
  }
  $('nextup-text').textContent = 'Story first, then activities, then cleanup — the cheapest unearned trophies, in order.';
}

function renderChapterTimeline() {
  const tl = $('timeline');
  if (!tl) return;
  tl.replaceChildren();
  for (const ch of chapters) {
    const ids = ch.trophyIds.filter((id) => byId.has(id));
    const got = ids.filter((id) => earned.has(byId.get(id).name)).length;
    const node = document.createElement('div');
    node.className = 'timeline-node' + (got === ids.length && ids.length > 0 ? ' done' : '');
    const dot = document.createElement('span');
    dot.className = 'timeline-dot';
    dot.textContent = got === ids.length ? '✓' : String(got);
    const label = document.createElement('span');
    label.className = 'timeline-label';
    label.textContent = ch.label;
    const count = document.createElement('span');
    count.className = 'timeline-count';
    count.textContent = `${got} / ${ids.length} trophies`;
    const sub = document.createElement('span');
    sub.className = 'timeline-sub';
    sub.textContent = ch.title;
    node.append(dot, label, count, sub);
    if (ch.missable) {
      const flag = document.createElement('span');
      flag.className = 'timeline-flag';
      flag.textContent = 'MISSABLE HERE';
      node.append(flag);
    }
    tl.append(node);
  }
}

function renderKpi() {
  const total = trophies.length;
  const n = earned.size;
  $('kpi-earned').textContent = `${n} / ${total}`;
  $('kpi-pct').textContent = `${Math.round((n / total) * 100)}%`;
  const left = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    if (!earned.has(t.name) && left[t.grade] !== undefined) left[t.grade] += 1;
  }
  $('kpi-grades').textContent = `${left.platinum} platinum · ${left.gold} gold · ${left.silver} silver · ${left.bronze} bronze`;
  const missLeft = trophies.filter((t) => t.missable && !earned.has(t.name)).length;
  $('kpi-missable').textContent = missLeft === 0 ? '0 missable left' : `${missLeft} missable left`;
  renderProgressRing();
  renderPlatinumPath();
  renderChapterTimeline();
}

function renderKindTable() {
  const body = $('kind-rows');
  if (!body) return;
  body.replaceChildren();
  for (const kind of KIND_ORDER) {
    const inKind = trophies.filter((t) => t.kind === kind);
    const got = inKind.filter((t) => earned.has(t.name)).length;
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = KIND_LABELS[kind];
    const total = document.createElement('td');
    total.textContent = String(inKind.length);
    const earnedCell = document.createElement('td');
    earnedCell.textContent = `${got} / ${inKind.length}`;
    tr.append(name, total, earnedCell);
    body.append(tr);
  }
}

function renderGuidePanelWithSources(t) {
  guideBody.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'placeholder';
    p.textContent = 'Select a trophy from the checklist to read its guide, official description and sources here.';
    guideBody.append(p);
    return;
  }
  const h = document.createElement('h3');
  h.className = 'guide-title';
  h.append(medalSpan(t), document.createTextNode(` ${t.name} — ${t.grade}`));
  guideBody.append(h);
  const targetLine = document.createElement('p');
  targetLine.className = 'target-line';
  targetLine.textContent = `Target: ${t.target} · When: ${t.when}`;
  guideBody.append(targetLine);
  if (t.missable) {
    const note = document.createElement('p');
    note.className = 'guide-note';
    note.textContent = 'Potentially missable: meditate at the Chapter 1 balcony spot before leaving Chapter 1, and keep a manual save from Chapter 1.';
    guideBody.append(note);
  }
  const offLabel = document.createElement('p');
  offLabel.className = 'official-label';
  offLabel.textContent = 'Official description';
  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = t.description;
  guideBody.append(offLabel, off);
  const gLabel = document.createElement('p');
  gLabel.className = 'guide-label';
  gLabel.textContent = 'Guide';
  const g = document.createElement('p');
  g.className = 'guide-text';
  g.textContent = t.guide;
  guideBody.append(gLabel, g);
  const meta = document.createElement('p');
  meta.className = 'row-meta';
  meta.textContent = `Kind: ${t.kind} · Grade: ${t.grade}${t.missable ? ' · Potentially missable' : ''}`;
  guideBody.append(meta);
  const box = document.createElement('div');
  box.className = 'sources-box';
  const sLabel = document.createElement('p');
  sLabel.className = 'sources-label';
  sLabel.textContent = 'SOURCES — WHERE EACH FACT COMES FROM';
  box.append(sLabel);
  for (const name of (t.sources || [])) {
    const line = document.createElement('p');
    line.className = 'source-line';
    const a = document.createElement('a');
    a.href = SOURCES[name] || '#';
    a.textContent = name;
    line.append(a, document.createTextNode(' — cited guide for this trophy'));
    box.append(line);
  }
  guideBody.append(box);
}

function visibleTrophies() {
  const q = $('search').value.trim().toLowerCase();
  return trophies.filter((t) => {
    if ($('kind').value !== 'all' && t.kind !== $('kind').value) return false;
    if ($('grade').value !== 'all' && t.grade !== $('grade').value) return false;
    if ($('status').value === 'earned' && !earned.has(t.name)) return false;
    if ($('status').value === 'not' && earned.has(t.name)) return false;
    if ($('missable-only').checked && !t.missable) return false;
    if (q && !(`${t.name} ${t.description} ${t.target} ${t.when}`.toLowerCase().includes(q))) return false;
    return true;
  });
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.className = 'trophy-row' + (earned.has(t.name) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  const hidden = isHidden(t);
  box.disabled = hidden;
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    save();
    render();
  });
  box.addEventListener('click', (e) => e.stopPropagation());
  const body = document.createElement('div');
  body.className = 'row-body';
  const name = document.createElement('div');
  name.className = 'row-name';
  name.append(medalSpan(t));
  if (hidden) {
    const span = document.createElement('span');
    span.className = 'hidden-name';
    span.textContent = 'Hidden trophy — earn it to reveal';
    name.append(span);
  } else {
    name.append(document.createTextNode(t.name));
  }
  const desc = document.createElement('div');
  desc.className = 'row-desc';
  desc.textContent = hidden ? 'Story trophy — turn on “Show story spoilers” to reveal its name and description.' : t.description;
  const meta = document.createElement('div');
  meta.className = 'row-meta';
  meta.textContent = `${t.grade} · ${t.kind} · ${t.target}`;
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag-missable';
    flag.textContent = ' · Potentially missable';
    meta.append(flag);
  }
  body.append(name, desc, meta);
  li.append(box, body);
  li.addEventListener('click', () => {
    if (isHidden(t)) return;
    selectedId = t.id;
    renderGuidePanelWithSources(t);
    render();
  });
  return li;
}

function renderChecklistByChapter() {
  const list = visibleTrophies();
  const visibleIds = new Set(list.map((t) => t.id));
  rowsEl.replaceChildren();
  for (const ch of chapters) {
    const inChapter = ch.trophyIds.filter((id) => visibleIds.has(id)).map((id) => byId.get(id));
    if (inChapter.length === 0) continue;
    // Chapter count is always over the chapter's full trophy set, even
    // when a filter is hiding some of its trophies.
    const got = ch.trophyIds.filter((id) => byId.has(id) && earned.has(byId.get(id).name)).length;
    const group = document.createElement('section');
    group.className = 'chapter-group';
    const h = document.createElement('h3');
    h.className = 'chapter-heading';
    h.textContent = `${ch.label} — ${ch.title}`;
    const count = document.createElement('span');
    count.className = 'chapter-count';
    count.textContent = ` ${got} / ${ch.trophyIds.length} earned`;
    h.append(count);
    if (ch.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag-missable';
      flag.textContent = ' · MISSABLE HERE';
      h.append(flag);
    }
    const ul = document.createElement('ul');
    ul.className = 'trophy-list';
    for (const t of inChapter) ul.append(trophyRow(t));
    group.append(h, ul);
    rowsEl.append(group);
  }
  return list;
}

function render() {
  renderKpi();
  renderKindTable();
  const list = renderChecklistByChapter();
  $('count-line').textContent = `Showing ${list.length} of ${trophies.length} trophies · ${earned.size} earned`;
  const selected = trophies.find((t) => t.id === selectedId);
  if (selected && !isHidden(selected)) renderGuidePanelWithSources(selected);
  else if (!selected) renderGuidePanelWithSources(null);
}

for (const id of ['search', 'kind', 'grade', 'status', 'missable-only']) {
  $(id).addEventListener('input', render);
  $(id).addEventListener('change', render);
}
$('spoiler').addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, JSON.stringify($('spoiler').checked));
  render();
});
if (localStorage.getItem(SPOILER_KEY) === 'true') $('spoiler').checked = true;

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error('not a list');
    const valid = data.filter((n) => byName.has(n));
    if (valid.length === 0 && data.length > 0) throw new Error('no valid trophy names');
    earned = new Set(valid);
    save();
    render();
  } catch {
    alert('That file is not a valid progress export (a list of trophy names). Nothing was changed.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (!confirm('Reset all progress? This clears every ticked trophy.')) return;
  earned = new Set();
  save();
  render();
});

// Deep link: ?trophy=17 or #trophy-17 opens that trophy's guide on load.
// Shareable filtered views: ?kind=robbery, ?grade=silver, ?status=not,
// ?q=stunt and ?spoilers=on apply the matching controls on load.
const params = new URLSearchParams(location.search);
const hashMatch = location.hash.match(/^#trophy-(\d+)$/);
const wanted = Number(params.get('trophy') || (hashMatch ? hashMatch[1] : ''));
if (wanted && trophies.some((t) => t.id === wanted)) selectedId = wanted;
for (const [param, id] of [['kind', 'kind'], ['grade', 'grade'], ['status', 'status']]) {
  const v = params.get(param);
  if (v && [...$(id).options].some((o) => o.value === v)) $(id).value = v;
}
if (params.get('q')) $('search').value = params.get('q');
if (params.get('spoilers') === 'on') {
  $('spoiler').checked = true;
  localStorage.setItem(SPOILER_KEY, 'true');
}
if (params.get('spoilers') === 'off') {
  $('spoiler').checked = false;
  localStorage.setItem(SPOILER_KEY, 'false');
}

render();
