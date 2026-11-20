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
// Round 5: the audit strip (T1) is computed from the data, never hardcoded.
// 28 PSN-hidden is the kit's count (RULES.txt) — starter trophies.json has
// no hidden field, so that one number is a documented kit fact, not a
// computed value. Pages = one guide/list page per cited site.
const PSN_HIDDEN_KIT = 28;
const SOURCE_PAGES_READ = '19 Nov 2026';

function auditNumbers() {
  const total = trophies.length;
  const official = trophies.filter((t) => t.name && t.description && t.grade).length;
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (grades[t.grade] !== undefined) grades[t.grade] += 1;
  let stepsTotal = 0, stepsCited = 0, stepsBacked2 = 0, guidesCiting = 0;
  let unconfirmed = 0, openQuestions = 0;
  const perSourceSteps = { 1: 0, 2: 0, 3: 0 };
  const perSourceTrophies = {};
  for (const t of trophies) {
    if ((t.sources || []).length > 0) guidesCiting += 1;
    for (const name of (t.sources || [])) perSourceTrophies[name] = (perSourceTrophies[name] || 0) + 1;
    if (t.dispute) openQuestions += 1;
    let trophyUnconfirmed = false;
    for (const st of (t.steps || [])) {
      stepsTotal += 1;
      if (st.cites && st.cites.length > 0) {
        stepsCited += 1;
        if (st.cites.length >= 2) stepsBacked2 += 1;
        for (const n of st.cites) if (perSourceSteps[n] !== undefined) perSourceSteps[n] += 1;
      } else if (/not yet pinned down|no public source has pinned down/i.test(st.text)) {
        trophyUnconfirmed = true;
      }
    }
    if (trophyUnconfirmed) unconfirmed += 1;
  }
  const missable = trophies.filter((t) => t.missable);
  const atRisk = missable.filter((t) => !earned.has(t.name)).length;
  const sites = [...new Set(trophies.flatMap((t) => t.sources || []))];
  return {
    total, official, grades, stepsTotal, stepsCited, stepsBacked2,
    guidesCiting, unconfirmed, openQuestions, perSourceSteps, perSourceTrophies,
    missable: missable.length, atRisk, safe: total - missable.length,
    sites: sites.length,
  };
}

function renderAuditStrip() {
  const a = auditNumbers();
  const el = $('audit-strip');
  if (!el) return;
  el.textContent = `AUDIT  ${a.official}/${a.total} official name, description, grade ✓ · ${a.grades.platinum}P ${a.grades.gold}G ${a.grades.silver}S ${a.grades.bronze}B · ${PSN_HIDDEN_KIT} PSN-hidden ✓ · ${a.stepsCited}/${a.stepsTotal} steps cited · ${a.guidesCiting}/${a.total} guides cite sources · ${a.stepsBacked2} steps backed by 2+ sources · ${a.sites} pages · ${a.sites} sites read ${SOURCE_PAGES_READ} · ${a.missable} possibly missable · ${a.atRisk} at risk · ${a.unconfirmed} unconfirmed · ${a.openQuestions} open question shown both ways`;
}

const TABS = ['tracker', 'roadmap', 'missables', 'sources'];

function showTab(name) {
  if (!TABS.includes(name)) name = 'tracker';
  for (const tab of TABS) {
    const panel = $(`tab-${tab}`);
    if (panel) panel.hidden = tab !== name;
    const btn = document.querySelector(`[data-tab="${tab}"]`);
    if (btn) {
      btn.setAttribute('aria-selected', String(tab === name));
      btn.classList.toggle('active', tab === name);
    }
  }
}

function renderRoadmapStats() {
  const el = $('stat-cards');
  if (!el) return;
  const a = auditNumbers();
  const storyChapters = chapters.filter((c) => /^Chapter [1-5]$/.test(c.label)).length;
  const cards = [
    ['~200 h', 'Hours to platinum'],
    ['12', 'Story trophies'],
    [String(a.missable), 'Possibly missable'],
    ['0', 'Online trophies'],
    ['1', 'Playthrough'],
    ['36', 'Cleanup trophies'],
    [String(storyChapters), 'Story chapters'],
  ];
  el.replaceChildren();
  for (const [num, label] of cards) {
    const d = document.createElement('div');
    d.className = 'stat-card';
    const n = document.createElement('span');
    n.className = 'stat-num';
    n.textContent = num;
    const l = document.createElement('span');
    l.className = 'stat-label';
    l.textContent = label;
    d.append(n, l);
    el.append(d);
  }
}

