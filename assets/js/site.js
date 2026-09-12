const STEP = 360 / 7;
const SOL_RPC = "https://solana-rpc.publicnode.com";

const FALLBACK = {
  essentials: {
    ticker: "ESSENTIALS",
    cadence: "Always on the book",
    status: "awaiting-mint",
    blurb: "The perpetual name. All seven sessions live inside this coin.",
    art: "assets/img/coins/essentials.jpg",
    accent: "#e8c15a"
  },
  days: []
};

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $$(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function statusLabel(status) {
  if (status === "live") return "Live on pump.fun";
  return "Awaiting mint";
}

function escapeAttr(value) {
  return String(value || "").replace(/"/g, "&quot;");
}

function coinImg(item, className, extras = "") {
  return `<img class="${className}" src="${escapeAttr(item.art)}" alt="${escapeAttr(item.ticker)}" width="1024" height="1024" decoding="async" ${extras}>`;
}

function shortWallet(value) {
  const text = String(value || "");
  if (text.length <= 10) return text || "—";
  return `${text.slice(0, 4)}…${text.slice(-4)}`;
}

function dexUrl(item) {
  if (item.dexscreener) return item.dexscreener;
  if (item.mint) return `https://dexscreener.com/solana/${item.mint}`;
  return "";
}

function pumpUrl(item) {
  if (item.pumpUrl) return item.pumpUrl;
  if (item.mint) return `https://pump.fun/coin/${item.mint}`;
  return "";
}

function phantomUrl(item) {
  const target = pumpUrl(item) || dexUrl(item);
  if (!target) return "";
  return `https://phantom.app/ul/browse/${encodeURIComponent(target)}`;
}

function brandBtn(href, label, icon, extraClass = "") {
  const img = `<img src="${escapeAttr(icon)}" alt="" width="18" height="18">`;
  const cls = `btn btn-brand ${extraClass}`.trim();
  if (!href) {
    return `<span class="${cls} is-off">${img}<span>${label}</span></span>`;
  }
  return `<a class="${cls}" href="${escapeAttr(href)}" target="_blank" rel="noopener">${img}<span>${label}</span></a>`;
}

const ICON_COPY = `<svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 8V6.2A2.2 2.2 0 0 0 13.8 4H6.2A2.2 2.2 0 0 0 4 6.2v7.6A2.2 2.2 0 0 0 6.2 16H8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
const ICON_SHARE = `<svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="19" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.2 10.8 15.7 6.7M8.2 13.2l7.5 4.1" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

function actionBtn(label, attrs, extraClass = "btn-ghost") {
  return `<button class="btn btn-brand ${extraClass}" type="button" ${attrs}>${label}</button>`;
}

function deskLinks(item) {
  const mint = item.mint || "";
  const ready = mint ? "" : "disabled";
  const share = pumpUrl(item) || dexUrl(item) || "";
  return `
    <div class="live-stats" data-mint="${escapeAttr(mint)}">
      <p><strong data-field="trades">—</strong> trades · 24h</p>
      <p>Top trader · <strong data-field="trader">—</strong></p>
    </div>
    <div class="card-actions">
      ${brandBtn(pumpUrl(item), "Open on pump.fun", "assets/img/brands/pumpfun.png", "btn-gold")}
      ${brandBtn(dexUrl(item), "Open on DexScreener", "assets/img/brands/dexscreener.png", "btn-ghost")}
      ${brandBtn(phantomUrl(item), "Open in Phantom", "assets/img/brands/phantom.svg", "btn-ghost")}
      ${actionBtn(`${ICON_COPY}<span>Copy contract</span>`, `data-copy-mint="${escapeAttr(mint)}" ${ready}`)}
      ${actionBtn(`${ICON_SHARE}<span>Share</span>`, `data-share-name="${escapeAttr(item.ticker)}" data-share-url="${escapeAttr(share)}" ${ready}`)}
    </div>
  `;
}

function berlinNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
}

function sessionRemain() {
  const now = berlinNow();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const ms = Math.max(0, end - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

function renderConstellation(essentials, days, today) {
  const root = $("#constellation");
  if (!root) return;
  const sats = days.map((day, i) => `
    <div class="sat-slot" style="--a:${i * STEP}deg">
      <a class="sat${day.dow === today ? " is-today" : ""}" href="#${day.id}" style="--accent:${day.accent}">
        ${coinImg(day, "")}
      </a>
    </div>
  `).join("");
  root.innerHTML = `
    <a class="sun" href="#essentials">
      ${coinImg(essentials, "")}
    </a>
    <div class="orbit">${sats}</div>
  `;
}

function renderFeature(item) {
  const root = $("#essentials-card");
  if (!root) return;
  root.innerHTML = `
    ${coinImg(item, "medal", `data-zoom="${escapeAttr(item.art)}" data-zoom-alt="${escapeAttr(item.ticker)}"`)}
    <div class="feature-copy">
      <p class="status">${statusLabel(item.status)}</p>
      <h3>${item.ticker}</h3>
      <p class="cadence">${item.cadence}</p>
      <p class="blurb">${item.blurb}</p>
      <p class="mint">${item.mint || "Contract lands here once the mint is confirmed."}</p>
      ${deskLinks(item)}
    </div>
  `;
}

function renderSession(days, today) {
  const root = $("#session-hud");
  if (!root) return;
  const live = days.find((day) => day.dow === today);
  const next = days.find((day) => day.dow === (today + 1) % 7);
  if (!live) return;
  root.innerHTML = `
    <span class="session-hud-live"><i></i> ${live.ticker} session</span>
    <span>${sessionRemain()} left today</span>
    <span>Next · ${next ? next.ticker : "—"}</span>
  `;
}

function renderWeek(days, today) {
  const board = $("#week-board");
  if (!board) return;
  board.innerHTML = days.map((day) => {
    const live = day.dow === today;
    return `
    <article class="coin-card${live ? " is-today" : ""}" id="${day.id}" style="--accent:${day.accent}">
      <span class="now-tag">${live ? `<i class="now-dot"></i> Live session` : ""}</span>
      <div class="medal-wrap">
        <span class="medal-ring" aria-hidden="true"></span>
        ${coinImg(day, "medal", `data-zoom="${escapeAttr(day.art)}" data-zoom-alt="${escapeAttr(day.ticker)}"`)}
      </div>
      <p class="status">${statusLabel(day.status)}</p>
      <h3>${day.ticker}</h3>
      <p class="cadence">${day.cadence}</p>
      <p class="blurb">${day.blurb}</p>
      <p class="trade-note${live ? "" : " trade-note-spacer"}">${live ? "Today’s recommended session. This is the name on the book." : ""}</p>
      ${deskLinks(day)}
    </article>
  `;
  }).join("");
}

function renderTicker(days) {
  const track = $("#ticker-track");
  if (!track) return;
  const labels = ["ESSENTIALS continuous", ...days.map((d) => `${d.ticker} desk`)];
  track.innerHTML = `${labels.concat(labels).map((label) => `<span>${label}</span>`).join("")}`;
}

function tickClock() {
  const node = $("#clock");
  if (!node) return;
  const now = new Date();
  node.dateTime = now.toISOString();
  node.textContent = `${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit"
  }).format(now)} CET`;
}

async function copyText(value) {
  const text = String(value || "");
  if (!text) throw new Error("empty");
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    /* fall through to the textarea path */
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  if (!ok) throw new Error("copy");
}

function flashBtn(btn, label) {
  const tag = btn.querySelector("span");
  if (!tag) return;
  const prev = tag.textContent;
  tag.textContent = label;
  window.setTimeout(() => {
    tag.textContent = prev;
  }, 1600);
}

function bindDeskActions() {
  document.addEventListener("click", async (event) => {
    const copyBtn = event.target.closest("[data-copy-mint]");
    if (copyBtn && !copyBtn.disabled) {
      try {
        await copyText(copyBtn.getAttribute("data-copy-mint"));
        flashBtn(copyBtn, "Copied");
      } catch {
        flashBtn(copyBtn, "Copy failed");
      }
      return;
    }

    const shareBtn = event.target.closest("[data-share-name]");
    if (!shareBtn || shareBtn.disabled) return;
    const name = shareBtn.getAttribute("data-share-name") || "MEMECOINS";
    const url = shareBtn.getAttribute("data-share-url") || location.href;
    const payload = {
      title: `${name} · MEMECOINS`,
      text: `${name} on the MEMECOINS desk.`,
      url
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        flashBtn(shareBtn, "Shared");
        return;
      }
      await copyText(`${payload.text} ${url}`);
      flashBtn(shareBtn, "Link copied");
    } catch (error) {
      if (error && error.name === "AbortError") return;
      flashBtn(shareBtn, "Share failed");
    }
  });
}

function bindZoom() {
  const overlay = $("#zoom");
  const img = $("#zoom-img");
  if (!overlay || !img) return;

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-zoom]");
    if (!trigger) return;
    event.preventDefault();
    img.src = trigger.getAttribute("data-zoom");
    img.alt = trigger.getAttribute("data-zoom-alt") || "";
    overlay.hidden = false;
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest("[data-zoom-close]")) {
      overlay.hidden = true;
      img.src = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      overlay.hidden = true;
      img.src = "";
    }
  });
}

