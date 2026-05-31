// BlockNet — background service worker
// Manages declarativeNetRequest blocking rules, schedules, sessions, and stats.

const CATEGORY_SITES = {
  social: [
    "facebook.com", "twitter.com", "x.com", "instagram.com", "tiktok.com",
    "snapchat.com", "reddit.com", "linkedin.com", "pinterest.com", "tumblr.com",
    "discord.com", "whatsapp.com", "telegram.org", "mastodon.social",
    "threads.net", "bsky.app", "vk.com", "weibo.com", "quora.com"
  ],
  news: [
    "cnn.com", "foxnews.com", "bbc.com", "bbc.co.uk", "nytimes.com",
    "washingtonpost.com", "theguardian.com", "huffpost.com", "buzzfeed.com",
    "news.ycombinator.com", "techcrunch.com", "theverge.com", "wired.com",
    "arstechnica.com", "vice.com", "dailymail.co.uk", "breitbart.com",
    "bloomberg.com", "reuters.com", "apnews.com"
  ],
  ent: [
    "youtube.com", "netflix.com", "twitch.tv", "hulu.com", "disneyplus.com",
    "primevideo.com", "spotify.com", "soundcloud.com", "vimeo.com",
    "dailymotion.com", "imgur.com", "9gag.com", "buzzfeed.com",
    "crunchyroll.com", "funimation.com", "peacocktv.com", "paramountplus.com",
    "tubi.tv", "pluto.tv", "rumble.com"
  ],
  shop: [
    "amazon.com", "ebay.com", "etsy.com", "alibaba.com", "aliexpress.com",
    "wish.com", "target.com", "walmart.com", "bestbuy.com", "newegg.com",
    "wayfair.com", "overstock.com", "zappos.com", "chewy.com", "shopify.com"
  ],
  game: [
    "store.steampowered.com", "epicgames.com", "ign.com", "gamespot.com",
    "kotaku.com", "miniclip.com", "poki.com", "kongregate.com",
    "gog.com", "humblebundle.com", "polygon.com", "pcgamer.com",
    "rockstargames.com", "ubisoft.com", "ea.com", "battlenet.com"
  ],
  adult: [
    "pornhub.com", "xvideos.com", "xhamster.com", "redtube.com",
    "youporn.com", "tube8.com", "spankbang.com", "xnxx.com"
  ]
};

const CATEGORY_META = {
  social: { name: "Social media", count: 14 },
  news:   { name: "News", count: 9 },
  ent:    { name: "Entertainment & video", count: 16 },
  shop:   { name: "Shopping", count: 11 },
  game:   { name: "Gaming", count: 7 },
  adult:  { name: "Adult content", count: 1000 }
};

const DEFAULT_STATE = {
  master: true,
  categories: [
    { id: "social", on: true },
    { id: "news",   on: false },
    { id: "ent",    on: true },
    { id: "shop",   on: false },
    { id: "game",   on: false },
    { id: "adult",  on: true }
  ],
  customSites: [],
  schedules: [
    { id: 1, name: "Work Hours",           start: "09:00", end: "12:00", days: [1,1,1,1,1,0,0], on: true },
    { id: 2, name: "Afternoon Deep Work",  start: "14:00", end: "17:00", days: [1,1,1,1,1,0,0], on: true },
    { id: 3, name: "Wind Down",            start: "22:00", end: "07:00", days: [1,1,1,1,1,1,1], on: false }
  ],
  currentSession: null,
  tempAllowed: {},
  stats: {
    streak: 0,
    blockedToday: 0,
    focusedTodayMin: 0,
    weekData:      [0, 0, 0, 0, 0, 0, 0], // completed hours per day, last 7 days (index 6 = yesterday)
    weekBlockData: [0, 0, 0, 0, 0, 0, 0], // completed blocks per day, last 7 days
    topBlocked: {},
    lastFocusDate: null,
    totalFocusedMinAllTime: 0,
    totalBlockedAllTime:    0
  },
  preferences: {
    unblockDifficulty: "easy",
    tempAccessMin: 5,
    motivationalMsg: "Not right now. You’re in a focus session.",
    notif: true,
    streak: true,
    count: true
  }
};

