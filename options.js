// BlockNet options page — vanilla JS

/* ── Icons ─────────────────────────────────────────────────────────────── */
const ICONS = {
  shield:   ["M12 3l7 3v5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6l7-3z"],
  check:    ["M5 12l5 5L19 7"],
  grid:     ["M4 5h7v6H4z","M13 5h7v4h-7z","M13 11h7v8h-7z","M4 13h7v6H4z"],
  calendar: ["M5 6h14v13H5z","M5 10h14","M9 4v3M15 4v3"],
  target:   ["M12 3a9 9 0 100 18 9 9 0 000-18z","M12 8a4 4 0 100 8 4 4 0 000-8z","M12 11.5a.5.5 0 100 1 .5.5 0 000-1z"],
  chart:    ["M5 20V10","M12 20V4","M19 20v-7","M3 20h18"],
  settings: ["M12 9a3 3 0 100 6 3 3 0 000-6z","M12 3l1.3 2.2 2.5-.3.8 2.4 2.2 1.3-.9 2.4.9 2.4-2.2 1.3-.8 2.4-2.5-.3L12 21l-1.3-2.2-2.5.3-.8-2.4L5.2 15l.9-2.4-.9-2.4 2.2-1.3.8-2.4 2.5.3z"],
  plus:     ["M12 5v14","M5 12h14"],
  chat:     ["M5 5h14a1 1 0 011 1v8a1 1 0 01-1 1H9l-4 3v-3a1 1 0 01-1-1V6a1 1 0 011-1z"],
  news:     ["M4 5h13v14H5a1 1 0 01-1-1z","M17 9h3v8a1 1 0 01-1 1","M7 8h7M7 11h7M7 14h4"],
  film:     ["M4 5h16v14H4z","M4 9h16M4 15h16M9 5v14M15 5v14"],
  cart:     ["M4 5h2l1.5 10h9L18 8H7","M9 19.5a.5.5 0 100 1 .5.5 0 000-1z","M16 19.5a.5.5 0 100 1 .5.5 0 000-1z"],
  game:     ["M7 9h10a4 4 0 014 4 3 3 0 01-5.2 2H8.2A3 3 0 013 13a4 4 0 014-4z","M8 12v2M7 13h2M15.5 12.5h.01M17 14h.01"],
  eyeoff:   ["M4 4l16 16","M9.9 5.2A9 9 0 0112 5c5 0 9 5 9 7a11 11 0 01-2 2.6","M6 7.5C3.8 9 3 11 3 12c0 1.4 4 6 9 6a8.6 8.6 0 003.3-.7","M9.9 14.1A3 3 0 0114 9.9"],
  clock:    ["M12 7v5l3 2","M12 3a9 9 0 100 18 9 9 0 000-18z"],
  brain:    ["M9 4a3 3 0 00-3 3 3 3 0 00-1 5.5A3 3 0 007 17a3 3 0 003 3V4z","M15 4a3 3 0 013 3 3 3 0 011 5.5A3 3 0 0117 17a3 3 0 01-3 3V4z"],
  book:     ["M5 4h11a2 2 0 012 2v13a1 1 0 00-1-1H5z","M5 18a1 1 0 00-1 1V5a1 1 0 011-1"],
  moon:     ["M20 14a8 8 0 11-9.9-9.8A6.5 6.5 0 0020 14z"],
  flame:    ["M12 3c1 3-2 4-2 7a4 4 0 008 0c0-2-1-3-1-4 2 1 3 3 3 6a8 8 0 01-16 0c0-4 4-6 8-9z"],
  bolt:     ["M13 3L5 13h6l-1 8 8-10h-6z"],
  power:    ["M12 4v8","M7.5 7a7 7 0 109 0"],
  blocknet: [
    "M12 3l7 3v5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6l7-3z",
    "M8.5 10.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0",
    "M9 7.5l6 6"
  ]
};
function icon(name, attrs = "") {
  const paths = (ICONS[name] || []).map(d => `<path d="${d}"/>`).join("");
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ${attrs}>${paths}</svg>`;
}

const CAT_META = {
  social: { nameKey: "cat_social", icon: "chat",   count: 14   },
  news:   { nameKey: "cat_news",   icon: "news",   count: 9    },
  ent:    { nameKey: "cat_ent",    icon: "film",   count: 16   },
  shop:   { nameKey: "cat_shop",   icon: "cart",   count: 11   },
  game:   { nameKey: "cat_game",   icon: "game",   count: 7    },
  adult:  { nameKey: "cat_adult",  icon: "eyeoff", count: 1000 }
};

const FAV_COLORS = ["#5b7cfa","#e0567f","#36b37e","#f5a623","#9b6dff","#1fb6c9"];
const favColor = u => FAV_COLORS[[...u].reduce((a,c) => a + c.charCodeAt(0), 0) % FAV_COLORS.length];

/* ── i18n helper ───────────────────────────────────────────────────────── */
const t = (k, ...subs) => chrome.i18n.getMessage(k, subs.length ? subs : undefined) || k;

const DAYS = () => [0,1,2,3,4,5,6].map(i => t(`day_${i}_short`));

/* ── State ─────────────────────────────────────────────────────────────── */
let state   = null;
let navId   = "blocklist";
let draft   = "";
let savedTimer = null;
let panelListenerController = null;

async function loadState() {
  state = await chrome.runtime.sendMessage({ type: "GET_STATE" });
}

async function patchState(patch) {
  state = { ...state, ...patch };
  await chrome.runtime.sendMessage({ type: "SET_STATE", patch });
  showSaved();
}

function showSaved() {
  const el = document.getElementById("saved-badge");
  if (el) { el.style.opacity = "1"; clearTimeout(savedTimer); savedTimer = setTimeout(() => { el.style.opacity = "0"; }, 2500); }
}

/* ── Top-level render ──────────────────────────────────────────────────── */
function render() {
  const blocked = computeBlocked();
  const schOnCount = (state.schedules || []).filter(s => s.on).length;
  const on = state.master !== false;

  document.getElementById("root").innerHTML = `
    <div class="op">
      ${renderTopBar()}
      <div style="position:relative">
        <div class="op-shell" ${!on ? 'style="opacity:0.25;pointer-events:none;user-select:none"' : ''}>
          <aside class="op-side">
            ${renderSideNav(blocked, schOnCount)}
            ${renderSideFoot()}
          </aside>
          <main class="op-main" id="op-main">
            ${renderPanel()}
          </main>
        </div>
        ${!on ? renderOptionsPausedOverlay() : ''}
      </div>
    </div>`;

  attachEvents();
}

function renderOptionsPausedOverlay() {
  return `
    <div style="
      position:absolute;inset:0;
      display:flex;align-items:center;justify-content:center;
      z-index:10;
      pointer-events:all;
    ">
      <div style="
        background:var(--panel);border:1px solid var(--border);border-radius:18px;
        padding:40px 48px;text-align:center;
        box-shadow:0 8px 40px rgba(25,34,58,0.12);
        display:flex;flex-direction:column;align-items:center;gap:16px;
        max-width:400px;width:100%;
      ">
        <div style="
          width:72px;height:72px;border-radius:20px;
          background:var(--panel-2);border:1px solid var(--border);
          display:grid;place-items:center;color:var(--faint);
        ">
          ${icon("power","style='width:32px;height:32px'")}
        </div>
        <div>
          <div style="font-size:18px;font-weight:720;letter-spacing:-0.02em;color:var(--text)">
            ${t("protection_paused_title")}
          </div>
          <div style="font-size:13.5px;color:var(--muted);margin-top:6px;line-height:1.55">
            ${t("protection_paused_desc")}
          </div>
        </div>
        <button
          data-action="enable-master-options"
          style="
            appearance:none;font-family:inherit;cursor:pointer;
            background:var(--accent);color:#fff;border:0;
            border-radius:10px;padding:11px 22px;
            font-size:14px;font-weight:640;letter-spacing:-0.01em;
            display:inline-flex;align-items:center;gap:8px;
            box-shadow:0 4px 14px -4px rgba(58,91,217,0.5);
            transition:filter .14s;
          ">
          ${icon("shield","stroke='#fff' style='width:17px;height:17px'")} ${t("btn_enable_protection")}
        </button>
      </div>
    </div>`;
}

function computeBlocked() {
  if (!state) return 0;
  const cats = state.categories || [];
  return cats.filter(c => c.on).reduce((a,c) => a + (CAT_META[c.id]?.count || 0), 0) + (state.customSites || []).length;
}

function renderTopBar() {
  const on = state.master !== false;
  return `
    <div class="op-top">
      <div class="op-brand-link" id="back-to-popup">
        <div class="op-logo">${icon("blocknet",'stroke="#fff"')}</div>
        <div class="op-brand">BlockNet <small>${t("settings_label")}</small></div>
      </div>
      <div class="op-top-right">
        <span class="op-saved" id="saved-badge" style="opacity:0;transition:opacity .3s">
          ${icon("check")} ${t("changes_saved")}
        </span>
        <span class="op-master">
          ${t("protection_label")}
          <button class="op-toggle ${on?"on":""}" data-action="toggle-master"><span class="op-knob"></span></button>
        </span>
      </div>
    </div>`;
}

function renderSideNav(blocked, schOnCount) {
  const navItems = [
    { id: "blocklist", label: t("nav_blocklist"), icon: "grid",     badge: blocked > 999 ? "1k+" : String(blocked) },
    { id: "schedules", label: t("nav_schedules"), icon: "calendar", badge: String(schOnCount) },
    { id: "sessions",  label: t("nav_sessions"),  icon: "target",   badge: null },
    { id: "stats",     label: t("nav_stats"),     icon: "chart",    badge: null },
    { id: "prefs",     label: t("nav_prefs"),     icon: "settings", badge: null }
  ];
  return navItems.map(n => `
    <button class="op-nav ${navId===n.id?"active":""}" data-nav="${n.id}">
      ${icon(n.icon)} ${n.label}
      ${n.badge !== null ? `<span class="op-nav-badge">${n.badge}</span>` : ""}
    </button>`).join("");
}

function renderSideFoot() {
  const st = state.stats || {};
  const focMin = liveFocusedTodayMin();
  const focH = Math.floor(focMin / 60);
  const focM = Math.floor(focMin % 60);
  return `
    <div class="op-side-foot">
      <div class="l">${t("current_streak")}</div>
      <div class="n">${icon("flame")} ${t("streak_days", st.streak || 0)}</div>
      <div class="s">${t("focused_today_footer", focH, focM)}</div>
    </div>`;
}

/* ── Panel routing ─────────────────────────────────────────────────────── */
function renderPanel() {
  if (navId === "blocklist") return renderBlocklist();
  if (navId === "schedules") return renderSchedules();
  if (navId === "sessions")  return renderSessions();
  if (navId === "stats")     return renderStats();
  if (navId === "prefs")     return renderPrefs();
  return "";
}

/* ── Blocklist panel ───────────────────────────────────────────────────── */
function renderBlocklist() {
  const cats = state.categories || [];
  const activeCats = cats.filter(c => c.on).length;
  const sites = state.customSites || [];

  return `
    <div class="op-panel" id="panel-blocklist">
      <div class="op-h">
        <div class="op-h-tt">
          <div class="op-h-title">${t("blocklist_title")}</div>
          <div class="op-h-desc">${t("blocklist_desc")}</div>
        </div>
      </div>

      <div class="op-sub">
        ${t("section_categories")} <span class="ln"></span>
        <span style="color:var(--muted);text-transform:none;letter-spacing:0;font-weight:600">${t("categories_active", activeCats, cats.length)}</span>
      </div>
      <div class="op-cats">
        ${cats.map(c => {
          const m = CAT_META[c.id] || {};
          return `
            <div class="op-cat ${c.on?"on":""}">
              <div class="op-cat-ic">${icon(m.icon||"grid")}</div>
              <div class="op-cat-m">
                <div class="op-cat-name">${m.nameKey ? t(m.nameKey) : c.id}</div>
                <div class="op-cat-meta">${t("known_sites_count", (m.count||0) >= 1000 ? "1,000+" : m.count)}</div>
              </div>
              <button class="op-toggle ${c.on?"on":""}" data-action="toggle-cat" data-id="${c.id}">
                <span class="op-knob"></span>
              </button>
            </div>`;
        }).join("")}
      </div>

      <div class="op-sub">${t("custom_blocked_sites")} <span class="ln"></span></div>
      <div class="op-add" style="margin-bottom:14px">
        <input class="op-input" id="site-input" placeholder="${t("input_add_site_ph")}"
          value="${escHtml(draft)}" />
        <button class="op-btn primary" data-action="add-site">${icon("plus",'stroke="#fff"')} ${t("btn_block_site")}</button>
      </div>
      <div class="op-card">
        <div class="op-table">
          <div class="op-tr head">
            <div class="op-td-site"><span class="op-th">${t("th_site")}</span></div>
            <div class="op-td-cat"><span class="op-th">${t("th_category")}</span></div>
            <div class="op-td-date"><span class="op-th">${t("th_added")}</span></div>
            <div class="op-td-act"></div>
          </div>
          ${sites.length === 0
            ? `<div style="padding:24px;text-align:center;color:var(--faint);font-size:13.5px">${t("no_custom_blocked")}</div>`
            : sites.map(s => `
              <div class="op-tr">
                <div class="op-td-site">
                  <span class="op-fav" style="background:${favColor(s.url)}">${s.url[0].toUpperCase()}</span>
                  <span class="u">${escHtml(s.url)}</span>
                </div>
                <div class="op-td-cat"><span class="op-tag">${escHtml(s.cat||"Custom")}</span></div>
                <div class="op-td-date">${escHtml(s.date||"")}</div>
                <div class="op-td-act">
                  <button class="op-link" data-action="remove-site" data-id="${s.id}">${t("btn_unblock")}</button>
                </div>
              </div>`).join("")}
        </div>
      </div>
    </div>`;
}

/* ── Schedules panel ───────────────────────────────────────────────────── */
function renderSchedules() {
  const scheds = state.schedules || [];
  const days = DAYS();
  return `
    <div class="op-panel" id="panel-schedules">
      <div class="op-h">
        <div class="op-h-tt">
          <div class="op-h-title">${t("schedules_title")}</div>
          <div class="op-h-desc">${t("schedules_desc")}</div>
        </div>
        <button class="op-btn primary" data-action="new-schedule">${icon("plus",'stroke="#fff"')} ${t("btn_new_schedule")}</button>
      </div>
      <div class="op-card">
        ${scheds.map(s => `
          <div class="op-sched">
            <div class="op-sched-ic">${icon("clock")}</div>
            <div class="op-sched-m">
              <div class="op-sched-name">${escHtml(s.name)}</div>
              <div class="op-sched-time">${s.start} – ${s.end}</div>
              <div class="op-days">
                ${s.days.map((d,i) => `<span class="op-day ${d?"on":""}" data-action="toggle-day" data-sid="${s.id}" data-di="${i}">${days[i]}</span>`).join("")}
              </div>
            </div>
            <button class="op-toggle ${s.on?"on":""}" data-action="toggle-schedule" data-id="${s.id}">
              <span class="op-knob"></span>
            </button>
            <button class="op-link" data-action="remove-schedule" data-id="${s.id}"
                    style="color:var(--danger);white-space:nowrap" title="${t("btn_remove")}">${t("btn_remove")}</button>
          </div>`).join("")}
      </div>
    </div>`;
}

/* ── Sessions panel ────────────────────────────────────────────────────── */
const DEFAULT_PRESETS = [
  { nameKey: "preset_deep_name",  icon: "brain", dur: 50, unit: "min", msgKey: "preset_deep_msg",  strict: "hard" },
  { nameKey: "preset_study_name", icon: "book",  dur: 25, unit: "min", msgKey: "preset_study_msg", strict: "hard" },
  { nameKey: "preset_sleep_name", icon: "moon",  dur: 0,  unit: "",    msgKey: "preset_sleep_msg", strict: "soft" }
];

function getPresets() {
  return state.sessionPresets && state.sessionPresets.length
    ? state.sessionPresets
    : DEFAULT_PRESETS;
}

function renderSessions() {
  const presets = getPresets();
  return `
    <div class="op-panel">
      <div class="op-h">
        <div class="op-h-tt">
          <div class="op-h-title">${t("sessions_title")}</div>
          <div class="op-h-desc">${t("sessions_desc")}</div>
        </div>
        <button class="op-btn ghost" data-action="add-preset">${icon("plus")} ${t("btn_add_preset")}</button>
      </div>
      <div class="op-presets">
        ${presets.map((p, i) => {
          const name = p.nameKey ? t(p.nameKey) : escHtml(p.name || "Preset");
          const msg  = p.msgKey  ? t(p.msgKey)  : escHtml(p.msg  || "");
          return `
            <div class="op-preset">
              <div class="op-preset-ic">${icon(p.icon)}</div>
              <div class="op-preset-name">${name}</div>
              <div class="op-preset-dur">${p.dur || "∞"}<small> ${escHtml(p.unit)}</small></div>
              <div class="op-preset-msg">"${msg}"</div>
              <div class="op-preset-foot">
                <span class="op-strict ${p.strict}">${p.strict === "hard" ? t("hard_block") : t("soft_block")}</span>
                <button class="op-btn ghost sm" data-action="edit-preset" data-index="${i}" style="margin-left:auto">
                  ${icon("settings")} ${t("btn_edit")}
                </button>
              </div>
            </div>`;
        }).join("")}
      </div>

      <div class="op-sub">${t("default_behaviour")} <span class="ln"></span></div>
      <div class="op-card">
        ${renderSetRow(t("break_reminders"), t("break_reminders_desc"), "breakReminders", true)}
        ${renderSetRow(t("auto_start_sprint"), t("auto_start_sprint_desc"), "autoStart", false)}
      </div>
    </div>`;
}

function renderSetRow(name, desc, key, defaultOn) {
  const on = state.preferences ? (state.preferences[key] !== undefined ? state.preferences[key] : defaultOn) : defaultOn;
  return `
    <div class="op-set">
      <div class="op-set-m">
        <div class="op-set-name">${name}</div>
        <div class="op-set-desc">${desc}</div>
      </div>
      <button class="op-toggle ${on?"on":""}" data-action="toggle-pref" data-key="${key}">
        <span class="op-knob"></span>
      </button>
    </div>`;
}

/* ── Week day labels aligned to today ─────────────────────────────────── */
function weekLabels(short) {
  const todayDow = new Date().getDay();
  return Array.from({length: 7}, (_, i) => {
    const dow = (todayDow - 6 + i + 7) % 7;
    return t(short ? `day_${dow}_short` : `day_${dow}`);
  });
}

/* ── Live focused-today including any running session ──────────────────── */
function liveFocusedTodayMin() {
  let min = (state.stats && state.stats.focusedTodayMin) || 0;
  const s = state.currentSession;
  if (s) {
    let elapsed = s.pausedElapsed || 0;
    if (s.running) elapsed += (Date.now() - s.startedAt) / 1000;
    min += elapsed / 60;
  }
  return min;
}

/* ── Stats panel ───────────────────────────────────────────────────────── */
function renderStats() {
  const st = state.stats || {};

  const focusChartData = [...(st.weekData || [0,0,0,0,0,0,0]).slice(0, 6), liveFocusedTodayMin() / 60];
  const focusMax       = Math.max(...focusChartData, 0.1);
  const days           = weekLabels(false);
  const weekFocusTotal = focusChartData.reduce((a,v) => a + v, 0);

  const weekBlocks = (st.weekBlockData || [0,0,0,0,0,0,0]).slice(0, 6).reduce((a,v) => a+v, 0)
                   + (st.blockedToday || 0);

  const focMin  = liveFocusedTodayMin();
  const focH    = Math.floor(focMin / 60);
  const focM    = Math.floor(focMin % 60);

  const totalFocMin = st.totalFocusedMinAllTime || 0;
  const totFocH     = Math.floor(totalFocMin / 60);
  const totFocM     = Math.floor(totalFocMin % 60);

  const sitesGuarded = computeBlocked();

  const top    = Object.entries(st.topBlocked || {}).sort((a,b) => b[1]-a[1]).slice(0, 5);
  const topMax = top[0] ? top[0][1] : 1;
  const topTotal = Object.values(st.topBlocked || {}).reduce((a,v) => a+v, 0);

  return `
    <div class="op-panel">
      <div class="op-h">
        <div class="op-h-tt">
          <div class="op-h-title">${t("stats_title")}</div>
          <div class="op-h-desc">${t("stats_desc")}</div>
        </div>
        <button class="op-btn ghost" id="stats-refresh-btn">${icon("bolt")} ${t("btn_refresh")}</button>
      </div>

      <div class="op-stat-grid">
        <div class="op-stat">
          <div class="op-stat-num accent">${icon("flame","style='width:24px;height:24px'")} ${st.streak||0}</div>
          <div class="op-stat-lbl">${t("stat_streak")}</div>
        </div>
        <div class="op-stat">
          <div class="op-stat-num">${totFocH}<small>h</small> ${totFocM}<small>m</small></div>
          <div class="op-stat-lbl">${t("stat_total_focused")}</div>
        </div>
        <div class="op-stat">
          <div class="op-stat-num">${(st.totalBlockedAllTime || 0).toLocaleString()}</div>
          <div class="op-stat-lbl">${t("stat_total_blocks")}</div>
        </div>
        <div class="op-stat">
          <div class="op-stat-num">${sitesGuarded.toLocaleString()}</div>
          <div class="op-stat-lbl">${t("stat_sites_blocklist")}</div>
        </div>
      </div>

      <div class="op-sub" style="margin-top:20px">${t("activity_today")} <span class="ln"></span></div>
      <div class="op-card" style="padding:14px 18px;display:flex;gap:40px;flex-wrap:wrap">
        <div>
          <div style="font-size:26px;font-weight:720;letter-spacing:-0.03em;font-variant-numeric:tabular-nums">
            ${st.blockedToday || 0}
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:3px">${t("stat_blocked_today")}</div>
        </div>
        <div>
          <div style="font-size:26px;font-weight:720;letter-spacing:-0.03em;font-variant-numeric:tabular-nums">
            ${focH}<span style="font-size:14px;font-weight:600;color:var(--muted)">h</span>
            ${focM}<span style="font-size:14px;font-weight:600;color:var(--muted)">m</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:3px">${t("stat_focused_today")}</div>
        </div>
        <div>
          <div style="font-size:26px;font-weight:720;letter-spacing:-0.03em;font-variant-numeric:tabular-nums">
            ${weekBlocks}
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:3px">${t("blocked_this_week")}</div>
        </div>
        <div>
          <div style="font-size:26px;font-weight:720;letter-spacing:-0.03em;font-variant-numeric:tabular-nums">
            ${weekFocusTotal.toFixed(1)}<span style="font-size:14px;font-weight:600;color:var(--muted)">h</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:3px">${t("focused_this_week")}</div>
        </div>
      </div>

      <div class="op-sub">${t("focus_time_chart")} <span class="ln"></span></div>
      <div class="op-card pad">
        <div class="op-chart">
          ${focusChartData.map((h,i) => `
            <div class="op-barw ${i===6?"today":""}">
              <div class="op-bar ${i===6?"on":""}" style="height:${(h/focusMax)*100}%">
                <span class="v">${h > 0 ? h.toFixed(1)+"h" : ""}</span>
              </div>
              <div class="d">${days[i]}</div>
            </div>`).join("")}
        </div>
      </div>

      <div class="op-sub">
        ${t("most_blocked_title")}
        <span class="ln"></span>
        <span style="color:var(--muted);text-transform:none;letter-spacing:0;font-weight:600">
          ${t("total_blocks_label", topTotal.toLocaleString())}
        </span>
      </div>
      <div class="op-card">
        <div class="op-toplist">
          ${top.length === 0
            ? `<div style="padding:20px 18px;color:var(--faint);font-size:13px">
                ${t("no_blocks_recorded")}
               </div>`
            : top.map(([u,c],i) => `
              <div class="op-toprow">
                <span class="rk">${i+1}</span>
                <span class="u">${escHtml(u)}</span>
                <span class="meter"><i style="width:${(c/topMax)*100}%"></i></span>
                <span class="ct">${c.toLocaleString()}×</span>
              </div>`).join("")}
        </div>
      </div>
    </div>`;
}

/* ── Preferences panel ─────────────────────────────────────────────────── */
function renderPrefs() {
  const p = state.preferences || {};
  const unblock = p.unblockDifficulty || "easy";
  const tempMin = Number(p.tempAccessMin) || 5;
  const msg = p.motivationalMsg || t("blocked_default_msg");

  return `
    <div class="op-panel">
      <div class="op-h">
        <div class="op-h-tt">
          <div class="op-h-title">${t("prefs_title")}</div>
          <div class="op-h-desc">${t("prefs_desc")}</div>
        </div>
      </div>

      <div class="op-sub">${t("unblocking_section")} <span class="ln"></span></div>
      <div class="op-card">
        <div class="op-set">
          <div class="op-set-m">
            <div class="op-set-name">${t("unblock_difficulty")}</div>
            <div class="op-set-desc">${t("unblock_difficulty_desc")}</div>
          </div>
          <div class="op-seg">
            ${[["easy", t("one_tap")],["wait", t("wait_15s")],["locked", t("locked")]].map(([v,l]) =>
              `<button class="${unblock===v?"on":""}" data-action="set-unblock" data-val="${v}">${l}</button>`
            ).join("")}
          </div>
        </div>
        <div class="op-set">
          <div class="op-set-m">
            <div class="op-set-name">${t("temp_access_length")}</div>
            <div class="op-set-desc">${t("temp_access_desc")}</div>
          </div>
          <div class="op-seg">
            ${[5,10,30].map(m =>
              `<button class="${tempMin===m?"on":""}" data-action="set-temp-min" data-val="${m}">${m} min</button>`
            ).join("")}
          </div>
        </div>
      </div>

      <div class="op-sub">${t("block_screen_section")} <span class="ln"></span></div>
      <div class="op-card pad">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="flex:1">
            <div class="op-set-name" style="margin-bottom:4px">${t("motivational_message")}</div>
            <div class="op-set-desc" style="margin-bottom:12px">${t("motivational_msg_desc")}</div>
            <input class="op-input" id="msg-input" value="${escHtml(msg)}" style="width:100%" />
          </div>
          <button class="op-btn ghost" id="preview-btn" style="margin-top:24px;white-space:nowrap">
            ${icon("target")} ${t("btn_preview")}
          </button>
        </div>
      </div>

      <div class="op-sub">${t("general_section")} <span class="ln"></span></div>
      <div class="op-card">
        ${renderSetRow(t("session_notifs"),   t("session_notifs_desc"),   "notif",  true)}
        ${renderSetRow(t("streak_reminders"), t("streak_reminders_desc"), "streak", true)}
        ${renderSetRow(t("show_block_counter"), t("show_block_counter_desc"), "count", true)}
      </div>
    </div>`;
}

/* ── Modals ─────────────────────────────────────────────────────────────── */
function showModal(html, onReady) {
  document.querySelector(".op-modal-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "op-modal-overlay";
  overlay.innerHTML = `<div class="op-modal">${html}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
  onReady(overlay, overlay.querySelector(".op-modal"));
}