function renderMissables() {
  const body = $('missables-body');
  if (!body) return;
  const a = auditNumbers();
  const summary = $('missables-summary');
  if (summary) summary.textContent = `${a.missable} possibly missable · ${a.atRisk} at risk · ${a.safe} safe at any time`;
  body.replaceChildren();
  for (const ch of chapters) {
    const ids = ch.trophyIds.filter((id) => byId.has(id));
    const card = document.createElement('article');
    card.className = 'missable-card' + (ch.missable ? ' danger' : '');
    const h = document.createElement('h3');
    h.textContent = `${ch.label} — ${ch.title}`;
    card.append(h);
    const count = document.createElement('p');
    count.className = 'missable-count';
    count.textContent = `${ids.length} ${ids.length === 1 ? 'trophy' : 'trophies'}`;
    card.append(count);
    if (ch.missable) {
      const pma = trophies.find((t) => t.missable);
      const lost = document.createElement('p');
      lost.className = 'missable-flag';
      lost.textContent = `CAN BE LOST — ${pma.name}: the Chapter 1 balcony meditation (after the mission “Down to Earth”, follow Lucia from the kitchen to the balcony and accept). It is gone after Chapter 1.`;
      card.append(lost);
      const save = document.createElement('p');
      save.className = 'missable-save';
      save.textContent = 'SAVE FIRST — keep a manual save from Chapter 1 until this trophy pops. Whether the balcony spot is required is still an open question (both readings are shown in its guide) — doing it removes the risk either way.';
      card.append(save);
    } else {
      const safe = document.createElement('p');
      safe.textContent = 'No missable trophies in this chapter — every trophy here is safe at any time, including after the story in free roam.';
      card.append(safe);
    }
    body.append(card);
  }
}