async function rpc(method, params) {
  const res = await fetch(SOL_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  if (!res.ok) throw new Error("rpc");
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "rpc");
  return json.result;
}

async function loadDexTrades(mint) {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, { cache: "no-store" });
  if (!res.ok) throw new Error("dex");
  const data = await res.json();
  const pair = Array.isArray(data.pairs) ? data.pairs[0] : null;
  const tx = pair?.txns?.h24;
  return {
    trades: tx ? Number(tx.buys || 0) + Number(tx.sells || 0) : null,
    pairAddress: pair?.pairAddress || ""
  };
}

async function loadTopTrader(mint, pairAddress) {
  const largest = await rpc("getTokenLargestAccounts", [mint]);
  const accounts = Array.isArray(largest?.value) ? largest.value : [];
  for (const row of accounts.slice(0, 6)) {
    const info = await rpc("getAccountInfo", [row.address, { encoding: "jsonParsed" }]);
    const owner = info?.value?.data?.parsed?.info?.owner;
    if (owner && owner !== pairAddress) return owner;
  }
  return "";
}

function paintStats(root, stats) {
  const trades = root.querySelector('[data-field="trades"]');
  const trader = root.querySelector('[data-field="trader"]');
  if (trades) {
    trades.textContent = stats.trades == null ? "—" : stats.trades.toLocaleString("en-GB");
  }
  if (trader) {
    trader.textContent = stats.trader ? shortWallet(stats.trader) : "—";
    if (stats.trader) trader.title = stats.trader;
  }
}