function openNewScheduleModal() {
  const days = DAYS();
  showModal(`
    <div class="op-modal-title">${t("modal_new_schedule")}</div>
    <div class="op-modal-row">
      <label class="op-modal-label">${t("modal_name")}</label>
      <input class="op-input" id="sched-name" placeholder="e.g. Morning Focus" />
    </div>
    <div class="op-modal-row" style="display:flex;gap:12px">
      <div style="flex:1">
        <label class="op-modal-label">${t("modal_start")}</label>
        <input class="op-input" id="sched-start" type="time" value="09:00" />
      </div>
      <div style="flex:1">
        <label class="op-modal-label">${t("modal_end")}</label>
        <input class="op-input" id="sched-end" type="time" value="12:00" />
      </div>
    </div>
    <div class="op-modal-row">
      <label class="op-modal-label">${t("modal_days")}</label>
      <div class="op-days" id="sched-days">
        ${days.map((d,i) =>
          `<span class="op-day ${i<5?"on":""}" data-di="${i}">${d}</span>`
        ).join("")}
      </div>
    </div>
    <div class="op-modal-actions">
      <button class="op-btn ghost" id="modal-cancel">${t("btn_cancel")}</button>
      <button class="op-btn primary" id="modal-save">${t("btn_add_schedule")}</button>
    </div>`,
    (overlay) => {
      overlay.querySelectorAll(".op-day").forEach(d => d.addEventListener("click", () => d.classList.toggle("on")));
      overlay.querySelector("#modal-cancel").addEventListener("click", () => overlay.remove());
      overlay.querySelector("#modal-save").addEventListener("click", async () => {
        const name  = overlay.querySelector("#sched-name").value.trim() || t("modal_new_schedule");
        const start = overlay.querySelector("#sched-start").value || "09:00";
        const end   = overlay.querySelector("#sched-end").value   || "12:00";
        const days  = [...overlay.querySelectorAll(".op-day")].map(d => d.classList.contains("on") ? 1 : 0);
        state.schedules = [...(state.schedules || []), { id: Date.now(), name, start, end, days, on: true }];
        await patchState({ schedules: state.schedules });
        overlay.remove();
        renderMainPanel();
      });
    }
  );
}