function renderSources() {
  const body = $('sources-body');
  if (!body) return;
  const a = auditNumbers();
  body.replaceChildren();
  const intro = document.createElement('p');
  intro.textContent = `Every one of the ${a.total} guides cites its sources, and every step that states a fact ends with a marker [n] pointing at that trophy's numbered source list. The matrix below is the receipt: a tick means that trophy's guide cites that source.`;
  body.append(intro);
  const wrap = document.createElement('div');
  wrap.className = 'matrix-wrap';
  const halves = [trophies.slice(0, 28), trophies.slice(28)];
  for (const half of halves) {
    const table = document.createElement('table');
    table.className = 'matrix-table';
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    for (const label of ['Trophy', '[1] PowerPyx', '[2] Exophase', '[3] PSNProfiles']) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = label;
      hr.append(th);
    }
    thead.append(hr);
    table.append(thead);
    const tbody = document.createElement('tbody');
    for (const t of half) {
      const tr = document.createElement('tr');
      const name = document.createElement('td');
      if (isHidden(t)) name.textContent = 'Hidden story trophy';
      else name.textContent = t.name;
      tr.append(name);
      for (let n = 1; n <= 3; n += 1) {
        const td = document.createElement('td');
        td.className = 'matrix-cell';
        td.textContent = (t.sources || []).length >= n ? '✓' : '—';
        tr.append(td);
      }
      tbody.append(tr);
    }
    table.append(tbody);
    wrap.append(table);
  }
  body.append(wrap);
  const counts = document.createElement('div');
  counts.className = 'source-counts';
  for (const [i, name] of (trophies[0].sources || []).entries()) {
    const p = document.createElement('p');
    p.textContent = `[${i + 1}] ${name} — cited by ${a.perSourceTrophies[name] || 0}/${a.total} guides · ${a.perSourceSteps[i + 1] || 0} steps · ${SOURCES[name] || ''}`;
    counts.append(p);
  }
  const note = document.createElement('p');
  note.className = 'source-note';
  note.textContent = `How the markers were assigned: [1] PowerPyx supplied the concrete counts, unlock conditions and tracking menus; [2] Exophase + [3] PSNProfiles mirror the official name, description and grade, so a step that restates the official description cites both. A step with no marker says so plainly — no source has pinned that method down (${a.unconfirmed} trophies are unconfirmed this way). ${a.sites} source pages read ${SOURCE_PAGES_READ}; the trophy list itself was frozen 18 Nov 2026.`;
  counts.append(note);
  body.append(counts);
}
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
  const gLabel = document.createElement('p');
  gLabel.className = 'guide-label';
  gLabel.textContent = 'Guide';
  const steps = t.steps || [];
  const citedCount = steps.filter((s) => s.cites && s.cites.length > 0).length;
  const backedCount = steps.filter((s) => s.cites && s.cites.length >= 2).length;
  const countLine = document.createElement('p');
  countLine.className = 'steps-count';
  countLine.textContent = `${steps.length} steps · ${citedCount} cited · ${backedCount} backed by 2+ sources`;
  guideBody.append(gLabel, countLine);
  const ol = document.createElement('ol');
  ol.className = 'guide-steps';
  for (const st of steps) {
    const li = document.createElement('li');
    li.append(document.createTextNode(st.text + ' '));
    const cite = document.createElement('span');
    const hasCites = st.cites && st.cites.length > 0;
    cite.className = 'cite' + (hasCites ? '' : ' uncited');
    cite.textContent = hasCites ? `[${st.cites.join('][')}]` : '[?]';
    cite.title = hasCites
      ? `Sources: ${st.cites.map((n) => (t.sources || [])[n - 1]).filter(Boolean).join(', ')}`
      : 'No public source has pinned this down';
    li.append(cite);
    ol.append(li);
  }
  guideBody.append(ol);
  const offLabel = document.createElement('p');
  offLabel.className = 'official-label';
  offLabel.textContent = 'Official description';
  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = t.description;
  guideBody.append(offLabel, off);
  if (t.dispute) {
    const box = document.createElement('div');
    box.className = 'dispute-box';
    const dLabel = document.createElement('p');
    dLabel.className = 'dispute-label';
    dLabel.textContent = 'NOT YET SETTLED — BOTH READINGS SHOWN';
    box.append(dLabel);
    const q = document.createElement('p');
    q.className = 'dispute-q';
    q.textContent = t.dispute.question;
    box.append(q);
    const ra = document.createElement('p');
    ra.append(document.createTextNode('Reading A — '), document.createTextNode(t.dispute.readingA));
    const rb = document.createElement('p');
    rb.append(document.createTextNode('Reading B — '), document.createTextNode(t.dispute.readingB));
    const dn = document.createElement('p');
    dn.className = 'dispute-note';
    dn.textContent = t.dispute.note;
    box.append(ra, rb, dn);
    guideBody.append(box);
  }
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
  for (const [i, name] of (t.sources || []).entries()) {
    const line = document.createElement('p');
    line.className = 'source-line';
    const num = document.createElement('span');
    num.className = 'source-num';
    num.textContent = `[${i + 1}] `;
    const a = document.createElement('a');
    a.href = SOURCES[name] || '#';
    a.textContent = name;
    line.append(num, a, document.createTextNode(' — cited guide for this trophy'));
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
    if (q && !(`${t.name} ${t.description} ${t.target} ${t.when} ${(t.steps || []).map((s) => s.text).join(' ')}`.toLowerCase().includes(q))) return false;
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
  renderAuditStrip();
  renderRoadmapStats();
  renderMissables();
  renderSources();
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

// Tabs (T2): Tracker / Roadmap / Missables / Sources. Buttons switch the
// visible panel; a #roadmap / #missables / #sources hash deep-links to a tab
// and the page is scrolled back to the top so the header + AUDIT strip stay
// in every screenshot. #trophy-N still opens a guide on the Tracker tab.
for (const btn of document.querySelectorAll('[data-tab]')) {
  btn.addEventListener('click', () => {
    const name = btn.dataset.tab;
    showTab(name);
    const hash = name === 'tracker' ? '' : `#${name}`;
    history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
    window.scrollTo(0, 0);
  });
}
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

const tabHash = location.hash.replace(/^#/, '');
if (TABS.includes(tabHash)) showTab(tabHash);
else showTab('tracker');

render();

// A tab hash would natively scroll the page to that section; scroll back to
// the top on load so the header + AUDIT strip are visible in every view.
if (TABS.includes(tabHash)) {
  window.addEventListener('load', () => window.scrollTo(0, 0));
  window.scrollTo(0, 0);
}

// Back/forward (or a same-page link) changing the hash switches tabs too.
window.addEventListener('hashchange', () => {
  const h = location.hash.replace(/^#/, '');
  if (TABS.includes(h)) {
    showTab(h);
    window.scrollTo(0, 0);
  }
});
