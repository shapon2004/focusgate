// BlockNet popup — vanilla JS, no dependencies

/* ── Icons ─────────────────────────────────────────────────────────────── */
const ICONS = {
  shield:   ["M12 3l7 3v5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6l7-3z"],
  target:   ["M12 3a9 9 0 100 18 9 9 0 000-18z","M12 8a4 4 0 100 8 4 4 0 000-8z","M12 11.5a.5.5 0 100 1 .5.5 0 000-1z"],
  grid:     ["M4 5h7v6H4z","M13 5h7v4h-7z","M13 11h7v8h-7z","M4 13h7v6H4z"],
  chart:    ["M5 20V10","M12 20V4","M19 20v-7","M3 20h18"],
  play:     ["M7 5l11 7-11 7z"],
  pause:    ["M9 5v14","M15 5v14"],
  stop:     ["M7 7h10v10H7z"],
  plus:     ["M12 5v14","M5 12h14"],
  brain:    ["M9 4a3 3 0 00-3 3 3 3 0 00-1 5.5A3 3 0 007 17a3 3 0 003 3V4z","M15 4a3 3 0 013 3 3 3 0 011 5.5A3 3 0 0117 17a3 3 0 01-3 3V4z"],
  book:     ["M5 4h11a2 2 0 012 2v13a1 1 0 00-1-1H5z","M5 18a1 1 0 00-1 1V5a1 1 0 011-1"],
  moon:     ["M20 14a8 8 0 11-9.9-9.8A6.5 6.5 0 0020 14z"],
  chat:     ["M5 5h14a1 1 0 011 1v8a1 1 0 01-1 1H9l-4 3v-3a1 1 0 01-1-1V6a1 1 0 011-1z"],
  news:     ["M4 5h13v14H5a1 1 0 01-1-1z","M17 9h3v8a1 1 0 01-1 1","M7 8h7M7 11h7M7 14h4"],
  film:     ["M4 5h16v14H4z","M4 9h16M4 15h16M9 5v14M15 5v14"],
  cart:     ["M4 5h2l1.5 10h9L18 8H7","M9 19.5a.5.5 0 100 1 .5.5 0 000-1z","M16 19.5a.5.5 0 100 1 .5.5 0 000-1z"],
  game:     ["M7 9h10a4 4 0 014 4 3 3 0 01-5.2 2H8.2A3 3 0 013 13a4 4 0 014-4z","M8 12v2M7 13h2M15.5 12.5h.01M17 14h.01"],
  eyeoff:   ["M4 4l16 16","M9.9 5.2A9 9 0 0112 5c5 0 9 5 9 7a11 11 0 01-2 2.6","M6 7.5C3.8 9 3 11 3 12c0 1.4 4 6 9 6a8.6 8.6 0 003.3-.7","M9.9 14.1A3 3 0 0114 9.9"],
  power:    ["M12 4v8","M7.5 7a7 7 0 109 0"],
  flame:    ["M12 3c1 3-2 4-2 7a4 4 0 008 0c0-2-1-3-1-4 2 1 3 3 3 6a8 8 0 01-16 0c0-4 4-6 8-9z"],
  clock:    ["M12 7v5l3 2","M12 3a9 9 0 100 18 9 9 0 000-18z"],
  calendar: ["M5 6h14v13H5z","M5 10h14","M9 4v3M15 4v3"],
  settings: ["M12 9a3 3 0 100 6 3 3 0 000-6z","M12 3l1.3 2.2 2.5-.3.8 2.4 2.2 1.3-.9 2.4.9 2.4-2.2 1.3-.8 2.4-2.5-.3L12 21l-1.3-2.2-2.5.3-.8-2.4L5.2 15l.9-2.4-.9-2.4 2.2-1.3.8-2.4 2.5.3z"],
  bolt:     ["M13 3L5 13h6l-1 8 8-10h-6z"],
  arrow:    ["M5 12h14","M13 6l6 6-6 6"],
  unlock:   ["M6 11h12v9H6z","M9 11V8a3 3 0 015.8-1.2","M12 15v2"],
  // BlockNet brand mark: shield + ban circle (blocked-web symbol)
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

/* ── i18n helper ───────────────────────────────────────────────────────── */
const t = (k, ...subs) => chrome.i18n.getMessage(k, subs.length ? subs : undefined) || k;

/* ── Category meta ─────────────────────────────────────────────────────── */
const CAT_META = {
  social: { nameKey: "cat_social", icon: "chat",   count: 14   },
  news:   { nameKey: "cat_news",   icon: "news",   count: 9    },
  ent:    { nameKey: "cat_ent",    icon: "film",   count: 16   },
  shop:   { nameKey: "cat_shop",   icon: "cart",   count: 11   },
  game:   { nameKey: "cat_game",   icon: "game",   count: 7    },
  adult:  { nameKey: "cat_adult",  icon: "eyeoff", count: 1000 }
};

const DEFAULT_PRESETS = [
  { nameKey: "preset_deep_name",  metaKey: "preset_deep_meta",  msgKey: "preset_deep_msg",  icon: "brain", dur: 50, unit: "min", strict: "hard" },
  { nameKey: "preset_study_name", metaKey: "preset_study_meta", msgKey: "preset_study_msg", icon: "book",  dur: 25, unit: "min", strict: "hard" },
  { nameKey: "preset_sleep_name", metaKey: "preset_sleep_meta", msgKey: "preset_sleep_msg", icon: "moon",  dur: 0,  unit: "",    strict: "soft" }
];

// Convert storage-format preset → popup runtime format
function toRuntimePreset(p) {
  const mode = p.dur > 0 ? "timer" : "open";
  // Resolve translated name/meta/msg — fall back to stored string if no key
  const name = p.nameKey ? t(p.nameKey) : (p.name || "Preset");
  const msg  = p.msgKey  ? t(p.msgKey)  : (p.msg  || "");
  const meta = p.metaKey ? t(p.metaKey)
    : (mode === "timer"
        ? `${p.dur} min · ${p.strict === "hard" ? t("hard_block") : t("soft_block")}`
        : "Until morning · wind down");
  return { name, icon: p.icon || "brain", dur: p.dur, mode, meta, msg, until: mode === "open" ? "7:00 AM" : null };
}

function getPresets() {
  const src = (state && state.sessionPresets && state.sessionPresets.length)
    ? state.sessionPresets
    : DEFAULT_PRESETS;
  return src.map(toRuntimePreset);
}

const FAV_COLORS = ["#5b7cfa","#e0567f","#36b37e","#f5a623","#9b6dff","#1fb6c9","#ef5a5a"];
const favColor = u => FAV_COLORS[[...u].reduce((a,c) => a + c.charCodeAt(0), 0) % FAV_COLORS.length];

/* ── State ─────────────────────────────────────────────────────────────── */
let state = null;
let activeTab = "focus";
let timerInterval = null;
let draftUrl = "";

function getRemainingSeconds() {
  const s = state && state.currentSession;
  if (!s) return 0;
  let elapsed = s.pausedElapsed || 0;
  if (s.running) elapsed += (Date.now() - s.startedAt) / 1000;
  return Math.max(0, (s.totalSec || 0) - elapsed);
}

function getProgressPct() {
  const s = state && state.currentSession;
  if (!s || !s.totalSec) return 0;
  return Math.min(100, ((s.totalSec - getRemainingSeconds()) / s.totalSec) * 100);
}

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function blockedTotal() {
  if (!state) return 0;
  const cats = state.categories || [];
  const catTotal = cats
    .filter(c => c.on)
    .reduce((a, c) => a + (CAT_META[c.id] ? CAT_META[c.id].count : 0), 0);
  return catTotal + (state.customSites || []).length;
}

/* ── State helpers ─────────────────────────────────────────────────────── */
async function loadState() {
  state = await chrome.runtime.sendMessage({ type: "GET_STATE" });
}

async function patchState(patch) {
  state = { ...state, ...patch };
  await chrome.runtime.sendMessage({ type: "SET_STATE", patch });
}

/* ── Render ────────────────────────────────────────────────────────────── */
function render() {
  const live = !!(state.currentSession && (state.currentSession.running || state.currentSession.mode === "open"));

  document.getElementById("root").innerHTML = `
    <div class="fg">
      ${renderHeader(live)}
      ${renderTabs()}
      <div class="fg-body fg-fade">
        ${renderBody()}
      </div>
      ${renderFooter()}
    </div>`;

  attachEvents();

  if (activeTab === "focus" && state.currentSession && state.currentSession.mode === "timer") {
    startTimerUpdates();
  }
}

function renderHeader(live) {
  return `
    <header class="fg-header">
      <div class="fg-logo">${icon("blocknet", 'stroke="#fff"')}</div>
      <div class="fg-brand">
        <div class="fg-name">BlockNet</div>
        <div class="fg-tag">${t("sites_guarded", blockedTotal())}</div>
      </div>
      <div class="fg-status ${live ? "live" : ""}">
        <span class="fg-dot"></span>
        ${live ? (state.currentSession.mode === "open" ? t("status_sleep") : t("status_focusing")) : t("status_idle")}
      </div>
      <button class="fg-gear" id="btn-settings" title="Open settings">${icon("settings")}</button>
    </header>`;
}

function renderTabs() {
  const tabs = [["focus", t("tab_focus"), "target"], ["sites", t("tab_blocklist"), "grid"], ["stats", t("tab_stats"), "chart"]];
  const disabled = !state.master;
  return `
    <nav class="fg-tabs" style="${disabled ? "opacity:0.38;pointer-events:none" : ""}">
      ${tabs.map(([id,lbl,ic]) => `
        <button class="fg-tab ${activeTab===id?"active":""}" data-tab="${id}">
          ${icon(ic)} ${lbl}
        </button>`).join("")}
    </nav>`;
}

function renderBody() {
  if (!state.master) return renderPausedState();
  if (activeTab === "focus") return renderFocusTab();
  if (activeTab === "sites") return renderSitesTab();
  return renderStatsTab();
}

function renderPausedState() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                height:100%;gap:18px;padding:28px;text-align:center">
      <div style="width:68px;height:68px;border-radius:20px;background:var(--panel-2);
                  border:1px solid var(--border);display:grid;place-items:center;
                  color:var(--faint);box-shadow:var(--shadow)">
        ${icon("power","style='width:30px;height:30px'")}
      </div>
      <div>
        <div style="font-size:15px;font-weight:700;letter-spacing:-0.02em;color:var(--text)">
          ${t("protection_paused_title")}
        </div>
        <div style="font-size:12.5px;color:var(--muted);margin-top:5px;line-height:1.55;max-width:240px">
          ${t("protection_paused_desc")}
        </div>
      </div>
      <button class="fg-btn primary" data-action="enable-master"
              style="max-width:210px;margin-top:4px">
        ${icon("shield","stroke='#fff'")} ${t("btn_enable_protection")}
      </button>
    </div>`;
}

/* ── Focus tab ─────────────────────────────────────────────────────────── */
function renderFocusTab() {
  const s = state.currentSession;
  return `
    ${s ? renderSessionCard(s) : renderStartCard()}
    <div class="fg-sec-label">
      ${t("scheduled_blocks")}
      <span class="count">${icon("calendar","style='width:12px;height:12px;vertical-align:-1px'")}</span>
    </div>
    <div class="fg-card">
      <div class="fg-rows">
        ${(state.schedules || []).map(sc => `
          <div class="fg-row ${sc.on?"on":""}">
            <div class="fg-row-ic">${icon("clock")}</div>
            <div class="fg-row-main">
              <div class="fg-row-name">${sc.name}</div>
              <div class="fg-row-meta">${sc.start} – ${sc.end} · <b>${formatDays(sc.days)}</b></div>
            </div>
            <button class="fg-toggle ${sc.on?"on":""}" data-action="toggle-schedule" data-id="${sc.id}">
              <span class="fg-knob"></span>
            </button>
          </div>`).join("")}
      </div>
    </div>`;
}

function formatDays(days) {
  const active = days.map((d,i) => d ? t(`day_${i}`) : null).filter(Boolean);
  if (active.length === 7) return t("every_day");
  if (active.length === 5 && !days[5] && !days[6]) return t("weekdays_label");
  if (active.length === 2 && days[5] && days[6]) return t("weekends_label");
  return active.join(", ");
}

function renderSessionCard(s) {
  const pct = s.mode === "timer" ? getProgressPct() : 100;
  const rem = getRemainingSeconds();
  const paused = !s.running;
  return `
    <div class="fg-session live" style="${paused ? "border-color:var(--border);background:var(--panel)" : ""}">
      <div class="fg-ring" id="session-ring" style="--p:${pct}">
        <div class="fg-ring-inner">
          ${s.mode === "timer"
            ? `<div class="fg-time" id="session-time">${fmtTime(rem)}</div>
               <div class="fg-time-sub">${rem <= 0 ? t("session_complete") : paused ? t("session_paused") : t("session_remaining")}</div>`
            : `<div class="fg-time small">${s.until || "∞"}</div>
               <div class="fg-time-sub">${t("session_blocking_until")}</div>`}
        </div>
      </div>
      <div class="fg-session-name">${s.name}</div>
      ${paused ? `
        <div style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;
                    padding:5px 11px;border-radius:999px;font-size:11px;font-weight:660;
                    background:rgba(47,158,111,0.12);color:#2f9e6f;border:1px solid rgba(47,158,111,0.25)">
          ${icon("unlock","style='width:12px;height:12px;stroke:#2f9e6f'")} ${t("sites_unblocked_break")}
        </div>` : `<div class="fg-session-msg">"${s.msg}"</div>`}
      <div class="fg-session-actions">
        ${s.mode === "timer" ? `
          <button class="fg-btn ghost" data-action="toggle-session">
            ${icon(paused ? "play" : "pause")} ${paused ? t("btn_resume") : t("btn_pause")}
          </button>` : ""}
        <button class="fg-btn danger" data-action="end-session">
          ${icon("stop")} ${t("btn_end_session")}
        </button>
      </div>
    </div>`;
}

function renderStartCard() {
  const presets = getPresets();
  return `
    <div class="fg-card pad">
      <div class="fg-start-head">
        <div class="fg-start-title">${t("start_session_title")}</div>
        <div class="fg-start-sub">${t("start_session_sub")}</div>
      </div>
      <div class="fg-presets">
        ${presets.map((p, i) => `
          <button class="fg-preset" data-action="start-session" data-preset-index="${i}">
            <span class="fg-preset-ic">${icon(p.icon)}</span>
            <span class="fg-preset-txt">
              <span class="fg-preset-name">${p.name}</span>
              <span class="fg-preset-meta">${p.meta}</span>
            </span>
            <span class="fg-preset-dur">${p.mode === "timer" ? p.dur + "m" : "∞"}</span>
          </button>`).join("")}
      </div>
    </div>`;
}

/* ── Sites tab ─────────────────────────────────────────────────────────── */
function renderSitesTab() {
  const cats = state.categories || [];
  const activeCats = cats.filter(c => c.on).length;
  const custom = state.customSites || [];

  return `
    <div class="fg-add">
      <input class="fg-input" id="site-input" placeholder="${t("input_block_ph")}"
        value="${draftUrl}" />
      <button class="fg-add-btn" data-action="add-site">${icon("plus",'stroke="#fff"')}</button>
    </div>

    <div class="fg-sec-label">
      ${t("section_categories")}
      <span class="count">${t("categories_on", activeCats, cats.length)}</span>
    </div>
    <div class="fg-card">
      <div class="fg-rows">
        ${cats.map(c => {
          const m = CAT_META[c.id] || {};
          return `
            <div class="fg-row ${c.on?"on":""}">
              <div class="fg-row-ic">${icon(m.icon||"grid")}</div>
              <div class="fg-row-main">
                <div class="fg-row-name">${m.nameKey ? t(m.nameKey) : c.id}</div>
                <div class="fg-row-meta">${t("sites_count", m.count >= 1000 ? "1,000+" : m.count)}</div>
              </div>
              <button class="fg-toggle ${c.on?"on":""}" data-action="toggle-cat" data-id="${c.id}">
                <span class="fg-knob"></span>
              </button>
            </div>`;
        }).join("")}
      </div>
    </div>

    <div class="fg-sec-label">
      ${t("section_custom")}
      <span class="count">${custom.length}</span>
    </div>
    <div class="fg-card">
      ${custom.length === 0
        ? `<div class="fg-empty">${t("no_custom_sites").replace("\\n","<br>")}</div>`
        : custom.map(s => `
          <div class="fg-site">
            <div class="fg-fav" style="background:${favColor(s.url)}">${s.url[0].toUpperCase()}</div>
            <div class="fg-site-url">${s.url}</div>
            <button class="fg-unblock" data-action="remove-site" data-id="${s.id}">${t("btn_unblock")}</button>
          </div>`).join("")}
    </div>

    <a class="fg-preview" href="#" data-action="preview-block">
      ${icon("shield")} ${t("preview_block")} ${icon("arrow")}
    </a>`;
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

/* ── Stats tab ─────────────────────────────────────────────────────────── */
function renderStatsTab() {
  const st  = state.stats || {};

  // Focus chart: completed days [0..5] from weekData + live today from focusedTodayMin
  const focusChartData = [...(st.weekData || [0,0,0,0,0,0,0]).slice(0, 6), liveFocusedTodayMin() / 60];
  const focusMax       = Math.max(...focusChartData, 0.1);
  const days           = weekLabels(true);

  const focMin  = liveFocusedTodayMin();
  const focH    = Math.floor(focMin / 60);
  const focM    = Math.floor(focMin % 60);

  // "Blocked this week" = completed 6 days (weekBlockData[0..5]) + live today (blockedToday)
  const weekBlocks = (st.weekBlockData || [0,0,0,0,0,0,0]).slice(0, 6).reduce((a,v) => a+v, 0)
                   + (st.blockedToday || 0);

  // Config count — how many domains are currently in the blocklist
  const sitesGuarded = blockedTotal();

  const totalAllTimeH = Math.floor((st.totalFocusedMinAllTime || 0) / 60);
  const totalAllTimeM = Math.floor((st.totalFocusedMinAllTime || 0) % 60);

  return `
    <div class="fg-stat-grid">
      <div class="fg-stat">
        <div class="fg-stat-num accent">${icon("flame","style='width:22px;height:22px'")} ${st.streak || 0}</div>
        <div class="fg-stat-lbl">${t("stat_streak")}</div>
      </div>
      <div class="fg-stat">
        <div class="fg-stat-num">${focH}<small>h</small> ${focM}<small>m</small></div>
        <div class="fg-stat-lbl">${t("stat_focused_today")}</div>
      </div>
      <div class="fg-stat">
        <div class="fg-stat-num">${st.blockedToday || 0}</div>
        <div class="fg-stat-lbl">${t("stat_blocked_today")}</div>
      </div>
      <div class="fg-stat">
        <div class="fg-stat-num">${sitesGuarded}</div>
        <div class="fg-stat-lbl">${t("stat_sites_guarded")}</div>
      </div>
    </div>

    <div class="fg-sec-label">${t("focus_this_week")}</div>
    <div class="fg-card pad">
      <div class="fg-chart">
        ${focusChartData.map((h, i) => `
          <div class="fg-bar-wrap ${i===6?"today":""}">
            <div class="fg-bar ${i===6?"on":""}" style="height:${(h/focusMax)*100}%"></div>
            <div class="fg-bar-day">${days[i]}</div>
          </div>`).join("")}
      </div>
    </div>

    <div class="fg-card pad" style="display:flex;gap:11px;align-items:center">
      <span style="width:34px;height:34px;border-radius:9px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;flex:0 0 auto">
        ${icon("bolt","style='width:17px;height:17px'")}
      </span>
      <div style="display:flex;flex-direction:column;gap:2px">
        <div style="font-size:12.5px;font-weight:660">
          ${st.totalFocusedMinAllTime > 0
            ? t("focused_alltime_footer", totalAllTimeH, totalAllTimeM)
            : t("first_session_cta")}
        </div>
        <div style="font-size:11.5px;color:var(--muted)">
          ${weekBlocks > 0
            ? t("week_blocks_summary", weekBlocks, st.totalBlockedAllTime || 0)
            : t("sites_protected_now", sitesGuarded)}
        </div>
      </div>
    </div>`;
}

/* ── Footer ────────────────────────────────────────────────────────────── */
function renderFooter() {
  const on = state.master !== false;
  return `
    <footer class="fg-footer">
      <span class="fg-foot-ic">${icon(on ? "shield" : "power")}</span>
      <span>${on ? t("protection_active") : t("protection_paused_label")}</span>
      <label class="fg-master">
        <button class="fg-toggle ${on?"on":""}" data-action="toggle-master">
          <span class="fg-knob"></span>
        </button>
      </label>
    </footer>`;
}

/* ── Timer updates (partial DOM) ───────────────────────────────────────── */
function startTimerUpdates() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const s = state.currentSession;
    if (!s || !s.running || s.mode !== "timer") {
      clearInterval(timerInterval);
      return;
    }
    const rem = getRemainingSeconds();
    const pct = getProgressPct();
    const timeEl = document.getElementById("session-time");
    const ringEl = document.getElementById("session-ring");
    if (timeEl) timeEl.textContent = fmtTime(rem);
    if (ringEl) ringEl.style.setProperty("--p", pct);
    if (rem <= 0) {
      clearInterval(timerInterval);
      state.currentSession.running = false;
      render();
    }
  }, 1000);
}

/* ── Event handling ────────────────────────────────────────────────────── */
function attachEvents() {
  // Tab switching — reload state when navigating to stats for fresh numbers
  document.querySelectorAll(".fg-tab[data-tab]").forEach(btn => {
    btn.addEventListener("click", async () => {
      clearInterval(timerInterval);
      activeTab = btn.dataset.tab;
      if (activeTab === "stats") await loadState();
      render();
    });
  });

  // Settings gear
  const gearBtn = document.getElementById("btn-settings");
  if (gearBtn) gearBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());

  // Delegated clicks
  document.querySelector(".fg-body").addEventListener("click", handleBodyClick);
  document.querySelector(".fg-footer").addEventListener("click", handleFooterClick);

  // Input enter key
  const input = document.getElementById("site-input");
  if (input) {
    input.addEventListener("input", e => { draftUrl = e.target.value; });
    input.addEventListener("keydown", e => { if (e.key === "Enter") doAddSite(); });
  }
}

async function handleBodyClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === "enable-master") {
    state.master = true;
    await patchState({ master: state.master });
    render();
  }

  if (action === "start-session") {
    const idx = parseInt(btn.dataset.presetIndex, 10);
    const preset = getPresets()[idx];
    if (!preset) return;
    await chrome.runtime.sendMessage({
      type: "START_SESSION",
      session: { name: preset.name, mode: preset.mode, totalSec: preset.dur * 60, dur: preset.dur, msg: preset.msg, until: preset.until || null }
    });
    await loadState();
    render();
  }

  if (action === "toggle-session") {
    const s = state.currentSession;
    if (!s) return;
    if (s.running) {
      await chrome.runtime.sendMessage({ type: "PAUSE_SESSION" });
      state.currentSession.pausedElapsed += (Date.now() - state.currentSession.startedAt) / 1000;
      state.currentSession.running = false;
    } else {
      await chrome.runtime.sendMessage({ type: "RESUME_SESSION" });
      state.currentSession.startedAt = Date.now();
      state.currentSession.running = true;
    }
    render();
  }

  if (action === "end-session") {
    await chrome.runtime.sendMessage({ type: "END_SESSION" });
    await loadState();
    render();
  }

  if (action === "toggle-cat") {
    const id = btn.dataset.id;
    state.categories = state.categories.map(c => c.id === id ? { ...c, on: !c.on } : c);
    await patchState({ categories: state.categories });
    render();
  }

  if (action === "remove-site") {
    const id = parseInt(btn.dataset.id, 10);
    state.customSites = state.customSites.filter(s => s.id !== id);
    await patchState({ customSites: state.customSites });
    render();
  }

  if (action === "add-site") {
    await doAddSite();
  }

  if (action === "toggle-schedule") {
    const id = parseInt(btn.dataset.id, 10);
    state.schedules = state.schedules.map(s => s.id === id ? { ...s, on: !s.on } : s);
    await patchState({ schedules: state.schedules });
    render();
  }

  if (action === "remove-schedule") {
    const id = parseInt(btn.dataset.id, 10);
    state.schedules = state.schedules.filter(s => s.id !== id);
    await patchState({ schedules: state.schedules });
    render();
  }

  if (action === "preview-block") {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("blocked.html?site=youtube.com&cat=ent") });
  }
}

async function handleFooterClick(e) {
  const btn = e.target.closest("[data-action='toggle-master']");
  if (!btn) return;
  state.master = !state.master;
  await patchState({ master: state.master });
  render();
}

async function doAddSite() {
  const input = document.getElementById("site-input");
  const raw = (input ? input.value : draftUrl).trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
  if (!raw) return;
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  state.customSites = [{ id: Date.now(), url: raw, cat: "Custom", date: today }, ...(state.customSites || [])];
  draftUrl = "";
  await patchState({ customSites: state.customSites });
  render();
}

/* ── Init ───────────────────────────────────────────────────────────────── */
(async () => {
  await loadState();
  render();
})();