function openPresetModal(index) {
  const presets = getPresets();
  const editing = index !== null && presets[index];
  const p = editing ? presets[index] : { nameKey: null, name: "", icon: "brain", dur: 25, unit: "min", msgKey: null, msg: "", strict: "hard" };
  const displayName = p.nameKey ? t(p.nameKey) : (p.name || "");
  const displayMsg  = p.msgKey  ? t(p.msgKey)  : (p.msg  || "");

  showModal(`
    <div class="op-modal-title">${editing ? t("modal_edit_preset") : t("modal_add_preset")}</div>
    <div class="op-modal-row">
      <label class="op-modal-label">${t("modal_name")}</label>
      <input class="op-input" id="pre-name" value="${escHtml(displayName)}" placeholder="${t("preset_name_ph")}" />
    </div>
    <div class="op-modal-row" style="display:flex;gap:12px">
      <div style="flex:1">
        <label class="op-modal-label">${t("duration_label")}</label>
        <input class="op-input" id="pre-dur" type="number" min="0" max="480" value="${p.dur}" />
      </div>
      <div style="flex:1">
        <label class="op-modal-label">${t("block_type_label")}</label>
        <div class="op-seg" id="pre-strict" style="width:100%;display:flex">
          <button data-val="hard" class="${p.strict==="hard"?"on":""}">${t("hard_block")}</button>
          <button data-val="soft" class="${p.strict==="soft"?"on":""}">${t("soft_block")}</button>
        </div>
      </div>
    </div>
    <div class="op-modal-row">
      <label class="op-modal-label">${t("msg_label")}</label>
      <input class="op-input" id="pre-msg" value="${escHtml(displayMsg)}" placeholder="${t("msg_ph")}" />
    </div>
    <div class="op-modal-actions">
      ${editing ? `<button class="op-btn" id="pre-delete" style="color:var(--danger);border-color:var(--danger);background:var(--danger-soft);border:1px solid;border-radius:9px;padding:9px 15px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:640">${t("btn_delete")}</button>` : ""}
      <button class="op-btn ghost" id="pre-cancel">${t("btn_cancel")}</button>
      <button class="op-btn primary" id="pre-save">${editing ? t("btn_save_changes") : t("btn_add_preset")}</button>
    </div>`,
    (overlay) => {
      overlay.querySelectorAll("#pre-strict button").forEach(btn => {
        btn.addEventListener("click", () => {
          overlay.querySelectorAll("#pre-strict button").forEach(b => b.classList.remove("on"));
          btn.classList.add("on");
        });
      });

      overlay.querySelector("#pre-cancel").addEventListener("click", () => overlay.remove());

      if (editing) {
        overlay.querySelector("#pre-delete")?.addEventListener("click", async () => {
          const updated = [...presets];
          updated.splice(index, 1);
          state.sessionPresets = updated;
          await patchState({ sessionPresets: state.sessionPresets });
          overlay.remove();
          renderMainPanel();
        });
      }

      overlay.querySelector("#pre-save").addEventListener("click", async () => {
        const name   = overlay.querySelector("#pre-name").value.trim() || "Preset";
        const dur    = parseInt(overlay.querySelector("#pre-dur").value, 10) || 0;
        const msg    = overlay.querySelector("#pre-msg").value.trim();
        const strict = overlay.querySelector("#pre-strict .on")?.dataset.val || "hard";
        const updated = [...presets];
        const entry = { name, icon: p.icon, dur, unit: dur ? "min" : "", msg, strict };
        if (editing) updated[index] = entry; else updated.push(entry);
        state.sessionPresets = updated;
        await patchState({ sessionPresets: state.sessionPresets });
        overlay.remove();
        renderMainPanel();
      });
    }
  );
}

