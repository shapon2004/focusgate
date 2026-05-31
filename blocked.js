// BlockNet block screen

/* ── Icons ─────────────────────────────────────────────────────────────── */
const ICONS = {
  shield: ["M12 3l7 3v5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6l7-3z"],
  lock:   ["M6 11h12v9H6z","M9 11V8a3 3 0 016 0v3","M12 15v2"],
  unlock: ["M6 11h12v9H6z","M9 11V8a3 3 0 015.8-1.2","M12 15v2"],
  arrow:  ["M11 6l-6 6 6 6","M5 12h14"],
  flame:  ["M12 3c1 3-2 4-2 7a4 4 0 008 0c0-2-1-3-1-4 2 1 3 3 3 6a8 8 0 01-16 0c0-4 4-6 8-9z"],
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

/* ── Config ─────────────────────────────────────────────────────────────── */
const QUOTES = [
  "The work you avoid is usually the work that matters most.",
  "You don't need more time, you need fewer tabs.",
  "Focus is a muscle. You're training it right now.",
  "Future you is counting on this hour.",
  "Distraction is a choice. So is this.",
  "One hour of deep focus beats five of distracted effort.",
  "Close the tab. Open the potential."
];

const CAT_KEY_MAP = {
  social: "cat_social",
  news:   "cat_news",
  ent:    "cat_ent",
  shop:   "cat_shop",
  game:   "cat_game",
  adult:  "cat_adult"
};

const FAV_COLORS = ["#5b7cfa","#e0567f","#36b37e","#f5a623","#9b6dff","#1fb6c9","#ef5a5a"];
const favColor = u => FAV_COLORS[[...u].reduce((a,c) => a + c.charCodeAt(0), 0) % FAV_COLORS.length];
const fmtTime = s => { const v = Math.max(0,Math.floor(s)); return `${Math.floor(v/60)}:${String(v%60).padStart(2,"0")}`; };

/* ── URL params ─────────────────────────────────────────────────────────── */
const params  = new URLSearchParams(location.search);
const site    = params.get("site") || "example.com";
const catId   = params.get("cat")  || "custom";
const catName = CAT_KEY_MAP[catId] ? t(CAT_KEY_MAP[catId]) : catId;

/* ── State ─────────────────────────────────────────────────────────────── */
let appState       = null;
let mode           = "blocked"; // "blocked" | "unblocked"
let graceRemaining = 0;
let quoteIndex     = 0;
let graceInterval  = null;
let quoteInterval  = null;
let sessionInterval = null;

/* ── Render ─────────────────────────────────────────────────────────────── */
function render() {
  const s = appState && appState.currentSession;
  const TOTAL = s ? (s.totalSec || 3000) : 3000;
  const remaining = s ? getRemaining(s) : 0;
  const pct = s ? Math.min(100, ((TOTAL - remaining) / TOTAL) * 100) : 0;
  const sessionName = s ? s.name : "";
  const streak = (appState && appState.stats && appState.stats.streak) || 7;
  const motivMsg = appState && appState.preferences && appState.preferences.motivationalMsg
    ? appState.preferences.motivationalMsg
    : t("blocked_default_msg");
  const tempMin = appState && appState.preferences ? (appState.preferences.tempAccessMin || 5) : 5;

  document.getElementById("root").innerHTML = `
    <div class="bs">
      <div class="bs-brand">
        <div class="bs-logo">${icon("blocknet",'stroke="#fff"')}</div>
        <div class="bs-brand-name">BlockNet</div>
      </div>

      <div class="bs-stage">
        <div class="bs-emblem">${icon("lock")}</div>
        <div class="bs-kicker">${t("blocked_kicker")}</div>
        <h1 class="bs-title">${motivMsg}</h1>

        <div class="bs-domain">
          <span class="bs-fav" style="background:${favColor(site)}">${site[0].toUpperCase()}</span>
          ${site}
        </div>

        <p class="bs-reason">
          ${s ? t("blocked_reason", catName, sessionName) : t("blocked_reason_no_session", catName)}
        </p>

        ${mode === "blocked" ? `
          ${s ? `
          <div class="bs-session">
            <div class="bs-ring" id="bs-ring" style="--p:${pct.toFixed(1)}">
              <span id="bs-pct">${Math.round(pct)}%</span>
            </div>
            <div class="bs-session-txt">
              <div class="bs-session-time" id="bs-time">${t("time_left", fmtTime(remaining))}</div>
              <div class="bs-session-lbl">${t("in_session_label", sessionName)}</div>
            </div>
          </div>` : ""}

          <p class="bs-quote" id="bs-quote">${QUOTES[quoteIndex]}</p>

          <div class="bs-actions">
            <button class="bs-btn primary" id="btn-back">
              ${icon("arrow")} ${t("btn_back_to_work")}
            </button>
            <button class="bs-btn ghost" id="btn-unblock">
              ${icon("unlock")} ${t("btn_unblock_minutes", tempMin)}
            </button>
          </div>
        ` : `
          <div class="bs-unblocked">
            <div class="bs-unblocked-pill">
              ${icon("unlock","style='width:20px;height:20px;color:var(--accent)'")}
              <div style="text-align:left">
                <div class="t" id="grace-time">${fmtTime(graceRemaining)}</div>
                <div class="l">${t("temporary_access", site)}</div>
              </div>
            </div>
            <button class="bs-relink" id="btn-reblock">
              ${t("reblock_now")}
            </button>
          </div>
        `}
      </div>

      <div class="bs-foot">
        <span class="flame">${icon("flame")}</span>
        <span>${t("streak_footer", streak)}</span>
        <span class="bs-foot-sep"></span>
        <a class="bs-foot-link" href="#" id="manage-link">${t("manage_blocklist")}</a>
      </div>
    </div>`;

  attachEvents(tempMin);
  if (mode === "blocked" && s) startSessionTick();
}

function getRemaining(s) {
  let elapsed = s.pausedElapsed || 0;
  if (s.running) elapsed += (Date.now() - s.startedAt) / 1000;
  return Math.max(0, (s.totalSec || 0) - elapsed);
}

/* ── Timer ticks ────────────────────────────────────────────────────────── */
function startSessionTick() {
  clearInterval(sessionInterval);
  sessionInterval = setInterval(() => {
    const s = appState && appState.currentSession;
    if (!s || !s.running) { clearInterval(sessionInterval); return; }
    const rem = getRemaining(s);
    const TOTAL = s.totalSec || 3000;
    const pct = Math.min(100, ((TOTAL - rem) / TOTAL) * 100);
    const timeEl = document.getElementById("bs-time");
    const pctEl  = document.getElementById("bs-pct");
    const ringEl = document.getElementById("bs-ring");
    if (timeEl) timeEl.textContent = t("time_left", fmtTime(rem));
    if (pctEl)  pctEl.textContent  = Math.round(pct) + "%";
    if (ringEl) ringEl.style.setProperty("--p", pct.toFixed(1));
  }, 1000);
}

function startGraceTick() {
  clearInterval(graceInterval);
  graceInterval = setInterval(() => {
    graceRemaining = Math.max(0, graceRemaining - 1);
    const el = document.getElementById("grace-time");
    if (el) el.textContent = fmtTime(graceRemaining);
    if (graceRemaining <= 0) {
      clearInterval(graceInterval);
      reblock();
    }
  }, 1000);
}

function startQuoteRotation() {
  clearInterval(quoteInterval);
  quoteInterval = setInterval(() => {
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    const el = document.getElementById("bs-quote");
    if (el) {
      el.style.opacity = "0";
      setTimeout(() => {
        el.textContent = QUOTES[quoteIndex];
        el.style.opacity = "1";
      }, 300);
    }
  }, 7000);
}

/* ── Events ─────────────────────────────────────────────────────────────── */
function attachEvents(tempMin) {
  document.getElementById("btn-back")?.addEventListener("click", () => {
    try { history.length > 1 ? history.back() : location.replace("about:blank"); } catch(e) {}
  });

  document.getElementById("btn-unblock")?.addEventListener("click", async () => {
    graceRemaining = tempMin * 60;
    mode = "unblocked";
    await chrome.runtime.sendMessage({ type: "TEMP_ALLOW", domain: site, minutes: tempMin });
    await chrome.runtime.sendMessage({ type: "LOG_BLOCK", domain: site });
    render();
    startGraceTick();
  });

  document.getElementById("btn-reblock")?.addEventListener("click", reblock);

  document.getElementById("manage-link")?.addEventListener("click", e => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

async function reblock() {
  clearInterval(graceInterval);
  mode = "blocked";
  graceRemaining = 0;
  render();
  startQuoteRotation();
  if (appState && appState.currentSession) startSessionTick();
}

/* ── Init ───────────────────────────────────────────────────────────────── */
(async () => {
  chrome.runtime.sendMessage({ type: "LOG_BLOCK", domain: site }).catch(() => {});
  try {
    appState = await chrome.runtime.sendMessage({ type: "GET_STATE" });
  } catch(_) {
    appState = { stats: { streak: 7 }, preferences: { tempAccessMin: 5 } };
  }
  render();
  startQuoteRotation();
})();