async function refreshLiveStats() {
  const nodes = $$(".live-stats[data-mint]");
  await Promise.all(nodes.map(async (node) => {
    const mint = node.getAttribute("data-mint");
    if (!mint) {
      paintStats(node, { trades: null, trader: "" });
      return;
    }
    try {
      const dex = await loadDexTrades(mint);
      paintStats(node, { trades: dex.trades, trader: node.querySelector('[data-field="trader"]')?.title || "" });
      try {
        const trader = await loadTopTrader(mint, dex.pairAddress);
        paintStats(node, { trades: dex.trades, trader });
      } catch {
        paintStats(node, { trades: dex.trades, trader: "" });
      }
    } catch {
      paintStats(node, { trades: null, trader: "" });
    }
  }));
}

async function loadDesk() {
  try {
    const res = await fetch("data/desk.json", { cache: "no-store" });
    if (!res.ok) throw new Error("desk unavailable");
    return await res.json();
  } catch {
    return FALLBACK;
  }
}

async function boot() {
  tickClock();
  setInterval(tickClock, 15000);
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  bindZoom();
  bindDeskActions();

  const desk = await loadDesk();
  const essentials = desk.essentials || FALLBACK.essentials;
  const days = Array.isArray(desk.days) ? desk.days : [];
  const today = new Date().getDay();

  renderConstellation(essentials, days, today);
  renderFeature(essentials);
  renderSession(days, today);
  renderWeek(days, today);
  renderTicker(days);
  refreshLiveStats();
  setInterval(() => renderSession(days, today), 30000);
  setInterval(refreshLiveStats, 10000);
}

boot();