/* ── Events ────────────────────────────────────────────────────────────── */
function attachEvents() {
  document.querySelectorAll(".op-nav[data-nav]").forEach(btn => {
    btn.addEventListener("click", async () => {
      navId = btn.dataset.nav;
      if (navId === "stats") await loadState();
      renderMainPanel();
      document.querySelectorAll(".op-nav").forEach(b => b.classList.toggle("active", b.dataset.nav === navId));
    });
  });

  const back = document.getElementById("back-to-popup");
  if (back) back.addEventListener("click", () => window.close());

  document.querySelector("[data-action='toggle-master']")?.addEventListener("click", async () => {
    state.master = !state.master;
    await patchState({ master: state.master });
    render();
  });

  document.querySelector("[data-action='enable-master-options']")?.addEventListener("click", async () => {
    state.master = true;
    await patchState({ master: state.master });
    render();
  });

  attachPanelEvents();
}

function attachPanelEvents() {
  if (panelListenerController) panelListenerController.abort();
  panelListenerController = new AbortController();
  const { signal } = panelListenerController;

  const main = document.getElementById("op-main");
  if (!main) return;

  main.addEventListener("click", async e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "toggle-cat") {
      const id = btn.dataset.id;
      state.categories = state.categories.map(c => c.id === id ? { ...c, on: !c.on } : c);
      await patchState({ categories: state.categories });
      renderMainPanel();
    }

    if (action === "add-site") await doAddSite();

    if (action === "remove-site") {
      const id = parseInt(btn.dataset.id, 10);
      state.customSites = (state.customSites || []).filter(s => s.id !== id);
      await patchState({ customSites: state.customSites });
      renderMainPanel();
    }

    if (action === "add-preset") openPresetModal(null);

    if (action === "edit-preset") openPresetModal(parseInt(btn.dataset.index, 10));

    if (action === "toggle-schedule") {
      const id = parseInt(btn.dataset.id, 10);
      state.schedules = state.schedules.map(s => s.id === id ? { ...s, on: !s.on } : s);
      await patchState({ schedules: state.schedules });
      renderMainPanel();
    }

    if (action === "remove-schedule") {
      const id = parseInt(btn.dataset.id, 10);
      state.schedules = (state.schedules || []).filter(s => s.id !== id);
      await patchState({ schedules: state.schedules });
      renderMainPanel();
    }

    if (action === "toggle-day") {
      const sid = parseInt(btn.dataset.sid, 10);
      const di  = parseInt(btn.dataset.di, 10);
      state.schedules = state.schedules.map(s =>
        s.id === sid ? { ...s, days: s.days.map((d,i) => i===di ? (d?0:1) : d) } : s
      );
      await patchState({ schedules: state.schedules });
      renderMainPanel();
    }

    if (action === "new-schedule") openNewScheduleModal();

    if (action === "toggle-pref") {
      const key = btn.dataset.key;
      const PREF_DEFAULTS = { breakReminders: true, autoStart: false, notif: true, streak: true, sync: false, count: true };
      const current = state.preferences[key] !== undefined ? state.preferences[key] : (PREF_DEFAULTS[key] ?? false);
      state.preferences = { ...state.preferences, [key]: !current };
      await patchState({ preferences: state.preferences });
      renderMainPanel();
    }

    if (action === "set-unblock") {
      state.preferences = { ...state.preferences, unblockDifficulty: btn.dataset.val };
      await patchState({ preferences: state.preferences });
      renderMainPanel();
    }

    if (action === "set-temp-min") {
      state.preferences = { ...state.preferences, tempAccessMin: parseInt(btn.dataset.val,10) };
      await patchState({ preferences: state.preferences });
      renderMainPanel();
    }
  }, { signal });

  const siteInput = main.querySelector("#site-input");
  if (siteInput) {
    siteInput.addEventListener("input", e => { draft = e.target.value; }, { signal });
    siteInput.addEventListener("keydown", e => { if (e.key === "Enter") doAddSite(); }, { signal });
  }

  const msgInput = main.querySelector("#msg-input");
  if (msgInput) {
    let debounce;
    msgInput.addEventListener("input", e => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        state.preferences = { ...state.preferences, motivationalMsg: e.target.value };
        await patchState({ preferences: state.preferences });
      }, 600);
    }, { signal });
  }

  const previewBtn = main.querySelector("#preview-btn");
  if (previewBtn) {
    previewBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("blocked.html?site=youtube.com&cat=ent") });
    }, { signal });
  }

  const refreshBtn = main.querySelector("#stats-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await loadState();
      renderMainPanel();
    }, { signal });
  }
}