// ─── Storage helpers ───────────────────────────────────────────────────────────

function getState() {
  return new Promise(resolve => {
    chrome.storage.local.get("fgState", d => {
      resolve(d.fgState ? { ...DEFAULT_STATE, ...d.fgState } : DEFAULT_STATE);
    });
  });
}

function saveState(state) {
  return new Promise(resolve => {
    chrome.storage.local.set({ fgState: state }, resolve);
  });
}

// ─── Rule management ───────────────────────────────────────────────────────────

function escDomain(d) {
  return d.replace(/\./g, "\\.");
}

async function updateRules() {
  const state = await getState();
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map(r => r.id);

  // When protection is off OR session is paused (break time) → remove all rules
  const sessionPaused = state.currentSession && state.currentSession.running === false;
  if (!state.master || sessionPaused) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds, addRules: [] });
    return;
  }

  const blocked = new Set();

  if (state.master) {
    const now = Date.now();
    const tempAllowed = state.tempAllowed || {};

    for (const cat of state.categories) {
      if (!cat.on) continue;
      for (const domain of (CATEGORY_SITES[cat.id] || [])) {
        // skip temporarily allowed
        if (tempAllowed[domain] && tempAllowed[domain] > now) continue;
        blocked.add({ domain, catId: cat.id });
      }
    }

    for (const site of (state.customSites || [])) {
      const domain = site.url.replace(/^www\./, "");
      if (tempAllowed[domain] && tempAllowed[domain] > now) continue;
      blocked.add({ domain, catId: "custom" });
    }
  }

  const base = chrome.runtime.getURL("blocked.html");
  const addRules = [];
  let id = 1;

  for (const { domain, catId } of blocked) {
    if (id > 4990) break;
    const url = `${base}?site=${encodeURIComponent(domain)}&cat=${encodeURIComponent(catId)}`;
    addRules.push({
      id: id++,
      priority: 1,
      action: { type: "redirect", redirect: { url } },
      condition: {
        regexFilter: `^https?://(www\\.)?${escDomain(domain)}(/|$|\\?)`,
        resourceTypes: ["main_frame"]
      }
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules
  });
}

// ─── Schedule check ────────────────────────────────────────────────────────────

async function checkSchedules() {
  const state = await getState();
  if (!state.schedules) return;

  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun
  const ourDay = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon … 6=Sun
  const curMin = now.getHours() * 60 + now.getMinutes();

  let shouldBlock = false;

  for (const s of state.schedules) {
    if (!s.on || !s.days[ourDay]) continue;
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin   = eh * 60 + em;

    const inWindow = startMin < endMin
      ? curMin >= startMin && curMin < endMin
      : curMin >= startMin || curMin < endMin; // overnight

    if (inWindow) { shouldBlock = true; break; }
  }

  if (shouldBlock && !state.master) {
    state.master = true;
    await saveState(state);
    await updateRules();
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  // Read raw storage — don't use getState() here as it falls back to DEFAULT_STATE
  const raw = await new Promise(r => chrome.storage.local.get("fgState", d => r(d.fgState)));

  if (!raw) {
    // Fresh install — start with clean zero stats, no fake data
    await saveState(DEFAULT_STATE);
  } else {
    // Extension update — deep-merge so new preference keys are added without losing user data
    const merged = {
      ...DEFAULT_STATE,
      ...raw,
      stats:       { ...DEFAULT_STATE.stats,       ...raw.stats },
      preferences: { ...DEFAULT_STATE.preferences, ...raw.preferences }
    };
    await saveState(merged);
  }

  await updateRules();
  chrome.alarms.create("scheduleCheck", { periodInMinutes: 1 });
  chrome.alarms.create("dailyReset",    { when: nextMidnight(), periodInMinutes: 1440 });
  const saved = await getState();
  setIcon(saved.master);
});