function renderMainPanel() {
  const main = document.getElementById("op-main");
  if (main) { main.innerHTML = renderPanel(); attachPanelEvents(); }
  const blocked = computeBlocked();
  const schOnCount = (state.schedules || []).filter(s => s.on).length;
  document.querySelectorAll(".op-nav").forEach(btn => {
    const id = btn.dataset.nav;
    const badge = btn.querySelector(".op-nav-badge");
    if (!badge) return;
    if (id === "blocklist") badge.textContent = blocked > 999 ? "1k+" : blocked;
    if (id === "schedules") badge.textContent = schOnCount;
  });
}

async function doAddSite() {
  const input = document.getElementById("site-input");
  const raw = (input ? input.value : draft).trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
  if (!raw) return;
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  state.customSites = [{ id: Date.now(), url: raw, cat: "Custom", date: today }, ...(state.customSites || [])];
  draft = "";
  await patchState({ customSites: state.customSites });
  renderMainPanel();
}

/* ── Helpers ───────────────────────────────────────────────────────────── */
function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ── Live stats refresh ────────────────────────────────────────────────── */
function refreshSidebarFoot() {
  const el = document.querySelector(".op-side-foot");
  if (!el) return;
  const st = state.stats || {};
  const focMin = liveFocusedTodayMin();
  const focH = Math.floor(focMin / 60);
  const focM = Math.floor(focMin % 60);
  el.innerHTML = `
    <div class="l">${t("current_streak")}</div>
    <div class="n">${icon("flame")} ${t("streak_days", st.streak || 0)}</div>
    <div class="s">${t("focused_today_footer", focH, focM)}</div>`;
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.fgState) return;
  const newState = changes.fgState.newValue;
  if (!newState) return;
  state = newState;
  refreshSidebarFoot();
  if (navId === "stats") renderMainPanel();
});

/* ── Init ───────────────────────────────────────────────────────────────── */
(async () => {
  await loadState();
  render();
})();