self.addEventListener("activate", async () => {
  await updateRules();
});

// ─── Alarm handler ─────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === "scheduleCheck") {
    await checkSchedules();
  } else if (alarm.name === "sessionEnd") {
    const state = await getState();
    state.currentSession = null;
    await saveState(state);
    await updateRules();
  } else if (alarm.name === "dailyReset") {
    const state = await getState();
    const todayH      = (state.stats.focusedTodayMin || 0) / 60;
    const todayBlocks = (state.stats.blockedToday     || 0);

    // Rotate week windows: drop index 0 (oldest day), store completed day at index 6.
    // After rotation weekData[6]/weekBlockData[6] = the day that just ended (yesterday).
    // Live "today" is always read from focusedTodayMin / blockedToday which reset next.
    state.stats.weekData = [
      ...(state.stats.weekData      || [0,0,0,0,0,0,0]).slice(1),
      Math.round(todayH * 100) / 100
    ];
    state.stats.weekBlockData = [
      ...(state.stats.weekBlockData || [0,0,0,0,0,0,0]).slice(1),
      todayBlocks  // freeze today's block count as the completed-day snapshot
    ];

    // Break streak if no session was completed the day that just ended
    const yest = yesterdayStr();
    if (state.stats.lastFocusDate !== yest) {
      state.stats.streak = 0;
    }

    state.stats.blockedToday    = 0;
    state.stats.focusedTodayMin = 0;
    await saveState(state);
  } else if (alarm.name.startsWith("reblock_")) {
    const domain = alarm.name.slice(8);
    const state = await getState();
    if (state.tempAllowed) delete state.tempAllowed[domain];
    await saveState(state);
    await updateRules();
  }
});

// ─── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handle(msg).then(sendResponse).catch(e => sendResponse({ error: e.message }));
  return true;
});

async function handle(msg) {
  const state = await getState();

  switch (msg.type) {
    case "GET_STATE":
      return state;

    case "SET_STATE": {
      const next = { ...state, ...msg.patch };
      await saveState(next);
      await updateRules();
      setIcon(next.master);
      return { ok: true };
    }

    case "START_SESSION": {
      state.currentSession = {
        ...msg.session,
        startedAt:     Date.now(),
        pausedElapsed: 0,
        running:       true
      };
      await saveState(state);
      await updateRules();
      if (msg.session.mode === "timer" && msg.session.dur > 0) {
        chrome.alarms.create("sessionEnd", { delayInMinutes: msg.session.dur });
      }
      return { ok: true };
    }

    case "PAUSE_SESSION": {
      if (!state.currentSession) return { ok: false };
      const elapsed = (Date.now() - state.currentSession.startedAt) / 1000;
      state.currentSession.pausedElapsed += elapsed;
      state.currentSession.running = false;
      chrome.alarms.clear("sessionEnd");
      await saveState(state);
      await updateRules(); // paused → remove all blocking rules
      return { ok: true };
    }

    case "RESUME_SESSION": {
      if (!state.currentSession) return { ok: false };
      const rem = state.currentSession.totalSec - state.currentSession.pausedElapsed;
      state.currentSession.startedAt = Date.now();
      state.currentSession.running = true;
      if (state.currentSession.mode === "timer") {
        chrome.alarms.create("sessionEnd", { delayInMinutes: rem / 60 });
      }
      await saveState(state);
      await updateRules(); // resumed → restore blocking rules
      return { ok: true };
    }

    case "END_SESSION": {
      if (state.currentSession) {
        let elapsed = state.currentSession.pausedElapsed || 0;
        if (state.currentSession.running) {
          elapsed += (Date.now() - state.currentSession.startedAt) / 1000;
        }
        const elapsedMin = elapsed / 60;
        state.stats.focusedTodayMin        = (state.stats.focusedTodayMin        || 0) + elapsedMin;
        state.stats.totalFocusedMinAllTime = (state.stats.totalFocusedMinAllTime || 0) + elapsedMin;

        // Update streak — only count the first session per day
        const today = todayStr();
        if (state.stats.lastFocusDate !== today) {
          const yest = yesterdayStr();
          if (!state.stats.lastFocusDate || state.stats.lastFocusDate < yest) {
            // Missed one or more days → restart streak at 1
            state.stats.streak = 1;
          } else if (state.stats.lastFocusDate === yest) {
            // Consecutive day
            state.stats.streak = (state.stats.streak || 0) + 1;
          }
          state.stats.lastFocusDate = today;
        }
      }
      state.currentSession = null;
      await saveState(state);
      await updateRules();
      chrome.alarms.clear("sessionEnd");
      return { ok: true };
    }

    case "TEMP_ALLOW": {
      const { domain, minutes } = msg;
      state.tempAllowed = state.tempAllowed || {};
      state.tempAllowed[domain] = Date.now() + minutes * 60000;
      await saveState(state);
      await updateRules();
      chrome.alarms.create(`reblock_${domain}`, { delayInMinutes: minutes });
      return { ok: true };
    }

    case "LOG_BLOCK": {
      // blockedToday  = today's live redirect count (display + rotate at midnight)
      // totalBlockedAllTime = cumulative all-time redirect count (never resets)
      // topBlocked[domain]  = per-domain cumulative count (for "most blocked" list)
      // weekBlockData[6] is NOT touched here — it's kept as the last completed day's
      // snapshot after rotation; today's live count is always read from blockedToday.
      state.stats.blockedToday           = (state.stats.blockedToday           || 0) + 1;
      state.stats.totalBlockedAllTime    = (state.stats.totalBlockedAllTime    || 0) + 1;
      state.stats.topBlocked             = state.stats.topBlocked || {};
      state.stats.topBlocked[msg.domain] = (state.stats.topBlocked[msg.domain] || 0) + 1;
      await saveState(state);
      return { ok: true };
    }

    default:
      return { error: "unknown" };
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function nextMidnight() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function setIcon(active) {
  for (const size of [16, 32, 48, 128]) {
    try {
      const canvas = new OffscreenCanvas(size, size);
      const ctx    = canvas.getContext("2d");
      ctx.clearRect(0, 0, size, size);

      // Rounded-square background (app-icon style)
      const radius = size * 0.22;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, radius);
      ctx.fillStyle = active ? "#3a5bd9" : "#9aa3ba";
      ctx.fill();

      // Scale all coordinates from the 24-unit SVG viewBox
      const sc = size / 24;
      ctx.strokeStyle   = "#ffffff";
      ctx.lineCap       = "round";
      ctx.lineJoin      = "round";
      ctx.lineWidth     = Math.max(1.1, sc * 1.75);

      // ── Shield outline ───────────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(12*sc, 3*sc);
      ctx.lineTo(19*sc, 6*sc);
      ctx.lineTo(19*sc, 11*sc);
      ctx.bezierCurveTo(19*sc, 15.4*sc, 16.1*sc, 18.6*sc, 12*sc, 20*sc);
      ctx.bezierCurveTo( 7.9*sc, 18.6*sc,  5*sc, 15.4*sc,  5*sc, 11*sc);
      ctx.lineTo(5*sc, 6*sc);
      ctx.closePath();
      ctx.stroke();

      // ── Ban circle ───────────────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(12*sc, 10.5*sc, 3.5*sc, 0, Math.PI * 2);
      ctx.stroke();

      // ── Diagonal slash ───────────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo( 9*sc, 7.5*sc);
      ctx.lineTo(15*sc, 13.5*sc);
      ctx.stroke();

      chrome.action.setIcon({ imageData: { [size]: ctx.getImageData(0, 0, size, size) } });
    } catch (_) {}
  }
}
